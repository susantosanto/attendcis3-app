-- 012 polish gaps: batas jam, checkout rules, smart device bind (Sprint polish, 1 Nov 2026)
alter table school_config
  add column if not exists jam_batas_izin time not null default '09:00',
  add column if not exists jam_pulang_maks time not null default '16:30';

-- GAP-07/GAP-08: checkout wajib sudah check-in + dibatasi jam pulang maks
create or replace function validate_attendance() returns trigger language plpgsql as $$
declare
  cfg record;
  sched record;
  dow int := extract(dow from NEW.tanggal)::int;
  now_t time := (NEW.waktu at time zone 'Asia/Jakarta')::time;
  pulang time;
  hol date;
  actor_role user_role;
  sudah_in int;
begin
  if NEW.is_mock then
    raise exception 'MOCK_LOCATION: lokasi tiruan terdeteksi';
  end if;
  select role into actor_role from profiles where id = NEW.user_id;
  select * into cfg from school_config where id = 1;
  if NEW.is_bypass then
    if actor_role not in ('kepsek','operator') then
      raise exception 'BYPASS_DENIED: hanya kepsek/operator';
    end if;
    NEW.status := 'bypass';
    return NEW;
  end if;
  select tanggal into hol from holidays where tanggal = NEW.tanggal;
  if hol is not null then
    raise exception 'HOLIDAY: hari libur, presensi nonaktif';
  end if;
  select * into sched from schedules where hari = dow and aktif;
  if not found then
    raise exception 'OFFDAY: bukan hari kerja';
  end if;
  pulang := case when dow = 5 and sched.jam_pulang_jumat is not null then sched.jam_pulang_jumat else sched.jam_pulang end;
  if NEW.jarak_meter > cfg.radius_meter then
    raise exception 'OUT_OF_RADIUS: jarak % m melebihi % m', NEW.jarak_meter, cfg.radius_meter;
  end if;
  if NEW.tipe = 'in' then
    NEW.status := case when now_t > sched.jam_masuk then 'terlambat' else 'tepat_waktu' end;
    if NEW.status = 'terlambat' and (NEW.alasan_terlambat is null or NEW.alasan_terlambat = '') then
      raise exception 'LATE_REASON_REQUIRED: alasan keterlambatan wajib';
    end if;
  else
    select count(*) into sudah_in from attendance
      where user_id = NEW.user_id and tanggal = NEW.tanggal and tipe = 'in';
    if sudah_in = 0 then
      raise exception 'NO_CHECKIN: check-in dulu sebelum check-out';
    end if;
    if now_t < pulang then
      raise exception 'EARLY_CHECKOUT: belum jam pulang (%)', pulang;
    end if;
    if now_t > cfg.jam_pulang_maks then
      raise exception 'LATE_CHECKOUT: melewati batas maksimal pulang (%)', cfg.jam_pulang_maks;
    end if;
    NEW.status := 'tepat_waktu';
  end if;
  return NEW;
end $$;

-- GAP-10: batas jam pengajuan izin (Dinas bebas)
create or replace function validate_leave_time() returns trigger language plpgsql as $$
declare
  batas time;
  now_t time := (now() at time zone 'Asia/Jakarta')::time;
  today_d date := (now() at time zone 'Asia/Jakarta')::date;
begin
  select jam_batas_izin into batas from school_config where id = 1;
  if NEW.jenis <> 'dinas' and NEW.tgl_mulai = today_d and now_t > batas then
    raise exception 'IZIN_CLOSED: batas pengajuan izin hari ini pukul %, kecuali Dinas', batas;
  end if;
  return NEW;
end $$;
drop trigger if exists trg_validate_leave_time on leave_requests;
create trigger trg_validate_leave_time before insert on leave_requests
  for each row execute function validate_leave_time();

-- GAP-02: smart device bind (izinkan ganti HP selama device baru belum dipakai orang lain)
create or replace function bind_device(p_device text) returns text language plpgsql security definer as $func$
declare
  me uuid := auth.uid();
  cur text;
  taken_by uuid;
begin
  if me is null then raise exception 'NOT_AUTH'; end if;
  select device_id into cur from profiles where id = me;
  if cur = p_device then return 'same'; end if;
  select id into taken_by from profiles where device_id = p_device and id <> me;
  if taken_by is not null then raise exception 'DEVICE_TAKEN: perangkat dipakai akun lain, hubungi operator'; end if;
  update profiles set device_id = p_device, updated_at = now() where id = me;
  if cur is null then return 'bound'; else return 'moved'; end if;
end $func$;

