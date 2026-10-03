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
  squad_id uuid references squads(id),
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
  squad_id uuid references squads(id),
  campus text,
  metadata jsonb,
  created_at timestamp default now()
);

-- INDEXES
CREATE INDEX idx_squads_code ON squads(code);
CREATE INDEX idx_events_event_name ON events(event_name);
CREATE INDEX idx_events_created_at ON events(created_at);
CREATE INDEX idx_events_source ON events(source);
CREATE INDEX idx_registrations_created_at ON registrations(created_at);
CREATE INDEX idx_registrations_source ON registrations(source);
CREATE INDEX idx_squad_members_squad_id ON squad_members(squad_id);

-- ROW LEVEL SECURITY (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE squads ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE squad_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Deny all public access. All sensitive reads/writes should go through secure server endpoints using service role.
-- Note: For demo purposes, we will rely entirely on the service_role key server-side.
CREATE POLICY "Deny all public reads" ON users FOR SELECT USING (false);
CREATE POLICY "Deny all public reads" ON squads FOR SELECT USING (false);
CREATE POLICY "Deny all public reads" ON registrations FOR SELECT USING (false);
CREATE POLICY "Deny all public reads" ON squad_members FOR SELECT USING (false);
CREATE POLICY "Deny all public reads" ON events FOR SELECT USING (false);
