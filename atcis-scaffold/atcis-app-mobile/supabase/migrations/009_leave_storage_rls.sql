-- 009 storage + RLS leave + trigger push (Sprint 003) — paste ke SQL Editor setelah 006
insert into storage.buckets (id, name, public)
values ('surat-izin','surat-izin', false)
on conflict (id) do nothing;

alter table leave_requests enable row level security;
alter table device_reset_audit enable row level security;

drop policy if exists "leave_owner_read" on leave_requests;
create policy "leave_owner_read" on leave_requests for select to authenticated
  using (auth.uid() = user_id or exists (
    select 1 from profiles p where p.id = auth.uid() and p.role in ('operator','kepsek')));

drop policy if exists "leave_owner_insert" on leave_requests;
create policy "leave_owner_insert" on leave_requests for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "leave_approver_update" on leave_requests;
create policy "leave_approver_update" on leave_requests for update to authenticated
  using (
    (exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('operator','kepsek'))
     and (select role from profiles where id = leave_requests.user_id) = 'guru')
    or (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'kepsek')
     and (select role from profiles where id = leave_requests.user_id) = 'operator')
  ) with check (true);

drop policy if exists "audit_read_admin" on device_reset_audit;
create policy "audit_read_admin" on device_reset_audit for select to authenticated
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('operator','kepsek')));
drop policy if exists "audit_write_admin" on device_reset_audit;
create policy "audit_write_admin" on device_reset_audit for insert to authenticated
  with check (exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('operator','kepsek')));

-- Storage policies surat-izin
drop policy if exists "surat_owner_insert" on storage.objects;
create policy "surat_owner_insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'surat-izin' and auth.uid()::text = (storage.foldername(name))[1]);
drop policy if exists "surat_owner_read" on storage.objects;
create policy "surat_owner_read" on storage.objects for select to authenticated
  using (bucket_id = 'surat-izin' and (
    auth.uid()::text = (storage.foldername(name))[1] or
    exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('operator','kepsek'))));

-- Trigger catat waktu keputusan (push via Realtime; Edge Function opsional Phase 2)
create or replace function stamp_leave_decision() returns trigger language plpgsql as $$
begin
  if NEW.status <> OLD.status and NEW.status in ('approved','rejected') then
    NEW.decided_at := now();
    NEW.decided_by := coalesce(NEW.decided_by, auth.uid());
  end if;
  return NEW;
end $$;
drop trigger if exists trg_stamp_leave on leave_requests;
create trigger trg_stamp_leave before update on leave_requests
  for each row execute function stamp_leave_decision();

alter publication supabase_realtime add table leave_requests;
