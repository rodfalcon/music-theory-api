output "app_url" {
  description = "Public HTTPS URL of the NoteFlow application (via CloudFront)"
  value       = "https://${aws_cloudfront_distribution.main.domain_name}"
}

output "alb_url" {
  description = "Direct ALB URL (restricted to CloudFront IPs — not directly accessible)"
  value       = "http://${aws_lb.main.dns_name}"
}

output "ecr_backend_url" {
  description = "ECR repository URL for the backend image"
  value       = aws_ecr_repository.backend.repository_url
}

output "ecr_frontend_url" {
  description = "ECR repository URL for the frontend image"
  value       = aws_ecr_repository.frontend.repository_url
}

output "rds_endpoint" {
  description = "RDS PostgreSQL endpoint (host only, no port)"
  value       = aws_db_instance.main.address
}

output "push_commands" {
  description = "Commands to push images to ECR after terraform apply"
  value       = <<-EOT
    aws ecr get-login-password --region ${var.aws_region} --profile ${var.aws_profile} | docker login --username AWS --password-stdin ${aws_ecr_repository.backend.repository_url}
    docker tag music-theory-api:0.1.0 ${aws_ecr_repository.backend.repository_url}:latest
    docker push ${aws_ecr_repository.backend.repository_url}:latest
    docker tag noteflow-frontend:latest ${aws_ecr_repository.frontend.repository_url}:latest
    docker push ${aws_ecr_repository.frontend.repository_url}:latest
  EOT
}
