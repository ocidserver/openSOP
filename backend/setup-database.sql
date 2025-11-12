-- Setup Database untuk SOP Management System
-- PostgreSQL 17

-- Create user jika belum ada
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_user WHERE usename = 'sop_user') THEN
    CREATE USER sop_user WITH PASSWORD 'sop_password_2025';
  END IF;
END
$$;

-- Create database jika belum ada
SELECT 'CREATE DATABASE sop_db OWNER sop_user'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'sop_db')\gexec

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE sop_db TO sop_user;

-- Connect to sop_db and grant schema privileges
\c sop_db

-- Grant privileges on public schema
GRANT ALL ON SCHEMA public TO sop_user;

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO sop_user;

GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO sop_user;

-- Set default privileges for future objects
ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT ALL ON TABLES TO sop_user;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT ALL ON SEQUENCES TO sop_user;

-- Display confirmation
\echo ''
\echo '✓ Database setup completed!'
\echo '✓ Database: sop_db'
\echo '✓ User: sop_user'
\echo '✓ Password: sop_password_2025'
\echo ''
\echo 'Connection string:'
\echo 'postgresql://sop_user:sop_password_2025@localhost:5432/sop_db'
\echo ''