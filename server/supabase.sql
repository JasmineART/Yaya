-- Run these SQL commands in Supabase SQL editor to create the minimal tables used by the demo.

create table if not exists newsletter (
  id uuid default gen_random_uuid() primary key,
  email text not null,
  created_at timestamptz default now()
);

create table if not exists comments (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  text text not null,
  created_at timestamptz default now()
);

create table if not exists orders (
  id uuid default gen_random_uuid() primary key,
  stripe_session_id text,
  paypal_order_id text,
  metadata jsonb,
  status text,
  created_at timestamptz default now(),
  paid_at timestamptz
);
