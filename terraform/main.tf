terraform {
  required_version = ">= 1.5"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region  = var.aws_region
  profile = var.aws_profile

  default_tags {
    tags = local.common_tags
  }
}

locals {
  common_tags = {
    creator                  = "rodrigo.falcao"
    team                     = "technical-support-engineering"
    service                  = "noteflow"
    please_keep_my_resource  = "true"
  }

  name_prefix = "rodrigo-falcao-noteflow"
}
