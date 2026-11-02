-- 001 enums (Sprint 001)
do $$ begin create type user_role as enum ('guru','operator','kepsek');
exception when duplicate_object then null; end $$;
do $$ begin create type att_tipe as enum ('in','out');
exception when duplicate_object then null; end $$;
do $$ begin create type att_status as enum ('tepat_waktu','terlambat','cepat_pulang','bypass');
exception when duplicate_object then null; end $$;
do $$ begin create type leave_jenis as enum ('izin','sakit','dinas');
exception when duplicate_object then null; end $$;
do $$ begin create type leave_status as enum ('pending','approved','rejected');
exception when duplicate_object then null; end $$;
