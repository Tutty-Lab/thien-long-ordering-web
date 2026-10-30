create extension if not exists pgcrypto;
create table if not exists public.menu_categories(id uuid primary key default gen_random_uuid(), name text not null unique, sort_order int not null default 0);
create table if not exists public.menu_items(id uuid primary key default gen_random_uuid(), category_id uuid references public.menu_categories(id), name text not null, description text, price_vnd integer not null check(price_vnd>0), image_url text, is_available boolean not null default true, created_at timestamptz not null default now());
create table if not exists public.orders(owner_id uuid references auth.users(id), id uuid primary key default gen_random_uuid(), status text not null default 'pending' check(status in ('pending','confirmed','preparing','ready','completed','cancelled')), customer_name text, customer_phone text, total_vnd integer not null default 0, created_at timestamptz not null default now());
create table if not exists public.order_items(id uuid primary key default gen_random_uuid(), order_id uuid not null references public.orders(id) on delete cascade, menu_item_id uuid not null references public.menu_items(id), quantity integer not null check(quantity>0), unit_price_vnd integer not null check(unit_price_vnd>0));
alter table public.menu_categories enable row level security; alter table public.menu_items enable row level security; alter table public.orders enable row level security; alter table public.order_items enable row level security;
create policy "public can read available menu" on public.menu_items for select using (is_available=true); create policy "public can read categories" on public.menu_categories for select using (true);
-- Orders are written through a server-side Edge Function with service role; no anonymous insert policy.
alter table public.orders add column request_key uuid unique;
create or replace function public.place_order(p_key uuid,p_items jsonb) returns uuid language plpgsql security definer set search_path=public,pg_temp as $$
declare oid uuid; entry jsonb; product public.menu_items; qty integer; total integer:=0;
begin
if auth.uid() is null then raise exception 'Authentication required'; end if;
if p_key is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) not between 1 and 50 then raise exception 'Invalid order'; end if;
perform pg_advisory_xact_lock(hashtextextended(p_key::text,0));
select id into oid from public.orders where request_key=p_key and owner_id=auth.uid();
if oid is not null then return oid; end if;
if (select count(*) from public.orders where owner_id=auth.uid() and created_at>now()-interval '1 minute')>=3 then raise exception 'Too many orders'; end if;
insert into public.orders(request_key,owner_id) values(p_key,auth.uid()) returning id into oid;
for entry in select * from jsonb_array_elements(p_items) loop
qty:=(entry->>'quantity')::integer;
if qty is null or qty not between 1 and 50 then raise exception 'Invalid quantity'; end if;
select * into product from public.menu_items where id=(entry->>'id')::uuid and is_available for share;
if not found then raise exception 'Item unavailable'; end if;
insert into public.order_items(order_id,menu_item_id,quantity,unit_price_vnd) values(oid,product.id,qty,product.price_vnd);
total:=total+qty*product.price_vnd;
end loop;
update public.orders set total_vnd=total where id=oid;
return oid;
end $$;
revoke all on function public.place_order(uuid,jsonb) from public;
grant execute on function public.place_order(uuid,jsonb) to authenticated;
