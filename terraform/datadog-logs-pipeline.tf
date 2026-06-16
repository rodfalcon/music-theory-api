resource "datadog_logs_custom_pipeline" "backend" {
  name       = "NoteFlow Backend (ECS)"
  is_enabled = true

  filter {
    query = "@aws.cloudwatch.log_group:\"/ecs/rodrigo-falcao-noteflow/backend\""
  }

  processor {
    string_builder_processor {
      name               = "Set source to java"
      is_enabled         = true
      template           = "java"
      target             = "ddsource"
      is_replace_missing = true
    }
  }

  processor {
    string_builder_processor {
      name               = "Set service to music-theory-api"
      is_enabled         = true
      template           = "music-theory-api"
      target             = "service"
      is_replace_missing = true
    }
  }
}
