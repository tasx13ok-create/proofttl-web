-- FOUNDRY-10 persistent control-plane schema.
-- This file is a checked-in source-of-truth snapshot for fresh environments.
-- Live production changes must still run through reviewed Supabase migrations.

create extension if not exists pgcrypto;

create table if not exists public.f10_agents (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  role text not null,
  objective text not null,
  status text not null default 'idle' check (status in ('idle','busy','blocked','paused')),
  current_task_id uuid,
  last_action text,
  revenue_influenced_cents bigint not null default 0,
  cost_used_cents bigint not null default 0,
  blocker text,
  confidence numeric(4,3) not null default 0.5 check (confidence between 0 and 1),
  notes jsonb not null default '{}'::jsonb,
  retry_policy jsonb not null default '{"max_attempts":2,"backoff_seconds":60}'::jsonb,
  escalation_path text not null default 'operator',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.f10_signals (
  id uuid primary key default gen_random_uuid(),
  source_type text not null,
  external_id text not null,
  url text not null,
  title text not null,
  excerpt text,
  author text,
  observed_at timestamptz not null default now(),
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique(source_type, external_id)
);

create table if not exists public.f10_experiments (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text not null,
  target_buyer text not null,
  why_pay text not null,
  monetization_method text not null,
  estimated_build_minutes integer not null default 60,
  estimated_margin_pct numeric(5,2) not null default 90,
  status text not null default 'idea' check (status in ('idea','queued','building','reviewing','approved','launched','tracking','scaling','killed')),
  risk_notes text,
  buyer_intent smallint not null default 5 check (buyer_intent between 0 and 10),
  speed_to_launch smallint not null default 5 check (speed_to_launch between 0 and 10),
  monetization_ease smallint not null default 5 check (monetization_ease between 0 and 10),
  competition smallint not null default 5 check (competition between 0 and 10),
  margin smallint not null default 5 check (margin between 0 and 10),
  compliance_risk smallint not null default 5 check (compliance_risk between 0 and 10),
  maintenance_burden smallint not null default 5 check (maintenance_burden between 0 and 10),
  distribution_difficulty smallint not null default 5 check (distribution_difficulty between 0 and 10),
  automation_potential smallint not null default 5 check (automation_potential between 0 and 10),
  first_dollar_speed smallint not null default 5 check (first_dollar_speed between 0 and 10),
  score numeric(6,2) not null default 0,
  launch_requires_approval boolean not null default true,
  price_cents integer,
  checkout_url text,
  revenue_cents bigint not null default 0,
  cost_cents bigint not null default 0,
  clicks bigint not null default 0,
  conversions bigint not null default 0,
  kill_reason text,
  source_signal_id uuid references public.f10_signals(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.f10_tasks (
  id uuid primary key default gen_random_uuid(),
  experiment_id uuid references public.f10_experiments(id) on delete cascade,
  title text not null,
  task_type text not null,
  state text not null default 'queued' check (state in ('queued','claimed','researching','validating','building','reviewing','launching','tracking','scaling','killed','done')),
  priority smallint not null default 5 check (priority between 0 and 10),
  important boolean not null default false,
  required_touches smallint not null default 1 check (required_touches between 1 and 2),
  touch_count smallint not null default 0,
  claimed_by uuid references public.f10_agents(id),
  reviewer_id uuid references public.f10_agents(id),
  input jsonb not null default '{}'::jsonb,
  output jsonb not null default '{}'::jsonb,
  confidence numeric(4,3),
  attempts smallint not null default 0,
  max_attempts smallint not null default 2,
  blocker text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);

do $$ begin
  if not exists (
    select 1 from pg_constraint where conname='f10_agents_current_task_id_fkey'
  ) then
    alter table public.f10_agents
      add constraint f10_agents_current_task_id_fkey
      foreign key (current_task_id) references public.f10_tasks(id) on delete set null;
  end if;
end $$;

create table if not exists public.f10_events (
  id bigserial primary key,
  experiment_id uuid references public.f10_experiments(id) on delete cascade,
  task_id uuid references public.f10_tasks(id) on delete cascade,
  agent_id uuid references public.f10_agents(id) on delete set null,
  event_type text not null,
  channel text,
  revenue_cents bigint not null default 0,
  cost_cents bigint not null default 0,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.f10_approvals (
  id uuid primary key default gen_random_uuid(),
  experiment_id uuid references public.f10_experiments(id) on delete cascade,
  task_id uuid references public.f10_tasks(id) on delete cascade,
  approval_type text not null check (approval_type in ('payment_link','public_listing','outbound_message','pricing_change','account_integration','launch')),
  status text not null default 'pending' check (status in ('pending','approved','rejected','expired')),
  request_payload jsonb not null default '{}'::jsonb,
  decision_note text,
  created_at timestamptz not null default now(),
  decided_at timestamptz
);

create table if not exists public.f10_artifacts (
  id uuid primary key default gen_random_uuid(),
  experiment_id uuid not null references public.f10_experiments(id) on delete cascade,
  task_id uuid references public.f10_tasks(id) on delete set null,
  artifact_type text not null check (artifact_type in ('strategy','product','listing','distribution','analytics')),
  version integer not null default 1 check (version > 0),
  status text not null default 'draft' check (status in ('draft','reviewed','approved','retired')),
  created_by_agent_id uuid references public.f10_agents(id) on delete set null,
  reviewed_by_agent_id uuid references public.f10_agents(id) on delete set null,
  content jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(task_id, artifact_type)
);

create table if not exists public.f10_settings (
  id boolean primary key default true check (id),
  paused boolean not null default false,
  spending_cap_cents bigint not null default 0,
  revenue_goal_cents bigint not null default 10000,
  risk_tolerance smallint not null default 2 check (risk_tolerance between 0 and 10),
  earned_revenue_cents bigint not null default 0,
  total_cost_cents bigint not null default 0,
  reinvestment_cap_cents bigint not null default 0,
  operator_key_hash text,
  last_scheduler_tick_at timestamptz,
  last_discovery_at timestamptz,
  updated_at timestamptz not null default now()
);
insert into public.f10_settings(id) values (true) on conflict (id) do nothing;

create or replace function public.f10_score_experiment(
  buyer_intent int, speed_to_launch int, monetization_ease int, competition int,
  margin int, compliance_risk int, maintenance_burden int,
  distribution_difficulty int, automation_potential int, first_dollar_speed int
) returns numeric
language sql immutable
set search_path = public, pg_temp
as $$
  select round((
    buyer_intent * 0.16 +
    speed_to_launch * 0.14 +
    monetization_ease * 0.14 +
    (10 - competition) * 0.08 +
    margin * 0.10 +
    (10 - compliance_risk) * 0.12 +
    (10 - maintenance_burden) * 0.06 +
    (10 - distribution_difficulty) * 0.08 +
    automation_potential * 0.05 +
    first_dollar_speed * 0.07
  ) * 10, 2)
$$;

create or replace function public.f10_apply_score()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  new.score := public.f10_score_experiment(
    new.buyer_intent,new.speed_to_launch,new.monetization_ease,new.competition,
    new.margin,new.compliance_risk,new.maintenance_burden,new.distribution_difficulty,
    new.automation_potential,new.first_dollar_speed
  );
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists f10_experiment_score_trigger on public.f10_experiments;
create trigger f10_experiment_score_trigger
before insert or update of buyer_intent,speed_to_launch,monetization_ease,competition,margin,compliance_risk,maintenance_burden,distribution_difficulty,automation_potential,first_dollar_speed
on public.f10_experiments
for each row execute function public.f10_apply_score();

create or replace function public.f10_refresh_governor()
returns void
language plpgsql
set search_path = public, pg_temp
as $$
declare rev bigint; costs bigint; cap bigint;
begin
  select coalesce(sum(revenue_cents),0), coalesce(sum(cost_cents),0)
  into rev,costs from public.f10_events;
  cap := case
    when rev <= 2500 then 0
    when rev <= 10000 then floor(rev * 0.20)
    when rev <= 50000 then floor(rev * 0.25)
    else floor(rev * 0.30)
  end;
  update public.f10_settings
  set earned_revenue_cents=rev,
      total_cost_cents=costs,
      reinvestment_cap_cents=greatest(0,cap-costs),
      updated_at=now()
  where id=true;
end;
$$;

create or replace function public.f10_operator_key_valid(p_hash text)
returns boolean language sql stable
set search_path = public, pg_temp
as $$
  select exists(select 1 from public.f10_settings where id=true and operator_key_hash=p_hash)
$$;

create or replace function public.f10_scheduler_claim()
returns boolean language plpgsql
set search_path = public, pg_temp
as $$
declare claimed boolean := false;
begin
  update public.f10_settings set last_scheduler_tick_at=now(),updated_at=now()
  where id=true and (last_scheduler_tick_at is null or last_scheduler_tick_at < now()-interval '10 minutes');
  get diagnostics claimed = row_count;
  return claimed;
end;
$$;

create or replace function public.f10_discovery_claim()
returns boolean language plpgsql
set search_path = public, pg_temp
as $$
declare claimed boolean := false;
begin
  update public.f10_settings set last_discovery_at=now(),updated_at=now()
  where id=true and (last_discovery_at is null or last_discovery_at < now()-interval '60 minutes');
  get diagnostics claimed = row_count;
  return claimed;
end;
$$;

alter table public.f10_agents enable row level security;
alter table public.f10_signals enable row level security;
alter table public.f10_experiments enable row level security;
alter table public.f10_tasks enable row level security;
alter table public.f10_events enable row level security;
alter table public.f10_approvals enable row level security;
alter table public.f10_artifacts enable row level security;
alter table public.f10_settings enable row level security;

revoke all on public.f10_agents,public.f10_signals,public.f10_experiments,public.f10_tasks,public.f10_events,public.f10_approvals,public.f10_artifacts,public.f10_settings from anon,authenticated;
grant select,insert,update,delete on public.f10_agents,public.f10_signals,public.f10_experiments,public.f10_tasks,public.f10_events,public.f10_approvals,public.f10_artifacts,public.f10_settings to service_role;
grant usage,select on sequence public.f10_events_id_seq to service_role;
grant execute on function public.f10_score_experiment(int,int,int,int,int,int,int,int,int,int) to service_role;
grant execute on function public.f10_refresh_governor() to service_role;
grant execute on function public.f10_operator_key_valid(text) to service_role;
grant execute on function public.f10_scheduler_claim() to service_role;
grant execute on function public.f10_discovery_claim() to service_role;
revoke all on function public.f10_score_experiment(int,int,int,int,int,int,int,int,int,int) from public,anon,authenticated;
revoke all on function public.f10_refresh_governor() from public,anon,authenticated;
revoke all on function public.f10_operator_key_valid(text) from public,anon,authenticated;
revoke all on function public.f10_scheduler_claim() from public,anon,authenticated;
revoke all on function public.f10_discovery_claim() from public,anon,authenticated;

create index if not exists f10_agents_current_task_idx on public.f10_agents(current_task_id);
create index if not exists f10_signals_observed_idx on public.f10_signals(observed_at desc);
create index if not exists f10_experiments_score_idx on public.f10_experiments(score desc);
create index if not exists f10_experiments_source_signal_idx on public.f10_experiments(source_signal_id);
create index if not exists f10_tasks_claimed_by_idx on public.f10_tasks(claimed_by);
create index if not exists f10_tasks_experiment_idx on public.f10_tasks(experiment_id);
create index if not exists f10_tasks_reviewer_idx on public.f10_tasks(reviewer_id);
create index if not exists f10_tasks_state_priority_idx on public.f10_tasks(state,priority desc,created_at);
create index if not exists f10_events_agent_idx on public.f10_events(agent_id);
create index if not exists f10_events_experiment_idx on public.f10_events(experiment_id);
create index if not exists f10_events_task_idx on public.f10_events(task_id);
create index if not exists f10_events_created_idx on public.f10_events(created_at desc);
create index if not exists f10_approvals_experiment_idx on public.f10_approvals(experiment_id);
create index if not exists f10_approvals_task_idx on public.f10_approvals(task_id);
create index if not exists f10_approvals_status_idx on public.f10_approvals(status,created_at desc);
create index if not exists f10_artifacts_experiment_idx on public.f10_artifacts(experiment_id,created_at desc);
create index if not exists f10_artifacts_task_idx on public.f10_artifacts(task_id);
create index if not exists f10_artifacts_status_idx on public.f10_artifacts(status,created_at desc);

insert into public.f10_agents(slug,name,role,objective) values
('scout-a','Opportunity Scout A','discovery','Find direct buyer pain with fast, truthful monetization paths.'),
('scout-b','Opportunity Scout B','cross-check','Independently challenge Scout A and reject weak demand signals.'),
('validator','Demand Validator','validation','Verify buyer intent, willingness to pay, competition, and distribution path.'),
('strategist','Product Strategist','strategy','Turn validated pain into the smallest monetizable experiment.'),
('builder-a','Builder Agent A','build','Build the first working version with minimal cost and scope.'),
('builder-b','Builder Agent B','review','Review Builder A output, test failure modes, and patch defects.'),
('sales','Listing / Sales Agent','sales','Draft truthful offer pages, pricing, and purchase flows.'),
('distribution','Distribution Agent','distribution','Create compliant distribution experiments without spam or impersonation.'),
('finance','Analytics / Finance Agent','analytics','Track realized revenue, cost, margin, conversion, and first-dollar speed.'),
('risk','Risk / Kill / Compliance Agent','risk','Block unsafe or misleading experiments and enforce kill/approval rules.')
on conflict (slug) do nothing;

notify pgrst,'reload schema';
