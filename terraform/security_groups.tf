resource "aws_security_group" "alb" {
  name   = "${local.name_prefix}-alb"
  vpc_id = data.aws_vpc.main.id

  ingress {
    from_port       = 80
    to_port         = 80
    protocol        = "tcp"
    prefix_list_ids = [data.aws_ec2_managed_prefix_list.cloudfront.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "${local.name_prefix}-alb" }
}

resource "aws_security_group" "backend" {
  name   = "${local.name_prefix}-backend"
  vpc_id = data.aws_vpc.main.id

  ingress {
    from_port       = 8081
    to_port         = 8081
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "${local.name_prefix}-backend" }
}

resource "aws_security_group" "frontend" {
  name   = "${local.name_prefix}-frontend"
  vpc_id = data.aws_vpc.main.id

  ingress {
    from_port       = 80
    to_port         = 80
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "${local.name_prefix}-frontend" }
}

resource "aws_security_group" "rds" {
  name   = "${local.name_prefix}-rds"
  vpc_id = data.aws_vpc.main.id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.backend.id]
  }

  tags = { Name = "${local.name_prefix}-rds" }
}
