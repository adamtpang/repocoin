-- repocoin prototype schema.
-- Prototype points only. Not money. Not a token you can sell.
-- No real-money token, no payments, no mainnet chain.
--
-- All writes go through the server with the service role key. The anon key
-- can only read the public tables (constitutions, ledgers, credits, bonds).

create extension if not exists pgcrypto;

-- People, keyed by GitHub account. One GitHub account per contributor in the
-- MVP (sybil basics from docs/spec.md).
create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  github_user_id bigint not null unique,
  github_login text not null,
  created_at timestamptz not null default now()
);

-- A repo connected through the GitHub App. Only someone with admin rights on
-- the repo can install the App on it, which is the proof of maintainership.
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  github_repo_id bigint not null unique,
  owner text not null,
  repo text not null,
  default_branch text not null default 'main',
  installation_id bigint,
  installer_github_user_id bigint,
  installer_login text,
  connected boolean not null default true,
  constitution_markdown text not null,
  constitution_updated_at timestamptz not null default now(),
  -- Parameters. Every one is a starting assumption until Adam sets it.
  points_per_merge integer not null default 100 check (points_per_merge > 0),
  vest_months integer not null default 12 check (vest_months > 0),
  cliff_months integer not null default 1 check (cliff_months >= 0),
  dispute_window_days integer not null default 7 check (dispute_window_days >= 0),
  min_reputation_to_bond integer not null default 3 check (min_reputation_to_bond >= 0),
  created_at timestamptz not null default now()
);

create unique index projects_owner_repo_idx on public.projects (lower(owner), lower(repo));

-- Every webhook delivery id is claimed once. A redelivery of the same id is a
-- no-op. This is the first idempotency guard.
create table public.webhook_deliveries (
  delivery_id text primary key,
  event text not null,
  status text not null default 'processing' check (status in ('processing', 'processed')),
  outcome text,
  received_at timestamptz not null default now()
);

-- One row per credited merged PR. The unique key on
-- (project_id, pr_number, merge_commit_sha) is the second idempotency guard.
create table public.pull_credits (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  pr_number integer not null,
  merge_commit_sha text not null,
  title text not null default '',
  author_github_user_id bigint not null,
  author_login text not null,
  reviewer_github_user_id bigint not null,
  reviewer_login text not null,
  merged_at timestamptz not null,
  points integer not null check (points > 0),
  status text not null default 'vesting' check (status in ('vesting', 'voided')),
  dispute_ends_at timestamptz not null,
  vest_start_at timestamptz not null,
  cliff_at timestamptz not null,
  vest_end_at timestamptz not null,
  voided_at timestamptz,
  void_reason text,
  voided_by_login text,
  delivery_id text not null,
  created_at timestamptz not null default now(),
  -- Self-approval can never be credited, even by a buggy caller.
  constraint pull_credits_no_self_approval check (author_github_user_id <> reviewer_github_user_id),
  constraint pull_credits_project_pr_sha_key unique (project_id, pr_number, merge_commit_sha)
);

-- Append-only ledger. Two ledgers share one table, split by `ledger`:
--   token_points: prototype points standing in for a future transferable
--                 token. NOT transferable in the prototype.
--   reputation:   nontransferable, ever.
create table public.ledger_entries (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  ledger text not null check (ledger in ('token_points', 'reputation')),
  github_user_id bigint not null,
  github_login text not null,
  amount integer not null,
  reason text not null,
  pull_credit_id uuid references public.pull_credits (id) on delete set null,
  created_at timestamptz not null default now()
);

create index ledger_entries_project_idx on public.ledger_entries (project_id, ledger);

-- Role bonds. Mocked in the database only. A bond is posted for a role
-- (reviewer, steward); it does not buy merge or write access.
create table public.role_bonds (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  github_user_id bigint not null,
  github_login text not null,
  role text not null check (role in ('reviewer', 'steward')),
  bond_points integer not null check (bond_points > 0),
  status text not null default 'active' check (status in ('active', 'released', 'slashed')),
  status_reason text,
  created_at timestamptz not null default now()
);

create unique index role_bonds_one_active_idx
  on public.role_bonds (project_id, github_user_id, role)
  where status = 'active';

