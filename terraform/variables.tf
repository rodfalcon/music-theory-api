variable "aws_region" {
  description = "AWS region to deploy into"
  type        = string
  default     = "us-east-1"
}

variable "aws_profile" {
  description = "AWS CLI profile to use"
  type        = string
  default     = "rodrigo-falcao-sandbox"
}

variable "dd_api_key" {
  description = "Datadog API key for the agent"
  type        = string
  sensitive   = true
}

variable "dd_site" {
  description = "Datadog site (e.g. datadoghq.com)"
  type        = string
  default     = "datadoghq.com"
}

variable "db_password" {
  description = "Password for the RDS noteflow user"
  type        = string
  sensitive   = true
}
