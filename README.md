# AttendCis 3 — SDN Cisomang 3

Sistem Kehadiran Digital premium untuk guru & staf **SD Negeri Cisomang 3**. Validasi GPS 50m, anti-joki One Device One Account, selfie otomatis, izin & approval realtime.

**Stack:** React Native (Expo SDK 51) + TypeScript + Supabase (Postgres + RLS + Auth + Storage + Realtime) • Font Plus Jakarta Sans • Palet Madu Amber `#F59E0B` + Putih + Ink

![Expo](https://img.shields.io/badge/Expo-51-black) ![Supabase](https://img.shields.io/badge/Supabase-Postgres-3FCF8E)

## Fitur Utama
- **Presensi:** Check In/Out geofence Haversine, tolak mock location, anti-duplikat, aturan Jumat & hari libur, info H-1 libur
- **Selfie:** live capture otomatis (countdown) — zero-storage, tidak disimpan
- **Izin/Sakit/Dinas:** batas jam 09:00 (Dinas bebas), lampiran <2MB, status pending
- **Approval:** Guru → Operator/Kepsek, Operator → Kepsek, reject wajib alasan
- **Dashboard:** Hadir/Sakit/Izin/Alpha (Alpha di atas), normalisasi nama, detail per guru, reset device + audit
- **Kalender:** CRUD jadwal & hari libur (admin), import libur nasional
- **Keamanan:** RLS per peran, `validate_attendance` & `validate_leave_time` di DB, `bind_device` RPC

## Struktur
```
supabase/migrations/  — 12 migrasi versioned (sumber kebenaran)
atcis-scaffold/atcis-app-mobile/
  app/(tabs)/         — presensi, izin, kalender, dashboard, akun, menu, qa, tim
  components/         — ui.tsx (Btn, Card, ScreenHeader), icons.tsx (Feather + LogoMark plum)
  lib/                — supabase, haversine, device, push
  supabase/migrations/— cermin migrasi app
scripts/db-push.ps1   — push migrasi (token tidak disimpan)
```

## Development (sampai Production)
Lihat `DEVELOPMENT.md` — prosedur ubah DB, perintah link/status/query, roadmap production (APK internal, OTA, backup).

## Quick Start
```bash
cd atcis-scaffold/atcis-app-mobile
cp .env.example .env  # isi URL + anon key
npm install
npx expo start        # atau --tunnel / --clear
```

Supabase project: `yfjodmjvvjqxgrdpqott` — koordinat `-6.719556, 107.464056`, radius 50m. Migrasi sudah sinkron (001–013).

## Lisensi
Internal SDN Cisomang 3. Ilustrasi hero: unDraw MIT.

Dikembangkan oleh **Operator SD Negeri Cisomang 3**.
