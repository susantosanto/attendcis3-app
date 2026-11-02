# BUILD-REPORT — Sprint 002+003+004 (MODE BUILD, 2026-10-31)

## Sprint 002 Presensi — COMPLETE (kode)
- C1 ✅ `004_schedules_holidays.sql` (seed senin–sabtu + minggu nonaktif)
- C2 ✅ `005_attendance.sql` (unique user/tanggal/tipe + indeks)
- C3 ✅ `008_functions.sql` (haversine_m + validate_attendance: mock/radius/libur/offday/terlambat-wajib-alasan/early-checkout/bypass-role) + `011_realtime_attendance.sql`
- C4 ✅ `lib/haversine.ts` (O(1), mirror DB) + `lib/attendance.ts` (map error DB → pesan Indonesia)
- C5 ✅ `SelfieCapture.tsx` (tanpa ImagePicker — grep hanya komentar) + `GeofenceGate.tsx` (3-sampel rata-rata, mock detect)
- C6 ✅ `presensi.tsx` + `(tabs)/_layout.tsx` + `SuccessMoodDialog.tsx`
- DSA: Haversine O(1) — 4 trig/call, tanpa loop/alokasi.

## Sprint 003 Izin/Approval/Push — COMPLETE (kode)
- `006_leave_audit.sql` (leave_requests + device_reset_audit + indeks partial pending)
- `009_leave_storage_rls.sql` (bucket surat-izin private + RLS jenjang: guru→operator/kepsek, operator→kepsek + trigger stamp + realtime leave)
- `lib/push.ts` (token register + realtime UPDATE → notifikasi lokal)
- `izin.tsx` (form + validasi + riwayat + realtime refresh), `approval.tsx` (antrean pending, reject wajib alasan)
- Upload file lampiran (<2 MB) via Storage: UI picker menyusul uji HP (saat ini keterangan teks; policy storage sudah siap).

## Sprint 004 Dashboard/Admin — COMPLETE (kode)
- `dashboard.tsx`: kartu Hadir/Izin/Sakit/Alpha, Alpha priority + abjad, filter hari ini, realtime via Muat Ulang, tombol Reset Device per-baris (admin only) + tulis audit.
- Tabs layout: 4 tab tampil (presensi/izin/approval/dashboard).

## Bukti DoD
- `npx tsc --noEmit` → exit 0. `npx expo lint` → 0 errors, 0 warnings (2 warning awal diperbaiki: Array<T> → T[], useEffect dep → useCallback).
- Deps baru: expo-camera@15.0.16, expo-location@17.0.1, expo-notifications@0.28.19.

## Menunggu user (SQL Editor, urutan): 004 → 005 → 008 → 011 → 006 → 009. Isi copy-paste ada di pesan chat. Uji HP fisik di akhir (semua sprint).
