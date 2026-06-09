resource "aws_db_subnet_group" "main" {
  name       = "${local.name_prefix}-db"
  subnet_ids = data.aws_subnets.public.ids

  tags = { Name = "${local.name_prefix}-db" }
}

resource "aws_db_instance" "main" {
  identifier        = "${local.name_prefix}-postgres"
  engine            = "postgres"
  engine_version    = "16.3"
  instance_class    = "db.t3.micro"
  allocated_storage = 20
  storage_type      = "gp2"

  db_name  = "noteflow"
  username = "noteflow"
  password = var.db_password

  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]

  # Performance Insights required for DBM
  performance_insights_enabled = true

  skip_final_snapshot     = true
  backup_retention_period = 0
  deletion_protection     = false

  tags = { Name = "${local.name_prefix}-postgres" }
}

# SSM parameters — ECS task definitions reference these as secrets (never in plaintext env vars)
resource "aws_ssm_parameter" "db_password" {
  name  = "/noteflow/db_password"
  type  = "SecureString"
  value = var.db_password
}

resource "aws_ssm_parameter" "dd_api_key" {
  name  = "/noteflow/dd_api_key"
  type  = "SecureString"
  value = var.dd_api_key
}

resource "aws_ssm_parameter" "datadog_password" {
  name  = "/noteflow/datadog_password"
  type  = "SecureString"
  value = var.datadog_password
}

# Full postgres check config injected into the DD agent via DD_CHECKS env var.
# Password is stored here so it never appears as plaintext in the task definition.
resource "aws_ssm_parameter" "dd_checks" {
  name = "/noteflow/dd_checks"
  type = "SecureString"
  value = jsonencode({
    postgres = {
      instances = [{
        host              = aws_db_instance.main.address
        port              = 5432
        username          = "datadog"
        password          = var.datadog_password
        dbm               = true
        reported_hostname = "noteflow-postgres"
        query_samples     = { enabled = true }
        query_metrics     = { enabled = true }
      }]
    }
  })
}
