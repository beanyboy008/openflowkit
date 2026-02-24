-- OpenFlowKit: Supabase schema for cloud persistence
-- Applied via MCP on 2026-02-20

create table flows (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null default 'Untitled Flow',
  nodes jsonb not null default '[]',
  edges jsonb not null default '[]',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table flows enable row level security;
create policy "Users can CRUD own flows" on flows
  for all using (auth.uid() = user_id);

create table user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  design_systems jsonb default '[]',
  active_design_system_id text default 'default',
  view_settings jsonb default '{}',
  global_edge_options jsonb default '{}',
  brand_config jsonb default '{}',
  brand_kits jsonb default '[]',
  active_brand_kit_id text,
  updated_at timestamptz default now()
);

alter table user_settings enable row level security;
create policy "Users can CRUD own settings" on user_settings
  for all using (auth.uid() = user_id);

-- Add archived_at column for soft-delete (archive) support
-- Flows with archived_at IS NULL are active; flows with a timestamp are archived.
-- Run this migration separately if the flows table already exists:
-- ALTER TABLE flows ADD COLUMN archived_at timestamptz DEFAULT NULL;
