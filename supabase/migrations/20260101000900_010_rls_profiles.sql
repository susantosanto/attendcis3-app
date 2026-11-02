-- 010 RLS profiles parsial Sprint 001 (full table menyusul Sprint 004)
alter table profiles enable row level security;
alter table school_config enable row level security;

drop policy if exists "profiles_owner_read" on profiles;
create policy "profiles_owner_read" on profiles for select to authenticated
  using (auth.uid() = id);

drop policy if exists "profiles_owner_update_token" on profiles;
create policy "profiles_owner_update_token" on profiles for update to authenticated
  using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "profiles_bind_first_device" on profiles;
create policy "profiles_bind_first_device" on profiles for update to authenticated
  using (auth.uid() = id and device_id is null) with check (auth.uid() = id);

drop policy if exists "profiles_operator_reset" on profiles;
create policy "profiles_operator_reset" on profiles for update to authenticated
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('operator','kepsek')))
  with check (true);

drop policy if exists "school_config_read" on school_config;
create policy "school_config_read" on school_config for select to authenticated using (true);

-- Uji per-role (jalankan manual, tempel output):
-- guru A: select * from profiles where id = auth.uid(); -- 1 baris
-- guru A: update profiles set nama='X' where id='<id-guru-B>'; -- 0 baris (ditolak)
-- operator: update profiles set device_id=null where id='<id-guru>'; -- sukses + tulis audit (Sprint 004)
