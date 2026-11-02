# Data Model — AttendCis 3

Input: `PRD.md` §4 + `TECH-STACK.md` (PostgreSQL Supabase + RLS). UUID PK di semua tabel. Timestamps di semua tabel. Tanpa soft-delete (riwayat presensi/izin permanen untuk audit); hapus hanya untuk `holidays` dan file lampiran yang ditolak.

## 1. Schema (SQL — Supabase/PostgreSQL)

```sql
-- Ekstensi
create extension if not exists "pgcrypto";

-- Roles
do $$ begin
  create type user_role as enum ('guru','operator','kepsek');
exception when duplicate_object then null; end $$;
do $$ begin
  create type att_tipe as enum ('in','out');
exception when duplicate_object then null; end $$;
do $$ begin
  create type att_status as enum ('tepat_waktu','terlambat','cepat_pulang','bypass');
exception when duplicate_object then null; end $$;
do $$ begin
  create type leave_jenis as enum ('izin','sakit','dinas');
exception when duplicate_object then null; end $$;
do $$ begin
  create type leave_status as enum ('pending','approved','rejected');
exception when duplicate_object then null; end $$;

-- profiles: 1 row per auth.users.id
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

-- school_config: singleton id=1
create table school_config (
  id smallint primary key default 1 check (id = 1),
  nama_sekolah varchar(100) not null default 'SDN Cisomang 3',
  latitude double precision not null,
  longitude double precision not null,
  radius_meter int not null default 100 check (radius_meter between 20 and 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- schedules: satu row per hari
create table schedules (
  id uuid primary key default gen_random_uuid(),
  hari smallint not null unique check (hari between 0 and 6), -- 0=minggu
  jam_masuk time not null,
  jam_pulang time not null,
  jam_pulang_jumat time, -- dipakai saat hari=5
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

create table device_reset_audit (
  id uuid primary key default gen_random_uuid(),
  target_user_id uuid not null references profiles(id) on delete cascade,
  reset_by uuid not null references profiles(id),
  waktu timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

Fungsi validasi (ringkas — implementasi penuh di migrasi):
`haversine_m(lat1,lon1,lat2,lon2)` → meter; trigger `validate_attendance()` menolak: `is_mock=true`, `jarak_meter > radius` (kecuali `is_bypass` + role kepsek/operator), check-out sebelum jam pulang, duplikat harian (ditangani unique constraint).

## 2. Relationship Map (ERD teks)

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│   profiles   │       │  attendance  │       │leave_requests│
├──────────────┤       ├──────────────┤       ├──────────────┤
│ id (PK,FK)   │──┐    │ id (PK)      │       │ id (PK)      │
│ nip UNIQUE   │  │    │ user_id (FK) │◀─┐    │ user_id (FK) │◀─┐
│ email UNIQUE │  ├────│ tanggal      │  │    │ jenis        │  │
│ nama         │  │    │ tipe in/out  │  │    │ tgl_mulai    │  │
│ role         │  │    │ status       │  │    │ tgl_selesai  │  │
│ device_id UQ │  │    │ jarak_meter  │  │    │ file_url     │  │
│ push_token   │  │    │ is_bypass    │  │    │ status       │  │
└──────────────┘  │    └──────────────┘  │    │ decided_by   │──┼── FK ke profiles
                  │                      │    └──────────────┘  │
┌──────────────┐  │    ┌──────────────┐  │    ┌──────────────┐  │
│school_config │  │    │  schedules   │  │    │device_reset  │  │
├──────────────┤  │    ├──────────────┤  │    ├──────────────┤  │
│ id=1 (PK)    │  │    │ id (PK)      │  │    │ id (PK)      │  │
│ lat/lon      │──┼──▶ │ hari UNIQUE  │  │    │ target (FK)  │◀─┘
│ radius_meter │  │    │ jam msk/plg  │  │    │ reset_by(FK) │◀── FK ke profiles
└──────────────┘  │    └──────────────┘  │    └──────────────┘
┌──────────────┐  │    │                │  │
│   holidays   │──┘    │ dibaca saat   │──┘
│ tanggal UQ   │  validasi attendance
└──────────────┘
```

Relasi: profiles 1:N attendance; profiles 1:N leave_requests; profiles 1:N device_reset_audit (sebagai target & reset_by); schedules/holidays/school_config tanpa FK (aturan validasi).

## 3. Index Strategy

