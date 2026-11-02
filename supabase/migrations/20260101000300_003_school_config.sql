-- 003 school_config + seed (Sprint 001)
create table school_config (
  id smallint primary key default 1 check (id = 1),
  nama_sekolah varchar(100) not null default 'SDN Cisomang 3',
  latitude double precision not null,
  longitude double precision not null,
  radius_meter int not null default 100 check (radius_meter between 20 and 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Koordinat gerbang SDN Cisomang 3: 6°43'10.4"S 107°27'50.6"E (1 Nov 2026)
insert into school_config (id, latitude, longitude, radius_meter, nama_sekolah)
values (1, -6.719556, 107.464056, 50, 'SDN Cisomang 3')
on conflict (id) do nothing;
