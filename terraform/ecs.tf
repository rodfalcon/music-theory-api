resource "aws_ecs_cluster" "main" {
  name = local.name_prefix

  setting {
    name  = "containerInsights"
    value = "enabled"
  }
}

# --- IAM ---

data "aws_iam_policy_document" "ecs_assume_role" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "task_execution" {
  name               = "${local.name_prefix}-task-execution"
  assume_role_policy = data.aws_iam_policy_document.ecs_assume_role.json
}

resource "aws_iam_role_policy_attachment" "task_execution" {
  role       = aws_iam_role.task_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# Allow task execution role to read SSM secrets
resource "aws_iam_role_policy" "task_execution_ssm" {
  name = "ssm-secrets"
  role = aws_iam_role.task_execution.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = ["ssm:GetParameters", "kms:Decrypt"]
      Resource = ["arn:aws:ssm:${var.aws_region}:*:parameter/noteflow/*"]
    }]
  })
}

resource "aws_iam_role" "task" {
  name               = "${local.name_prefix}-task"
  assume_role_policy = data.aws_iam_policy_document.ecs_assume_role.json
}

resource "aws_iam_role_policy" "task_logs" {
  name = "cloudwatch-logs"
  role = aws_iam_role.task.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = ["logs:CreateLogStream", "logs:PutLogEvents"]
      Resource = "*"
    }]
  })
}

resource "aws_iam_role_policy" "task_exec_command" {
  name = "ecs-exec"
  role = aws_iam_role.task.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = [
        "ssmmessages:CreateControlChannel",
        "ssmmessages:CreateDataChannel",
        "ssmmessages:OpenControlChannel",
        "ssmmessages:OpenDataChannel",
      ]
      Resource = "*"
    }]
  })
}

# --- CloudWatch Log Groups ---

resource "aws_cloudwatch_log_group" "backend" {
  name              = "/ecs/${local.name_prefix}/backend"
  retention_in_days = 7
}

resource "aws_cloudwatch_log_group" "frontend" {
  name              = "/ecs/${local.name_prefix}/frontend"
  retention_in_days = 7
}

resource "aws_cloudwatch_log_group" "dd_agent" {
  name              = "/ecs/${local.name_prefix}/dd-agent"
  retention_in_days = 7
}

# --- DBM Migration Task Definition ---
# One-off Fargate task: run `make dbm-migrate` after initial deploy.
# Uses the backend SG so it can reach RDS without any public exposure.

resource "aws_cloudwatch_log_group" "migrate" {
  name              = "/ecs/${local.name_prefix}/migrate"
  retention_in_days = 7
}

resource "aws_ecs_task_definition" "migrate" {
  family                   = "${local.name_prefix}-migrate"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = aws_iam_role.task_execution.arn

  container_definitions = jsonencode([{
    name      = "migrate"
    image     = "postgres:16-alpine"
    essential = true

    environment = [
      { name = "PGHOST",     value = aws_db_instance.main.address },
      { name = "PGPORT",     value = "5432" },
      { name = "PGUSER",     value = "noteflow" },
      { name = "PGDATABASE", value = "noteflow" },
    ]

    secrets = [
      { name = "PGPASSWORD",    valueFrom = aws_ssm_parameter.db_password.arn },
      { name = "DD_PGPASSWORD", valueFrom = aws_ssm_parameter.datadog_password.arn },
    ]

    command = ["/bin/sh", "-c", local.dbm_setup_script]

    logConfiguration = {
      logDriver = "awslogs"
      options = {
        awslogs-group         = "/ecs/${local.name_prefix}/migrate"
        awslogs-region        = var.aws_region
        awslogs-stream-prefix = "migrate"
      }
    }
  }])
}

# --- Backend Task Definition ---
# Containers: Spring Boot app + Datadog agent sidecar + Kafka sidecar

