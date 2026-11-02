-- 006 leave_requests (Sprint 003)
create table leave_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  jenis leave_jenis not null,
  tgl_mulai date not null,
  tgl_selesai date not null check (tgl_selesai >= tgl_mulai),
  keterangan varchar(500) not null,
  file_url varchar(500),
  status leave_status not null default 'pending',
  decided_by uuid references profiles(id),
  decided_at timestamptz,
  reject_reason varchar(300),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (tgl_mulai <= tgl_selesai)
);

create index idx_leave_user_status on leave_requests(user_id, status);
create index idx_leave_status_pending on leave_requests(status) where status = 'pending';

-- 007 device_reset_audit (Sprint 003, dipakai 004)
create table device_reset_audit (
  id uuid primary key default gen_random_uuid(),
  target_user_id uuid not null references profiles(id) on delete cascade,
  reset_by uuid not null references profiles(id),
  waktu timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 009 storage bucket surat-izin (jalankan di SQL Editor):
-- insert into storage.buckets (id, name, public) values ('surat-izin','surat-izin', false)
-- on conflict (id) do nothing;
-- Policy: insert milik sendiri <2MB jpg/png/pdf; select pemilik + approver; update approver.
-- (Policy detail via Dashboard > Storage > surat-izin > Policies — saya tulis SQL-nya di BUILD-REPORT.)
