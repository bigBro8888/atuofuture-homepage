-- PostgreSQL 生产数据模型。当前开发环境默认使用 server/data/store.json，
-- 接入 DATABASE_URL 后应由数据访问层映射至以下表结构。
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS citext;

CREATE TABLE IF NOT EXISTS apps (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  icon_url text NOT NULL DEFAULT '',
  ios_store_url text NOT NULL DEFAULT '',
  privacy_url text NOT NULL DEFAULT '',
  terms_url text NOT NULL DEFAULT '',
  published boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS app_releases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id text NOT NULL REFERENCES apps(id),
  version varchar(64) NOT NULL,
  notes text NOT NULL DEFAULT '',
  apk_url text NOT NULL,
  file_size bigint NOT NULL,
  sha256 char(64) NOT NULL,
  status varchar(24) NOT NULL,
  published_at timestamptz,
  published_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (app_id, version)
);

CREATE TABLE IF NOT EXISTS app_page_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id text NOT NULL REFERENCES apps(id),
  locale varchar(16) NOT NULL DEFAULT 'zh-CN',
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email citext UNIQUE NOT NULL,
  name text NOT NULL,
  password_hash text NOT NULL,
  role varchar(32) NOT NULL,
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS download_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id text NOT NULL REFERENCES apps(id),
  event varchar(32) NOT NULL,
  platform varchar(16) NOT NULL,
  browser varchar(32) NOT NULL,
  source text NOT NULL DEFAULT 'direct',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS download_events_app_created_idx ON download_events (app_id, created_at DESC);

CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  user_email text NOT NULL,
  action varchar(80) NOT NULL,
  target text NOT NULL,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS audit_logs_created_idx ON audit_logs (created_at DESC);
