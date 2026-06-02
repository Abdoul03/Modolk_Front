-- Enum for collections
create type public.product_category as enum ('femme', 'homme', 'enfant', 'accessoires');
create type public.order_status as enum ('en_attente', 'confirmee', 'expediee', 'livree', 'annulee');

-- Products
create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price_cents integer not null check (price_cents >= 0),
  category public.product_category not null,
  image_url text,
  stock integer not null default 0 check (stock >= 0),
  featured boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.products enable row level security;

create policy "Products: anyone can view active"
  on public.products for select
  using (active = true or public.has_role(auth.uid(), 'admin'));

create policy "Products: admins insert"
  on public.products for insert to authenticated
  with check (public.has_role(auth.uid(), 'admin'));

create policy "Products: admins update"
  on public.products for update to authenticated
  using (public.has_role(auth.uid(), 'admin'));

create policy "Products: admins delete"
  on public.products for delete to authenticated
  using (public.has_role(auth.uid(), 'admin'));

create trigger products_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

-- Orders
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  status public.order_status not null default 'en_attente',
  total_cents integer not null default 0 check (total_cents >= 0),
  shipping_address text,
  phone text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.orders enable row level security;

create policy "Orders: users read own"
  on public.orders for select to authenticated
  using (auth.uid() = user_id or public.has_role(auth.uid(), 'admin'));

create policy "Orders: users insert own"
  on public.orders for insert to authenticated
  with check (auth.uid() = user_id);

create policy "Orders: admins update"
  on public.orders for update to authenticated
  using (public.has_role(auth.uid(), 'admin'));

create trigger orders_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

-- Order items
create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id),
  product_name text not null,
  unit_price_cents integer not null check (unit_price_cents >= 0),
  quantity integer not null check (quantity > 0),
  created_at timestamptz not null default now()
);

alter table public.order_items enable row level security;

create policy "Order items: users read own"
  on public.order_items for select to authenticated
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id
        and (o.user_id = auth.uid() or public.has_role(auth.uid(), 'admin'))
    )
  );

create policy "Order items: users insert own"
  on public.order_items for insert to authenticated
  with check (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id
        and o.user_id = auth.uid()
    )
  );

create index orders_user_id_idx on public.orders(user_id);
create index order_items_order_id_idx on public.order_items(order_id);
create index products_category_idx on public.products(category);

-- Seed a few sample products
insert into public.products (name, description, price_cents, category, stock, featured) values
  ('Robe Sahel', 'Robe fluide aux motifs inspirés du Sahel.', 12900, 'femme', 12, true),
  ('Boubou Royal', 'Boubou cérémonie, broderies dorées.', 18900, 'homme', 8, true),
  ('Ensemble Enfant Akan', 'Ensemble enfant en wax, coupe confort.', 6900, 'enfant', 20, true),
  ('Chemise Lagos', 'Chemise homme coupe ajustée, coton premium.', 8900, 'homme', 15, false),
  ('Jupe Mali', 'Jupe longue, motifs bogolan.', 7900, 'femme', 10, false);