| Entity | Index | Type | Reason |
|---|---|---|---|
| profiles | `uq_profiles_nip` (nip) | UNIQUE | Lookup login NIP (US-01) |
| profiles | `uq_profiles_email` (email) | UNIQUE | Lookup login email |
| profiles | `uq_profiles_device` (device_id) | UNIQUE WHERE device_id IS NOT NULL | One Device One Account (US-02) |
| profiles | `idx_profiles_role` (role) | BTREE | Filter dashboard per-role |
| attendance | `uq_attendance_user_tgl_tipe` (user_id,tanggal,tipe) | UNIQUE | Idempoten 1 in/out per hari (US-05) |
| attendance | `idx_attendance_tanggal` (tanggal DESC) | BTREE | Dashboard harian + filter tanggal (US-09) |
| attendance | `idx_attendance_user_tanggal` (user_id,tanggal DESC) | BTREE | Riwayat per-guru |
| leave_requests | `idx_leave_user_status` (user_id,status) | BTREE | Daftar pengajuan milik guru + antrean approval |
| leave_requests | `idx_leave_status` (status) WHERE status='pending' | PARTIAL | Antrean pending cepat (US-07) |
| holidays | `uq_holidays_tanggal` (tanggal) | UNIQUE | Cek libur per-tanggal (US-11) |
| schedules | `uq_schedules_hari` (hari) | UNIQUE | Lookup jadwal per-hari |

Tanpa indeks full-text; kolom keterangan/alasan tidak di-WHERE.

## 4. Migration Plan

### Phase 1: Core (berurutan)
1. `001_enums` — create types (UP/DOWN: drop types)
2. `002_profiles` — profiles + unique indexes (depend: auth.users)
3. `003_school_config` — tabel + seed 1 row koordinat SDN Cisomang 3
4. `004_schedules_holidays` — tabel + seed senin–sabtu + unique

### Phase 2: Transaksional
5. `005_attendance` — tabel + unique(user,tanggal,tipe) + indexes
6. `006_leave_requests` — tabel + indexes + check tanggal
7. `007_device_reset_audit` — tabel audit
8. `008_functions` — `haversine_m()` + trigger `validate_attendance()`
9. `009_storage` — bucket `surat-izin` private + policy (authenticated insert miliknya, <2 MB, mime jpg/png/pdf; update hanya approver)

### Phase 3: RLS + Realtime
10. `010_rls` — enable RLS semua tabel; policy: owner-read/insert sendiri (attendance, leave), tulis schedules/holidays/school_config hanya operator/kepsek, reset device_id hanya operator/kepsek, approve sesuai jenjang (guru→operator/kepsek; operator→kepsek)
11. `011_realtime_push` — publication realtime + trigger antrean push approval

### Rollback Strategy
- Setiap migrasi punya DOWN (drop trigger → tabel → enum terbalik dari 011 ke 001)
- Uji `supabase db reset` + rollback di staging sebelum produksi
- Seed koordinat/jadwal tidak dihapus rollback parsial (diproteksi flag)

## 5. Query Patterns (Top 5)

### Q1: Login via NIP → email
```sql
SELECT id, email, nama, role, device_id FROM profiles WHERE nip = $1;
-- Uses: uq_profiles_nip (unique scan) ✓ — Expected: <2ms
```

### Q2: Cek status presensi hari ini (tombol aktif/nonaktif)
```sql
SELECT tipe, status, waktu FROM attendance
WHERE user_id = $1 AND tanggal = CURRENT_DATE;
-- Uses: idx_attendance_user_tanggal ✓ — Expected: <5ms
```

### Q3: Dashboard harian + Alpha priority
```sql
SELECT p.nama, a.tipe, a.status, a.waktu FROM profiles p
LEFT JOIN attendance a ON a.user_id = p.id AND a.tanggal = $1
ORDER BY CASE WHEN a.id IS NULL THEN 0 ELSE 1 END, p.nama;
-- Uses: idx_attendance_tanggal + idx_profiles_role ✓ — Expected: <20ms @50 user
```

### Q4: Antrean approval pending
```sql
SELECT id, user_id, jenis, tgl_mulai, tgl_selesai, keterangan FROM leave_requests
WHERE status = 'pending' ORDER BY created_at ASC LIMIT 50;
-- Uses: idx_leave_status (partial) ✓ — Expected: <5ms
```

### Q5: Cek libur + jadwal hari ini
```sql
SELECT tanggal FROM holidays WHERE tanggal = CURRENT_DATE;
SELECT jam_masuk, jam_pulang FROM schedules WHERE hari = EXTRACT(DOW FROM CURRENT_DATE) AND aktif;
-- Uses: uq_holidays_tanggal + uq_schedules_hari ✓ — Expected: <2ms
```

## 6. Self-Review
- [x] Semua 7 entitas PRD punya skema
- [x] FK lengkap; singleton/config tanpa FK by-design (aturan validasi)
- [x] Indeks menutup top-5 query; tanpa indeks boros
- [x] Tanpa SELECT *; UUID eksplisit; timestamps semua tabel
- [x] Tanpa soft-delete (audit permanen); hapus hanya holidays/lampiran
- [x] Migrasi berurutan 001–011 + rollback + staging reset

Next: `/module-planner` — dekomposisi modul dari model ini + TECH-STACK.
