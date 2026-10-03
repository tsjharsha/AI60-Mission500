-- schema.sql

CREATE TABLE users (
  id uuid primary key,
  name text,
  college text,
  branch text,
  graduation_year text,
  target_role text,
  skills jsonb,
  ai_experience text,
  placement_confidence text,
  archetype text,
  ai_readiness_score integer,
  recommended_project jsonb,
  squad_role text,
  created_at timestamp default now()
);

CREATE TABLE squads (
  id uuid primary key,
  code text unique,
  created_by uuid references users(id),
  project_name text,
  created_at timestamp default now()
);

CREATE TABLE registrations (
  id uuid primary key,
  user_id uuid references users(id),
  email text,
  phone text,
  builder_number integer,
  source text,
  referrer_user_id uuid references users(id),
  squad_id text,
  created_at timestamp default now()
);

CREATE TABLE squad_members (
  id uuid primary key,
  squad_id uuid references squads(id),
  user_id uuid references users(id),
  role text,
  joined_at timestamp default now(),
  unique (squad_id, user_id)
);

CREATE TABLE events (
  id uuid primary key default gen_random_uuid(),
  anonymous_id text,
  user_id uuid references users(id),
  event_name text,
  source text,
  referrer_user_id uuid references users(id),
  squad_id text,
  campus text,
  metadata jsonb,
  created_at timestamp default now()
);