create table public.audit_log (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects (id) on delete cascade,
  action text not null,
  actor_login text,
  detail jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Atomic credit: inserts the credit, both ledger entries, and the audit row in
-- one transaction. Returns null when the (project, pr, sha) credit already
-- exists, so a second delivery cannot double-credit.
create or replace function public.credit_merge(
  p_project_id uuid,
  p_pr_number integer,
  p_merge_commit_sha text,
  p_title text,
  p_author_id bigint,
  p_author_login text,
  p_reviewer_id bigint,
  p_reviewer_login text,
  p_merged_at timestamptz,
  p_points integer,
  p_dispute_ends_at timestamptz,
  p_vest_start_at timestamptz,
  p_cliff_at timestamptz,
  p_vest_end_at timestamptz,
  p_delivery_id text
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  insert into pull_credits (
    project_id, pr_number, merge_commit_sha, title,
    author_github_user_id, author_login, reviewer_github_user_id, reviewer_login,
    merged_at, points, dispute_ends_at, vest_start_at, cliff_at, vest_end_at, delivery_id
  ) values (
    p_project_id, p_pr_number, p_merge_commit_sha, p_title,
    p_author_id, p_author_login, p_reviewer_id, p_reviewer_login,
    p_merged_at, p_points, p_dispute_ends_at, p_vest_start_at, p_cliff_at, p_vest_end_at, p_delivery_id
  )
  on conflict (project_id, pr_number, merge_commit_sha) do nothing
  returning id into v_id;

  if v_id is null then
    return null;
  end if;

  insert into profiles (github_user_id, github_login)
  values (p_author_id, p_author_login), (p_reviewer_id, p_reviewer_login)
  on conflict (github_user_id) do update set github_login = excluded.github_login;

  insert into ledger_entries (project_id, ledger, github_user_id, github_login, amount, reason, pull_credit_id)
  values
    (p_project_id, 'token_points', p_author_id, p_author_login, p_points, 'Merged PR #' || p_pr_number || ' (vesting grant)', v_id),
    (p_project_id, 'reputation', p_author_id, p_author_login, 1, 'Authored merged PR #' || p_pr_number, v_id),
    (p_project_id, 'reputation', p_reviewer_id, p_reviewer_login, 1, 'Approved merged PR #' || p_pr_number, v_id);

  insert into audit_log (project_id, action, actor_login, detail)
  values (p_project_id, 'credit_merge', p_author_login,
    jsonb_build_object('pr_number', p_pr_number, 'sha', p_merge_commit_sha, 'reviewer', p_reviewer_login, 'delivery_id', p_delivery_id));

  return v_id;
end;
$$;

revoke all on function public.credit_merge from public, anon, authenticated;

-- Atomic maintainer void. Only a credit that is still vesting can be voided.
-- Vesting stops at p_at; the unvested remainder (computed by the app from the
-- same schedule) returns to the treasury, and the author's reputation for the
-- PR is reversed. Returns false if nothing was voided.
create or replace function public.void_credit(
  p_credit_id uuid,
  p_reason text,
  p_by_login text,
  p_at timestamptz,
  p_returned_points integer
) returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  c pull_credits%rowtype;
begin
  update pull_credits
     set status = 'voided', voided_at = p_at, void_reason = p_reason, voided_by_login = p_by_login
   where id = p_credit_id and status = 'vesting'
  returning * into c;

  if not found then
    return false;
  end if;

  if p_returned_points > 0 then
    insert into ledger_entries (project_id, ledger, github_user_id, github_login, amount, reason, pull_credit_id, created_at)
    values (c.project_id, 'token_points', c.author_github_user_id, c.author_login, -p_returned_points,
            'PR #' || c.pr_number || ' voided: unvested points returned to treasury', c.id, p_at);
  end if;

  insert into ledger_entries (project_id, ledger, github_user_id, github_login, amount, reason, pull_credit_id, created_at)
  values (c.project_id, 'reputation', c.author_github_user_id, c.author_login, -1,
          'PR #' || c.pr_number || ' voided by maintainer', c.id, p_at);

  insert into audit_log (project_id, action, actor_login, detail)
  values (c.project_id, 'void_credit', p_by_login,
    jsonb_build_object('pr_number', c.pr_number, 'reason', p_reason, 'returned_points', p_returned_points));

  return true;
end;
$$;

revoke all on function public.void_credit from public, anon, authenticated;

-- Row level security: public read of the transparent tables, no public writes.
alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.webhook_deliveries enable row level security;
alter table public.pull_credits enable row level security;
alter table public.ledger_entries enable row level security;
alter table public.role_bonds enable row level security;
alter table public.audit_log enable row level security;

create policy "public read projects" on public.projects for select using (true);
create policy "public read credits" on public.pull_credits for select using (true);
create policy "public read ledger" on public.ledger_entries for select using (true);
create policy "public read bonds" on public.role_bonds for select using (true);
create policy "public read audit" on public.audit_log for select using (true);
-- profiles and webhook_deliveries: no anon policy, service role only.
