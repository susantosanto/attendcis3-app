# PRD — AttendCis 3 (Attendance of SDN Cisomang 3)

Sumber: `atcis-scaffold/atcis-app-mobile/IDEA-BRIEF.md` (Idea Brief #1, confirmed).
Stack terkunci: React Native (Expo SDK 51+, Expo Router) + Supabase (PostgreSQL + RLS, Auth, Storage, Realtime) + Expo Push Notifications. Lokasi output: `atcis-scaffold/atcis-app-mobile`.

## 1. Ringkasan Produk

Aplikasi presensi mobile khusus SDN Cisomang 3 (<50 guru/staf). Check-in/out cepat dengan selfie live + validasi geofence Haversine, anti-joki One Device One Account + deteksi mock location, pengajuan izin/sakit/dinas dengan approval berjenjang dan notifikasi realtime, dashboard pimpinan/operator mobile-first, dan kalender hari kerja/libur. Foto selfie harian bersifat formalitas in-memory — tidak disimpan (zero-storage policy).

## 2. User Stories (12)

### US-01 — Login NIP/Email
As a Guru, I want to login dengan NIP atau Email + password, So that saya bisa mengakses presensi dengan akun resmi saya.
- [ ] Login NIP (dipetakan ke email internal) dan login email keduanya berfungsi via Supabase Auth
- [ ] Session persist; logout menghapus session
- [ ] Kredensial salah menampilkan error tanpa membocorkan akun mana yang salah

### US-02 — Device Lock
As a Guru, I want to akun saya terkunci ke 1 perangkat, So that tidak ada yang bisa jokikan absensi saya dari HP lain.
- [ ] Login pertama mengikat `device_id` (UUID/fingerprint) ke profil
- [ ] Login dari perangkat berbeda ditolak dengan pesan + arahan hubungi operator
- [ ] Edge: ganti HP resmi → bisa dipakai lagi hanya setelah operator reset

### US-03 — Check-In Geofence + Selfie
As a Guru, I want to check-in dengan selfie langsung + validasi lokasi, So that kehadiran saya tercatat valid <3 detik.
- [ ] Kamera depan live-capture only; picker galeri diblokir
- [ ] Jarak Haversine ke titik sekolah ≤ radius (default 100 m, toleransi galat <15 m); di luar radius tombol ditolak + tampilkan jarak meter
- [ ] Mock location (`isFromMockProvider`) → check-in ditolak
- [ ] Foto tidak diupload/di-persist (verifikasi in-memory lalu dibuang)
- [ ] Sukses → dialog "Check In Success" + pilih emoji mood harian

### US-04 — Keterlambatan + Alasan Wajib
As a Guru, I want to sistem menandai saya terlambat otomatis, So that data disiplin transparan.
- [ ] Check-in > jam masuk → status `terlambat`, wajib isi alasan sebelum submit
- [ ] Tanpa alasan → submit diblokir

### US-05 — Check-Out + Aturan Jumat/Libur
As a Guru, I want to check-out sesuai jam pulang, So that jam kerja tercatat benar.
- [ ] Check-out sebelum jam pulang ditolak (kecuali role VIP bypass dinas luar)
- [ ] Jam pulang Jumat berbeda (konfigurabel); H-1 libur tampil info "Besok libur"
- [ ] 1 check-in + 1 check-out per hari per user (idempoten)

### US-06 — Pengajuan Izin/Sakit/Dinas
As a Guru, I want to mengajukan izin/sakit/dinas + lampiran surat, So that ketidakhadiran saya resmi tercatat.
- [ ] Form: jenis, tanggal mulai–selesai, keterangan, file <2 MB (jpg/png/pdf) ke Supabase Storage
- [ ] File >2 MB atau tipe tak diizinkan ditolak client + server
- [ ] Pengajuan tercatat `pending`, tidak bisa double-submit overlapping

### US-07 — Approval Berjenjang
As a Kepala Sekolah, I want to menyetujui/menolak pengajuan, So that alur izin tidak macet.
- [ ] Izin guru → disetujui Operator atau Kepsek; izin operator → hanya Kepsek
- [ ] Approve/reject wajib (reject wajib alasan); status terupdate <1 detik via Realtime

### US-08 — Notifikasi Realtime
As a Guru, I want to notifikasi instan saat status pengajuan berubah, So that saya tidak perlu menanyakan manual.
- [ ] Push (Expo) + realtime in-app tiba <1 detik setelah approval
- [ ] Tap notifikasi → buka detail pengajuan

### US-09 — Dashboard Pimpinan/Operator
As a Kepala Sekolah/Operator, I want to ringkasan harian Hadir/Sakit/Izin/Alpha, So that saya bisa monitoring realtime.
- [ ] Kartu metrik + daftar per-guru, Alpha priority di atas
- [ ] Filter tanggal; refresh realtime

### US-10 — Reset Device ID
As a Operator, I want to mereset kunci perangkat guru, So that guru yang ganti HP resmi bisa login lagi.
- [ ] Hanya role operator/kepsek; tercatat audit (siapa, kapan, user target)

### US-11 — Kalender Kerja/Libur
As a Operator, I want to mengatur hari kerja, jam masuk/pulang (termasuk Jumat), dan hari libur, So that validasi tombol presensi selalu benar.
- [ ] Tanggal libur → tombol check-in/out nonaktif dengan label "Libur"
- [ ] Perubahan jadwal berlaku realtime tanpa update aplikasi

### US-12 — VIP Bypass Dinas Luar
As a Kepala Sekolah/Operator, I want to presensi saat dinas luar tanpa geofence, So that tugas luar tetap tercatat.
- [ ] Bypass hanya role kepsek/operator + wajib pilih alasan dinas
- [ ] Tercatat flag `is_bypass=true` dan terlihat di dashboard (audit)

## 3. API Surface (Supabase-first; tanpa REST custom di MVP)

| Layer | Operasi | Auth | Keterangan | Fase |
|---|---|---|---|---|
| Auth | `signInWithPassword(email|NIP-mapped, password)` | No | Dual login; NIP dipetakan ke email di profil | MVP |
| DB `profiles` | SELECT profil sendiri; UPDATE `expo_push_token` sendiri | Yes | RLS: owner-only | MVP |
| DB `profiles` | UPDATE `device_id=NULL` (reset) | Yes (operator/kepsek) | RLS: role-based | MVP |
| DB `schedules` | SELECT aktif; INSERT/UPDATE | Yes; tulis: operator/kepsek | Jam kerja + Jumat khusus | MVP |
| DB `holidays` | SELECT; INSERT/DELETE | Yes; tulis: operator/kepsek | Hari libur | MVP |
| DB `attendance` | INSERT check-in/out; SELECT riwayat | Yes | RLS owner-insert + validasi radius/jam via policy/function | MVP |
| DB `leave_requests` | INSERT + upload lampiran; SELECT miliknya | Yes | Storage bucket `surat-izin` (<2 MB, jpg/png/pdf) | MVP |
| DB `leave_requests` | UPDATE approve/reject | Yes (sesuai jenjang) | Trigger → notifikasi | MVP |
| Realtime | Subscribe `attendance`, `leave_requests`, `schedules`, `holidays` | Yes | Update <1 detik | MVP |
| Push | Expo Push via Edge Function/Trigger `send-push-on-approval` | Service role | Payload: status pengajuan | MVP |

Contoh shape:
```json
// attendance INSERT
{"user_id":"uuid","tanggal":"2026-10-31","tipe":"in","latitude":-6.9,"longitude":107.4,"jarak_meter":42,"status":"tepat_waktu","mood":"😄","is_bypass":false}
// leave_requests INSERT
{"user_id":"uuid","jenis":"sakit","tgl_mulai":"2026-11-01","tgl_selesai":"2026-11-02","keterangan":"Demam","file_url":"surat-izin/uuid/surat.jpg","status":"pending"}
```

## 4. Data Requirements

| Entity | Key Fields | Relationships |
|---|---|---|
| profiles | id (auth FK), nip unique, email, nama, role (guru/operator/kepsek), device_id unique-nullable, expo_push_token | has many attendance, leave_requests |
| schedules | id, hari (senin–minggu), jam_masuk, jam_pulang, jam_pulang_jumat, aktif | divalidasi saat attendance |
| holidays | id, tanggal unique, keterangan | menonaktifkan tombol presensi |
| attendance | id, user_id, tanggal, tipe (in/out), waktu (timestamptz), latitude, longitude, jarak_meter, status (tepat_waktu/terlambat/cepat_pulang/bypass), alasan_terlambat nullable, mood nullable, is_bypass bool | belongs to profiles; unique(user_id,tanggal,tipe) |
| leave_requests | id, user_id, jenis (izin/sakit/dinas), tgl_mulai, tgl_selesai, keterangan, file_url nullable, status (pending/approved/rejected), decided_by nullable, decided_at nullable, reject_reason nullable | belongs to profiles; approver = profiles |
| device_reset_audit | id, target_user_id, reset_by, waktu | belongs to profiles |
| school_config | id=1, latitude, longitude, radius_meter (default 100), nama_sekolah | singleton dibaca saat validasi |

## 5. NFR

Performance:
- Alur selfie→verifikasi GPS sukses <3 detik di 4G (payload Supabase minimal, kompresi kamera client-side)
- Update realtime (presensi/approval) <1 detik
- Galat GPS <15 m dari titik resmi
Storage:
- 0 byte foto presensi harian di DB/Storage; lampiran izin <2 MB, hanya jpg/png/pdf
Security:
- Supabase Auth + RLS di semua tabel; service_role hanya di server/trigger
- One Device One Account; tolak mock location; blokir upload galeri (live-capture only)
- Validasi ganda client + database function (radius, jam, duplikat harian)
Scalability:
- <50 pengguna; connection pooling Supabase default; Realtime channel per-hari
- RAM 2–3 GB: lepas memori kamera segera setelah capture, lazy-load dashboard
Compliance/Operasional:
- Data warga sekolah; APK/IPA internal, tanpa publikasi Play Store di MVP
- Phased rollout: (1) auth+presensi, (2) izin/approval+notif, (3) dashboard+kalender

## 6. Success Metrics

| Brief Criterion | Metric | Target |
|---|---|---|
| Presensi <3 detik | p95 durasi capture→sukses (instrumentasi client) | <3 dtk @4G |
| Zero-storage foto | Byte foto presensi di Storage/DB per hari | 0 byte |
| Galat <15 m | Deviasi validasi vs titik resmi (uji lapangan) | <15 m |
| 100% anti-joki | Login perangkat kedua tanpa reset yang lolos | 0 lolos |
| Realtime <1 detik | Delay trigger→klien (approval/presensi) | <1 dtk |

## 7. Out of Scope (disalin dari Brief — JANGAN diimplementasikan)

- Penyimpanan foto presensi ke Storage/Database (in-memory only, langsung dibuang)
- Biometric AI Face Recognition
- Aplikasi web admin terpisah (semua di tab mobile)
- Ekspor PDF/Excel tabular kompleks di rilis awal

> Item di atas eksplisit dikecualikan. Jika user story menyiratkan fitur tersebut, hapus/tandai Phase 2.

## 8. Self-Review

- [x] Setiap story punya acceptance criteria teruji
- [x] API surface menutup semua stories (auth→presensi→izin→dashboard→kalender)
- [x] Entitas mencakup semua yang disebut stories
- [x] NFR spesifik & terukur (detik, meter, byte)
- [x] Out-of-scope ada dan dihormati (zero-storage, tanpa face-AI, tanpa web admin, tanpa ekspor kompleks)
- [x] Metrik memetakan 1:1 ke success criteria brief

## 9. Next Step

Review PRD ini → konfirmasi/perubahan → lanjut `/tech-stack-advisor` (stack sudah terkunci di brief, jadi fokus ke keputusan Expo modules, strategi RLS/function, dan struktur direktori `atcis-app-mobile`).
