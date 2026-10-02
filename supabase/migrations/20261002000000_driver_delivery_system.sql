-- UniGo Driver Delivery System
-- REVIEW ONLY: apply after confirming the existing public schema and base migrations.
-- This migration is intentionally not executed by v0.

create table if not exists public.driver_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  vehicle_type text,
  vehicle_model text,
  vehicle_plate text,
  is_online boolean not null default false,
  is_available boolean not null default false,
  current_latitude double precision,
  current_longitude double precision,
  last_location_at timestamptz,
  rating numeric(3,2),
  total_deliveries integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.delivery_jobs (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references public.orders(id) on delete cascade,
  driver_id uuid references public.profiles(id) on delete set null,
  status text not null default 'pending' check (status in ('pending','accepted','driver_to_restaurant','arrived_restaurant','picked_up','driver_to_customer','arrived_customer','delivered','cancelled')),
  pickup_address text,
  pickup_latitude double precision,
  pickup_longitude double precision,
  dropoff_address text not null,
  dropoff_latitude double precision,
  dropoff_longitude double precision,
  delivery_fee numeric(10,2),
  assigned_at timestamptz,
  accepted_at timestamptz,
  picked_up_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.delivery_status_history (
  id uuid primary key default gen_random_uuid(),
  delivery_job_id uuid not null references public.delivery_jobs(id) on delete cascade,
  status text not null check (status in ('pending','accepted','driver_to_restaurant','arrived_restaurant','picked_up','driver_to_customer','arrived_customer','delivered','cancelled')),
  changed_by uuid not null references public.profiles(id) on delete restrict,
  latitude double precision,
  longitude double precision,
  note text,
  created_at timestamptz not null default now()
);

alter table public.driver_profiles enable row level security;
alter table public.delivery_jobs enable row level security;
alter table public.delivery_status_history enable row level security;

create or replace function public.is_driver()
returns boolean language sql stable security invoker set search_path = public
as $$ select exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'driver') $$;

create or replace function public.accept_delivery_job(job_id uuid)
returns public.delivery_jobs language plpgsql security invoker set search_path = public
as $$
declare claimed public.delivery_jobs;
begin
  if not public.is_driver() then raise exception 'driver_only'; end if;
  update public.delivery_jobs
  set driver_id = auth.uid(), status = 'accepted', assigned_at = now(), accepted_at = now(), updated_at = now()
  where id = job_id and driver_id is null and status = 'pending'
  returning * into claimed;
  if claimed.id is null then raise exception 'job_already_claimed'; end if;
  insert into public.delivery_status_history(delivery_job_id,status,changed_by)
  values (claimed.id,'accepted',auth.uid());
  return claimed;
end;
$$;

create policy driver_profiles_select_own on public.driver_profiles for select to authenticated using (user_id = auth.uid());
create policy driver_profiles_update_own_safe on public.driver_profiles for update to authenticated using (user_id = auth.uid() and public.is_driver()) with check (user_id = auth.uid() and public.is_driver());
create policy delivery_jobs_driver_select on public.delivery_jobs for select to authenticated using (public.is_driver() and (driver_id = auth.uid() or (driver_id is null and status = 'pending')));
create policy delivery_jobs_driver_update on public.delivery_jobs for update to authenticated using (driver_id = auth.uid() and public.is_driver()) with check (driver_id = auth.uid() and public.is_driver());
create policy delivery_history_driver_select on public.delivery_status_history for select to authenticated using (exists (select 1 from public.delivery_jobs j where j.id = delivery_job_id and j.driver_id = auth.uid()));

grant execute on function public.accept_delivery_job(uuid) to authenticated;
revoke all on function public.is_driver() from public;
revoke all on function public.accept_delivery_job(uuid) from public;

-- Required before production: add admin, restaurant, customer policies and a
-- controlled transition function for every allowed status edge. Do not expose
-- direct status/driver_id writes to the browser.
-- Also add/update orders.delivery_latitude and orders.delivery_longitude only
-- if the existing orders table does not already contain equivalent columns.
