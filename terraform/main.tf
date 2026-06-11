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

  # Shell script run as a one-off Fargate task to set up the Datadog DBM user.
  # In Terraform heredocs: $$ → literal $, so $$DD_PGPASSWORD → $DD_PGPASSWORD at runtime.
  # PostgreSQL dollar-quoting $$ is written as $$$$ here → produces $$ in the output.
  dbm_setup_script = <<-EOT
    set -e
    echo "==> Checking DB connection..."
    psql -c "SELECT 1" > /dev/null
    echo "==> Dropping and recreating datadog user cleanly..."
    psql -c "REVOKE pg_monitor FROM datadog" 2>&1 || true
    psql -c "REVOKE ALL ON SCHEMA datadog FROM datadog" 2>&1 || true
    psql -c "REVOKE ALL ON ALL TABLES IN SCHEMA public FROM datadog" 2>&1 || true
    psql -c "DROP USER IF EXISTS datadog"
    psql -c "CREATE USER datadog WITH PASSWORD '$$DD_PGPASSWORD' LOGIN"
    echo "==> Verifying datadog password (testing connection)..."
    PGUSER=datadog PGPASSWORD="$$DD_PGPASSWORD" PGDATABASE=postgres psql -c "SELECT 1 AS datadog_auth_ok" 2>&1
    psql -c "DROP USER IF EXISTS debuguser" 2>&1 || true
    psql -c "DROP USER IF EXISTS testscram" 2>&1 || true
    psql -c "DROP USER IF EXISTS dd_monitoring" 2>&1 || true
    psql -c "DROP USER IF EXISTS testpw2" 2>&1 || true
    psql -c "DROP USER IF EXISTS datadog2" 2>&1 || true
    psql -c "GRANT pg_monitor TO datadog"
    psql -c "CREATE SCHEMA IF NOT EXISTS datadog"
    psql -c "GRANT USAGE ON SCHEMA datadog TO datadog"
    psql -c "GRANT CREATE ON SCHEMA datadog TO datadog"
    psql -c "CREATE EXTENSION IF NOT EXISTS pg_stat_statements"
    psql -c "CREATE OR REPLACE FUNCTION datadog.explain_statement(l_query TEXT, OUT explain JSON) RETURNS SETOF JSON AS \$plpgsql\$DECLARE curs REFCURSOR; plan JSON; BEGIN OPEN curs FOR EXECUTE pg_catalog.concat('EXPLAIN (FORMAT JSON) ', l_query); FETCH curs INTO plan; CLOSE curs; RETURN QUERY SELECT plan; END;\$plpgsql\$ LANGUAGE plpgsql RETURNS NULL ON NULL INPUT SECURITY DEFINER"
    echo "==> Creating datadog schema and explain function in postgres database..."
    PGDATABASE=postgres psql -c "CREATE SCHEMA IF NOT EXISTS datadog"
    PGDATABASE=postgres psql -c "GRANT USAGE ON SCHEMA datadog TO datadog"
    PGDATABASE=postgres psql -c "CREATE OR REPLACE FUNCTION datadog.explain_statement(l_query TEXT, OUT explain JSON) RETURNS SETOF JSON AS \$plpgsql\$DECLARE curs REFCURSOR; plan JSON; BEGIN OPEN curs FOR EXECUTE pg_catalog.concat('EXPLAIN (FORMAT JSON) ', l_query); FETCH curs INTO plan; CLOSE curs; RETURN QUERY SELECT plan; END;\$plpgsql\$ LANGUAGE plpgsql RETURNS NULL ON NULL INPUT SECURITY DEFINER"
    echo "==> DBM setup complete!"
  EOT
}
