create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null check (char_length(full_name) between 2 and 100),
  phone text not null check (char_length(phone) between 6 and 30),
  username text not null check (username ~ '^[A-Za-z0-9._-]{3,30}$'),
  discount_percent smallint not null default 5 check (discount_percent = 5),
  created_at timestamptz not null default now()
);

create unique index if not exists profiles_username_lower_idx on public.profiles (lower(username));
alter table public.profiles enable row level security;

drop policy if exists "Customers can view their own profile" on public.profiles;
create policy "Customers can view their own profile"
on public.profiles for select to authenticated
using ((select auth.uid()) = id);

create or replace function public.create_customer_profile()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, full_name, phone, username)
  values (new.id, new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'phone', new.raw_user_meta_data ->> 'username');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute procedure public.create_customer_profile();
