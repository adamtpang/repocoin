-- repocoin paper market. Play money only. Nothing is redeemable, nothing
-- leaves the app, and no paper price is a price for any future token.
--
-- Paper trades never touch ledger_entries or pull_credits. Each person's
-- paper position is (unbonded vested points, computed by the app) plus
-- units_delta; buyers start with 10,000 paper credits (assumption).
-- src/lib/market.ts is the reference engine; tests run both.

create table public.paper_accounts (
  project_id uuid not null references public.projects (id) on delete cascade,
  github_user_id bigint not null,
  github_login text not null,
  credits bigint not null default 10000,
  units_delta bigint not null default 0,
  created_at timestamptz not null default now(),
  primary key (project_id, github_user_id)
);

create table public.paper_orders (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  github_user_id bigint not null,
  github_login text not null,
  side text not null check (side in ('buy', 'sell')),
  price integer not null check (price between 1 and 1000000),
  qty integer not null check (qty between 1 and 1000000),
  remaining integer not null check (remaining >= 0),
  status text not null default 'open' check (status in ('open', 'filled', 'cancelled')),
  seq bigserial,
  created_at timestamptz not null default now()
);

create index paper_orders_book_idx on public.paper_orders (project_id, status, side, price);

create table public.paper_fills (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  buy_order_id uuid not null references public.paper_orders (id),
  sell_order_id uuid not null references public.paper_orders (id),
  buyer_github_user_id bigint not null,
  buyer_login text not null,
  seller_github_user_id bigint not null,
  seller_login text not null,
  price integer not null,
  qty integer not null check (qty > 0),
  -- Fills from one order share a timestamp; seq keeps their true order.
  seq bigserial,
  created_at timestamptz not null default now()
);

create index paper_fills_project_idx on public.paper_fills (project_id, seq desc);

-- Places a limit order and matches it, in one transaction. Locking the
-- project row serializes matching per project. Returns json:
--   {"ok": true, "order_id": ..., "filled": n} or {"ok": false, "reason": ...}
create or replace function public.place_paper_order(
  p_project_id uuid,
  p_user_id bigint,
  p_login text,
  p_side text,
  p_price integer,
  p_qty integer,
  p_sellable_base bigint
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_acct paper_accounts%rowtype;
  v_reserved bigint;
  v_order_id uuid;
  v_remaining integer := p_qty;
  v_filled integer := 0;
  v_q integer;
  m paper_orders%rowtype;
begin
  if p_side not in ('buy', 'sell') then
    return jsonb_build_object('ok', false, 'reason', 'Side must be buy or sell.');
  end if;
  if p_price is null or p_price < 1 or p_price > 1000000 then
    return jsonb_build_object('ok', false, 'reason', 'Price must be a whole number of paper credits from 1 to 1,000,000.');
  end if;
  if p_qty is null or p_qty < 1 or p_qty > 1000000 then
    return jsonb_build_object('ok', false, 'reason', 'Quantity must be a whole number from 1 to 1,000,000.');
  end if;

  perform 1 from projects where id = p_project_id for update;
  if not found then
    return jsonb_build_object('ok', false, 'reason', 'Unknown project.');
  end if;

  insert into paper_accounts (project_id, github_user_id, github_login)
  values (p_project_id, p_user_id, p_login)
  on conflict (project_id, github_user_id) do update set github_login = excluded.github_login;
  select * into v_acct from paper_accounts where project_id = p_project_id and github_user_id = p_user_id;

  if p_side = 'buy' then
    select coalesce(sum(price::bigint * remaining), 0) into v_reserved from paper_orders
     where project_id = p_project_id and github_user_id = p_user_id and status = 'open' and side = 'buy';
    if v_acct.credits - v_reserved < p_price::bigint * p_qty then
      return jsonb_build_object('ok', false, 'reason', 'Not enough unreserved paper credits.');
    end if;
  else
    select coalesce(sum(remaining), 0) into v_reserved from paper_orders
     where project_id = p_project_id and github_user_id = p_user_id and status = 'open' and side = 'sell';
    if p_sellable_base + v_acct.units_delta - v_reserved < p_qty then
      return jsonb_build_object('ok', false, 'reason', 'Not enough unreserved paper units to sell.');
    end if;
  end if;

  insert into paper_orders (project_id, github_user_id, github_login, side, price, qty, remaining)
  values (p_project_id, p_user_id, p_login, p_side, p_price, p_qty, p_qty)
  returning id into v_order_id;

  -- Price-time priority, fill at the resting price, skip own orders.
  for m in
    select * from paper_orders
     where project_id = p_project_id and status = 'open' and side <> p_side
       and github_user_id <> p_user_id
       and ((p_side = 'buy' and price <= p_price) or (p_side = 'sell' and price >= p_price))
     order by case when p_side = 'buy' then price else -price end, seq
  loop
    exit when v_remaining = 0;
    v_q := least(v_remaining, m.remaining);
    v_remaining := v_remaining - v_q;
    v_filled := v_filled + v_q;

    update paper_orders
       set remaining = remaining - v_q,
           status = case when remaining - v_q = 0 then 'filled' else 'open' end
     where id = m.id;

    if p_side = 'buy' then
      update paper_accounts set credits = credits - m.price::bigint * v_q, units_delta = units_delta + v_q
       where project_id = p_project_id and github_user_id = p_user_id;
      update paper_accounts set credits = credits + m.price::bigint * v_q, units_delta = units_delta - v_q
       where project_id = p_project_id and github_user_id = m.github_user_id;
      insert into paper_fills (project_id, buy_order_id, sell_order_id, buyer_github_user_id, buyer_login,
                               seller_github_user_id, seller_login, price, qty)
      values (p_project_id, v_order_id, m.id, p_user_id, p_login, m.github_user_id, m.github_login, m.price, v_q);
    else
      update paper_accounts set credits = credits + m.price::bigint * v_q, units_delta = units_delta - v_q
       where project_id = p_project_id and github_user_id = p_user_id;
      update paper_accounts set credits = credits - m.price::bigint * v_q, units_delta = units_delta + v_q
       where project_id = p_project_id and github_user_id = m.github_user_id;
      insert into paper_fills (project_id, buy_order_id, sell_order_id, buyer_github_user_id, buyer_login,
                               seller_github_user_id, seller_login, price, qty)
      values (p_project_id, m.id, v_order_id, m.github_user_id, m.github_login, p_user_id, p_login, m.price, v_q);
    end if;
  end loop;

  update paper_orders
     set remaining = v_remaining, status = case when v_remaining = 0 then 'filled' else 'open' end
   where id = v_order_id;

  return jsonb_build_object('ok', true, 'order_id', v_order_id, 'filled', v_filled);
end;
$$;

create or replace function public.cancel_paper_order(p_order_id uuid, p_user_id bigint)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  update paper_orders set status = 'cancelled'
   where id = p_order_id and github_user_id = p_user_id and status = 'open';
  return found;
end;
$$;

revoke all on function public.place_paper_order from public, anon, authenticated;
revoke all on function public.cancel_paper_order from public, anon, authenticated;

alter table public.paper_accounts enable row level security;
alter table public.paper_orders enable row level security;
alter table public.paper_fills enable row level security;

create policy "public read paper accounts" on public.paper_accounts for select using (true);
create policy "public read paper orders" on public.paper_orders for select using (true);
create policy "public read paper fills" on public.paper_fills for select using (true);
