
-- Roles enum
create type public.app_role as enum ('admin', 'client');

-- Profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  address text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- User roles
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

alter table public.user_roles enable row level security;

-- Security definer role check
create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles where user_id = _user_id and role = _role
  )
$$;

-- RLS profiles
create policy "Profiles: users read own" on public.profiles
for select to authenticated using (auth.uid() = id);

create policy "Profiles: users update own" on public.profiles
for update to authenticated using (auth.uid() = id);

create policy "Profiles: admins read all" on public.profiles
for select to authenticated using (public.has_role(auth.uid(), 'admin'));

-- RLS user_roles
create policy "Roles: users read own" on public.user_roles
for select to authenticated using (auth.uid() = user_id);

create policy "Roles: admins read all" on public.user_roles
for select to authenticated using (public.has_role(auth.uid(), 'admin'));

create policy "Roles: admins manage" on public.user_roles
for all to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

-- Auto-create profile + default client role on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''));

  insert into public.user_roles (user_id, role)
  values (new.id, 'client');

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();
