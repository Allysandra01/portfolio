# Database Brief — Bootcamp Reporting Service

The service stores daily aggregates from the bootcamp exercise runner. It is
deployed on a single small VM in the DICT staging VPC. Connections are
limited to the bootcamp runner and the Grafana instance on the same VPC.

Requirements:

- PostgreSQL 16
- Hostname is set by the environment, never hard-coded
- Listen port 5432
- Database name is `bootcamp_reports`
- Username is `reports_writer`
- The password lives in an environment variable, not in the config file
- Connection pool sized for low traffic: minimum 1, maximum 5 connections
- SSL is required, no exception
- Statement timeout is 30 seconds to keep runaway queries from blocking the
  pool
- Application name is `bootcamp_reports_app` so the DBA can see who is
  connected
