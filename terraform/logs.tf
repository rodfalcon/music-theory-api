# ---------------------------------------------------------------------------
# CloudWatch → Datadog Forwarder subscriptions
#
# The Forwarder Lambda already has permission to be invoked by any log group
# (source_arn = arn:aws:logs:...:log-group:*:*) so we only need subscription
# filters here — no extra aws_lambda_permission resources required.
#
# Filter pattern "" forwards every log line.
# ---------------------------------------------------------------------------

locals {
  forwarder_arn = module.datadog_forwarder.datadog_forwarder_arn
}

resource "aws_cloudwatch_log_subscription_filter" "backend" {
  name            = "${local.name_prefix}-backend-to-datadog"
  log_group_name  = aws_cloudwatch_log_group.backend.name
  filter_pattern  = ""
  destination_arn = local.forwarder_arn
}

resource "aws_cloudwatch_log_subscription_filter" "frontend" {
  name            = "${local.name_prefix}-frontend-to-datadog"
  log_group_name  = aws_cloudwatch_log_group.frontend.name
  filter_pattern  = ""
  destination_arn = local.forwarder_arn
}

resource "aws_cloudwatch_log_subscription_filter" "dd_agent" {
  name            = "${local.name_prefix}-dd-agent-to-datadog"
  log_group_name  = aws_cloudwatch_log_group.dd_agent.name
  filter_pattern  = ""
  destination_arn = local.forwarder_arn
}
