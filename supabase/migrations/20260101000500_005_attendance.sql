-- 005 attendance (Sprint 002)
create table attendance (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  tanggal date not null,
  tipe att_tipe not null,
  waktu timestamptz not null default now(),
  latitude double precision not null,
  longitude double precision not null,
  jarak_meter int not null,
  status att_status not null,
  alasan_terlambat varchar(300),
  mood varchar(10),
  is_bypass boolean not null default false,
  is_mock boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, tanggal, tipe)
);

create unique index uq_attendance_user_tgl_tipe on attendance(user_id, tanggal, tipe);
create index idx_attendance_tanggal on attendance(tanggal desc);
create index idx_attendance_user_tanggal on attendance(user_id, tanggal desc);
