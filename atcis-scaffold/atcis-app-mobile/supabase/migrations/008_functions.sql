-- 008 functions: haversine + validasi presensi (Sprint 002)
create or replace function haversine_m(lat1 double precision, lon1 double precision, lat2 double precision, lon2 double precision)
returns double precision language plpgsql immutable as $$
declare
  r double precision := 6371000;
  dlat double precision := radians(lat2 - lat1);
  dlon double precision := radians(lon2 - lon1);
  a double precision;
begin
  a := sin(dlat/2)^2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon/2)^2;
  return 2 * r * asin(sqrt(a));
end $$;

create or replace function validate_attendance() returns trigger language plpgsql as $$
declare
  cfg record;
  sched record;
  dow int := extract(dow from NEW.tanggal)::int;
  now_t time := (NEW.waktu at time zone 'Asia/Jakarta')::time;
  pulang time;
  hol date;
  actor_role user_role;
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
    if now_t < pulang then
      raise exception 'EARLY_CHECKOUT: belum jam pulang (%)', pulang;
    end if;
    NEW.status := 'tepat_waktu';
  end if;
  return NEW;
end $$;

drop trigger if exists trg_validate_attendance on attendance;
create trigger trg_validate_attendance before insert on attendance
  for each row execute function validate_attendance();