resource "aws_ecs_task_definition" "backend" {
  family                   = "${local.name_prefix}-backend"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "1024"
  memory                   = "2048"
  execution_role_arn       = aws_iam_role.task_execution.arn
  task_role_arn            = aws_iam_role.task.arn

  container_definitions = jsonencode([
    {
      name      = "backend"
      image     = "${aws_ecr_repository.backend.repository_url}:latest"
      essential = true

      portMappings = [{ containerPort = 8081, protocol = "tcp" }]

      environment = [
        { name = "SPRING_DATASOURCE_URL", value = "jdbc:postgresql://${aws_db_instance.main.address}:5432/noteflow" },
        { name = "SPRING_DATASOURCE_USERNAME", value = "noteflow" },
        { name = "SPRING_KAFKA_BOOTSTRAP_SERVERS", value = "localhost:9092" },
        { name = "DD_AGENT_HOST", value = "localhost" },
        { name = "DD_TRACE_AGENT_PORT", value = "8126" },
        { name = "DD_SERVICE", value = "music-theory-api" },
        { name = "DD_ENV", value = "production" },
        { name = "DD_VERSION", value = var.dd_version },
        { name = "DD_LOGS_INJECTION", value = "true" },
        { name = "DD_PROFILING_ENABLED", value = "false" },
        { name = "DD_DBM_PROPAGATION_MODE", value = "full" },
      ]

      secrets = [
        { name = "SPRING_DATASOURCE_PASSWORD", valueFrom = aws_ssm_parameter.db_password.arn },
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = aws_cloudwatch_log_group.backend.name
          awslogs-region        = var.aws_region
          awslogs-stream-prefix = "backend"
        }
      }

      healthCheck = {
        command     = ["CMD-SHELL", "curl -f http://localhost:8081/api/chords/C || exit 1"]
        interval    = 30
        timeout     = 10
        retries     = 3
        startPeriod = 60
      }
    },
    {
      name      = "datadog-agent"
      image     = "public.ecr.aws/datadog/agent:latest"
      essential = false

      portMappings = [
        { containerPort = 8126, protocol = "tcp" },
        { containerPort = 8125, protocol = "udp" },
      ]

      environment = [
        { name = "ECS_FARGATE", value = "true" },
        { name = "DD_SITE", value = var.dd_site },
        { name = "DD_APM_ENABLED", value = "true" },
        { name = "DD_LOGS_ENABLED", value = "true" },
        { name = "DD_DOGSTATSD_NON_LOCAL_TRAFFIC", value = "true" },
      ]

      secrets = [
        { name = "DD_API_KEY",            valueFrom = aws_ssm_parameter.dd_api_key.arn },
        { name = "DD_POSTGRES_PASSWORD",  valueFrom = aws_ssm_parameter.datadog_password.arn },
      ]

      dockerLabels = {
        "com.datadoghq.ad.check_names"  = jsonencode(["postgres"])
        "com.datadoghq.ad.init_configs" = jsonencode([{}])
        "com.datadoghq.ad.instances"    = "[{\"host\":\"${aws_db_instance.main.address}\",\"port\":5432,\"username\":\"datadog\",\"password\":\"%%env_DD_POSTGRES_PASSWORD%%\",\"dbname\":\"noteflow\",\"dbm\":true,\"ssl\":\"require\",\"reported_hostname\":\"noteflow-postgres\",\"query_samples\":{\"enabled\":true},\"query_metrics\":{\"enabled\":true}}]"
      }

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = aws_cloudwatch_log_group.dd_agent.name
          awslogs-region        = var.aws_region
          awslogs-stream-prefix = "dd-agent"
        }
      }
    },
    {
      name      = "kafka"
      image     = "apache/kafka:3.7.0"
      essential = false

      portMappings = [{ containerPort = 9092, protocol = "tcp" }]

      environment = [
        { name = "KAFKA_NODE_ID", value = "1" },
        { name = "KAFKA_PROCESS_ROLES", value = "broker,controller" },
        { name = "KAFKA_LISTENERS", value = "PLAINTEXT://:9092,CONTROLLER://:9093" },
        { name = "KAFKA_ADVERTISED_LISTENERS", value = "PLAINTEXT://localhost:9092" },
        { name = "KAFKA_CONTROLLER_QUORUM_VOTERS", value = "1@localhost:9093" },
        { name = "KAFKA_CONTROLLER_LISTENER_NAMES", value = "CONTROLLER" },
        { name = "KAFKA_LISTENER_SECURITY_PROTOCOL_MAP", value = "PLAINTEXT:PLAINTEXT,CONTROLLER:PLAINTEXT" },
        { name = "KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR", value = "1" },
        { name = "KAFKA_AUTO_CREATE_TOPICS_ENABLE", value = "true" },
      ]
    }
  ])
}

# --- Frontend Task Definition ---

resource "aws_ecs_task_definition" "frontend" {
  family                   = "${local.name_prefix}-frontend"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = aws_iam_role.task_execution.arn
  task_role_arn            = aws_iam_role.task.arn

  container_definitions = jsonencode([
    {
      name      = "frontend"
      image     = "${aws_ecr_repository.frontend.repository_url}:latest"
      essential = true

      portMappings = [{ containerPort = 80, protocol = "tcp" }]

      environment = [
        # The React app uses this to proxy /api calls — ALB DNS resolves internally
        { name = "REACT_APP_API_URL", value = "" },
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = aws_cloudwatch_log_group.frontend.name
          awslogs-region        = var.aws_region
          awslogs-stream-prefix = "frontend"
        }
      }
    }
  ])
}

# --- ECS Services ---

resource "aws_ecs_service" "backend" {
  name                   = "${local.name_prefix}-backend"
  cluster                = aws_ecs_cluster.main.id
  task_definition        = aws_ecs_task_definition.backend.arn
  desired_count          = 1
  launch_type            = "FARGATE"
  enable_execute_command = true

  network_configuration {
    subnets          = data.aws_subnets.public.ids
    security_groups  = [aws_security_group.backend.id]
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.backend.arn
    container_name   = "backend"
    container_port   = 8081
  }

  depends_on = [aws_lb_listener_rule.api]

  lifecycle {
    ignore_changes = [task_definition]
  }
}

resource "aws_ecs_service" "frontend" {
  name            = "${local.name_prefix}-frontend"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.frontend.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = data.aws_subnets.public.ids
    security_groups  = [aws_security_group.frontend.id]
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.frontend.arn
    container_name   = "frontend"
    container_port   = 80
  }

  depends_on = [aws_lb_listener.http]

  lifecycle {
    ignore_changes = [task_definition]
  }
}
