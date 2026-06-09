-- One-time DBM setup: run as the noteflow (admin) user against the noteflow database.
-- Replace <DATADOG_PASSWORD> with the value of TF_VAR_datadog_password before running.
--
-- How to run:
--   1. make dbm-open      (temporarily adds your IP to the RDS SG)
--   2. psql -h <rds_endpoint> -U noteflow -d noteflow
--   3. \i terraform/dbm-setup.sql   (or paste contents)
--   4. make dbm-close     (removes your IP from the RDS SG)

CREATE USER datadog WITH PASSWORD 'Liam&Erin';
GRANT pg_monitor TO datadog;

CREATE SCHEMA IF NOT EXISTS datadog;
GRANT USAGE  ON SCHEMA datadog TO datadog;
GRANT CREATE ON SCHEMA datadog TO datadog;

-- Required for DBM query explain plans
CREATE OR REPLACE FUNCTION datadog.explain_statement(
  l_query TEXT,
  OUT explain JSON
) RETURNS SETOF JSON AS
$$
DECLARE
  curs REFCURSOR;
  plan JSON;
BEGIN
  OPEN curs FOR EXECUTE pg_catalog.concat('EXPLAIN (FORMAT JSON) ', l_query);
  FETCH curs INTO plan;
  CLOSE curs;
  RETURN QUERY SELECT plan;
END;
$$
LANGUAGE 'plpgsql'
RETURNS NULL ON NULL INPUT
SECURITY DEFINER;

-- Enable query stats (RDS PostgreSQL 16 loads this by default)
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;
