-- 004 schedules + holidays + seed (Sprint 002)
create table schedules (
  id uuid primary key default gen_random_uuid(),
  hari smallint not null unique check (hari between 0 and 6),
  jam_masuk time not null,
  jam_pulang time not null,
  jam_pulang_jumat time,
  aktif boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table holidays (
  id uuid primary key default gen_random_uuid(),
  tanggal date not null unique,
  keterangan varchar(200) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index uq_schedules_hari on schedules(hari);
create unique index uq_holidays_tanggal on holidays(tanggal);

-- Seed: senin–jumat 07:00–15:30 (jumat pulang 11:30), sabtu 07:00–12:00, minggu nonaktif
insert into schedules (hari, jam_masuk, jam_pulang, jam_pulang_jumat, aktif) values
  (1, '07:00', '15:30', '11:30', true),
  (2, '07:00', '15:30', '11:30', true),
  (3, '07:00', '15:30', '11:30', true),
  (4, '07:00', '15:30', '11:30', true),
  (5, '07:00', '11:30', '11:30', true),
  (6, '07:00', '12:00', '12:00', true),
  (0, '07:00', '12:00', '12:00', false)
on conflict (hari) do nothing;
