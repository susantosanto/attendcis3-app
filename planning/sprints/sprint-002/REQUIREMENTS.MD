# REQUIREMENTS — Sprint 002: Presensi Geofence + Selfie

Sumber: PRD US-03/US-04/US-05/US-12, DATA-MODEL (attendance, schedules, holidays, school_config), MODULE-PLAN M3 (T3.1–T3.4).

## Goal (satu)
Check-in/out dengan selfie live + validasi geofence Haversine, plus aturan keterlambatan, jam Jumat/libur, dan bypass dinas luar.

## Cakupan
- Layar presensi meniru `design-mockup.webp`; kamera depan live-capture only (blokir galeri); lepas memori pasca-capture (zero-storage)
- Hitung jarak Haversine client; tolak di luar radius + tampilkan meter; tolak mock location
- INSERT attendance; status tepat_waktu/terlambat (alasan wajib)/cepat_pulang/bypass; unik 1 in/out per hari
- Jam pulang Jumat khusus; tombol nonaktif saat libur + info H-1 libur; bypass hanya kepsek/operator + alasan dinas (flag audit)
- Migrasi: schedules, holidays, attendance + function `haversine_m()` + trigger `validate_attendance()`

## Non-goal
- Izin/push (Sprint 003), dashboard/kalender-UI (Sprint 004), uji HP fisik (akhir)
