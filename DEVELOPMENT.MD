# Development AttendCis 3 — dari sekarang sampai Production

Dokumen ini satu-satunya acuan workflow. Backend: Supabase (`yfjodmjvvjqxgrdpqott`).

## 1. Struktur permanen
- `supabase/migrations/20260101*.sql` — 12 file, timestamp, URUTAN JANGAN DIUBAH. Remote sudah sinkron (history 001–013 applied).
- `atcis-scaffold/atcis-app-mobile/` — kode Expo. Migrasi SQL sumber ada juga di `supabase/migrations/` (cermin).
- Token/secret TIDAK PERNAH masuk repo. `.env` hanya lokal.

## 2. Ubah database (prosedur baku)
1. Tulis/edit file di `atcis-scaffold/atcis-app-mobile/supabase/migrations/` (format `NNN_nama.sql`).
2. Salin ke `supabase/migrations/` dengan prefix timestamp berikutnya (`20260101HHMMSS_`).
3. Jalankan: `.\scripts\db-push.ps1` (minta `SUPABASE_ACCESS_TOKEN` sekali, tidak disimpan).
4. Verifikasi: `npx supabase db query --linked '<SELECT cek>'`.

DILARANG: edit langsung via dashboard untuk hal yang bisa jadi migrasi (kecuali darurat; lalu `supabase db pull` + commit).

## 3. Perintah penting
- Link ulang (ganti laptop): `npx supabase link --project-ref yfjodmjvvjqxgrdpqott`
- Cek status migrasi: `npx supabase migration list --linked`
- Lihat tabel: `npx supabase db query --linked 'select ...'`

## 4. Roadmap ke Production
- [ ] Tutup Mode pratinjau di login (hapus link bypass) + hapus debug log
- [ ] Pin versi di eas.json, `npx eas build --platform android --profile production` (APK internal)
- [ ] OTA update: `npx eas update` untuk perubahan JS (jadwal/jam tanpa build ulang)
- [ ] Koordinat final + radius final (sudah 50 m) + seed jadwal tahun berjalan
- [ ] Buat akun operator + kepsek resmi; revoke semua token sementara
- [ ] Backup: `npx supabase db dump --linked -f backup-YYYYMMDD.sql` (jadwalkan mingguan)
