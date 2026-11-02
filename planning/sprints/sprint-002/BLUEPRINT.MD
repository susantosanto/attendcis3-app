# BLUEPRINT — Sprint 002: Presensi

Stack: Expo SDK 51 + Supabase (tidak berubah).

## Files (exact)
- `app/(tabs)/_layout.tsx` — tab presensi (+ placeholder izin/approval/dashboard Sprint 003/004)
- `app/(tabs)/presensi.tsx` — layar presensi
- `components/SelfieCapture.tsx` — expo-camera live only
- `components/GeofenceGate.tsx` — lokasi + Haversine + mock check
- `components/SuccessMoodDialog.tsx` — dialog sukses + emoji mood
- `lib/haversine.ts` — mirror rumus DB (satu rumus, diuji identik)
- `lib/attendance.ts` — submit in/out + aturan jam/libur/Jumat
- `supabase/migrations/004_schedules_holidays.sql`
- `supabase/migrations/005_attendance.sql`
- `supabase/migrations/008_functions.sql` (haversine_m + validate_attendance)
- `supabase/migrations/011_realtime_attendance.sql` (publication attendance)

## Dependencies (pinned, tambah)
- expo-camera 15.0.16, expo-location 17.0.1 (via `npm install --save` karena policy EALLOWSCRIPTS blokir `expo install`)

## Tasks & DoD
- C1: migrasi 004 (schedules+holidays+seed senin–sabtu). DoD: SQL siap paste (uji via SQL Editor, tempel "Success").
- C2: migrasi 005 (attendance + unique + indeks). DoD: sama.
- C3: migrasi 008 (function+trigger) + 011 (realtime). DoD: uji 5 titik dalam/luar radius identik client/DB.
- C4: `lib/haversine.ts` + `lib/attendance.ts`. DoD: `npx tsc --noEmit` hijau.
- C5: `SelfieCapture` + `GeofenceGate`. DoD: tsc hijau; tanpa file picker/galeri di kode (grep bukti).
- C6: `presensi.tsx` + tabs layout + `SuccessMoodDialog` (alasan wajib saat terlambat, info H-1 libur, bypass khusus role). DoD: tsc + `npx expo lint` hijau.

DSA: C4 HOT PATH (haversine per submit) — DSA: Haversine O(1) aritmetika tetap — 4 operasi trig per hitung, tanpa loop/alokasi, aman RAM 2 GB.
