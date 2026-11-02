-- 002 profiles (Sprint 001)
create extension if not exists "pgcrypto";

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nip varchar(20) unique not null,
  email varchar(255) not null unique,
  nama varchar(100) not null,
  role user_role not null default 'guru',
  device_id varchar(100) unique,
  expo_push_token varchar(255),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index uq_profiles_nip on profiles(nip);
create unique index uq_profiles_email on profiles(email);
create unique index uq_profiles_device on profiles(device_id) where device_id is not null;
create index idx_profiles_role on profiles(role);
