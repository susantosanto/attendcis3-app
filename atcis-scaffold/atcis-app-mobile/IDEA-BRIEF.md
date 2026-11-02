# Idea Brief: AttendCis 3 (Attendance of SDN Cisomang 3)
*Sistem Kehadiran Digital SD Negeri Cisomang 3*

---

## One-Liner
Aplikasi presensi digital mobile berbasis React Native dan Supabase dengan validasi GPS geofencing presisi, anti-joki device lock, dan kamera selfie instan yang dirancang khusus untuk SD Negeri Cisomang 3.

---

## Users
- **Primary**: Guru & Tenaga Kependidikan SD Negeri Cisomang 3 (< 50 pengguna) yang memerlukan proses presensi harian (check-in/check-out) cepat, transparan, dan pengajuan izin/sakit yang praktis.
- **Secondary**: 
  - **Kepala Sekolah**: Memerlukan dashboard monitoring kehadiran harian secara realtime dan validasi approval izin/sakit (termasuk izin dari operator sekolah).
  - **Operator Sekolah**: Memerlukan alat rekapitulasi data kehadiran, pengaturan jadwal kerja/libur, reset kuncian perangkat guru, dan persetujuan izin guru.

---

## Core Problem
Pencatatan presensi manual maupun sistem lawas berbasis Google Sheets/Apps Script kerap mengalami kendala performa (timeout eksekusi script, kuota penyimpanan Drive cepat penuh akibat file foto presensi, serta tidak adanya notifikasi realtime). Tanpa aplikasi mobile khusus, potensi kecurangan absensi titip perangkat (joki) serta keterlambatan alur persetujuan izin dinas/sakit tetap menjadi hambatan operasional sekolah.

---

## Success Criteria
- [ ] Waktu proses presensi (buka kamera selfie hingga verifikasi GPS sukses) selesai dalam waktu **< 3 detik** pada jaringan 4G.
- [ ] Efisiensi penyimpanan cloud: **0 byte** beban penyimpanan foto presensi harian pada database & Supabase Storage (zero-storage policy).
- [ ] Akurasi validasi radius geofencing sekolah memiliki tingkat toleransi galat GPS **< 15 meter** dari titik koordinat resmi SDN Cisomang 3.
- [ ] Pencegahan 100% kecurangan joki absensi melalui penguncian 1 perangkat untuk 1 akun (*One Device One Account*).
- [ ] Pembaruan data presensi dan status approval diterima pengguna dalam **< 1 detik** menggunakan Supabase Realtime.

---

## Constraints
- **Technical**:
  - Frontend: **React Native (Expo SDK 51+, Expo Router)** di direktori `atcis-scaffold/atcis-app-mobile`.
  - Backend & Database: **Supabase** (PostgreSQL, Row Level Security, Supabase Auth, Supabase Storage, dan Supabase Realtime).
  - Notifikasi: **Expo Push Notifications** & Supabase Database Triggers.
  - Perangkat Pengguna: Smartphone Android & iOS (termasuk perangkat entry-level dengan RAM 2GB–3GB).
- **Business**:
  - Skala pengguna terfokus pada civitas SD Negeri Cisomang 3 (< 50 guru/staf).
  - Biaya operasional storage ditekan seminimal mungkin (foto presensi harian murni formalitas in-memory, tidak diunggah ke storage).
- **Team**:
  - Diimplementasikan secara bertahap (phased implementation) dari modul autentikasi & presensi inti hingga tab pimpinan/operator.

---

## In Scope
- **Otentikasi & Keamanan Akun**:
  - Dual login (NIP atau Email) dengan Supabase Auth.
  - Smart Device Lock (*fingerprint/UUID perangkat*) untuk mencegah satu HP dipakai bergantian oleh banyak akun guru.
- **Geolocation & Geofencing Presisi**:
  - Validasi jarak radius koordinat SDN Cisomang 3 menggunakan formula Haversine.
  - Pengecualian radius (VIP Bypass) otomatis khusus Kepala Sekolah & Operator saat bertugas dinas luar.
- **Sistem Presensi (Check In & Check Out)**:
  - Tampilan antarmuka mengacu pada `design-mockup.webp`.
  - Kamera selfie depan langsung (*live capture only*, memblokir unggahan dari galeri) sebagai bukti formalitas kehadiran *real-time*.
  - Deteksi keterlambatan otomatis dan input alasan wajib jika check-in melewati jam masuk.
  - Validasi jam pulang (termasuk penyesuaian khusus hari Jumat dan info hari libur esok hari).
  - Gamifikasi presensi: Dialog *"Check In Success"* dengan pemilihan emoji mood harian dan sertifikat kedisiplinan.
- **Pengajuan Izin, Sakit & Dinas**:
  - Formulir pengajuan izin/sakit dengan unggahan dokumen surat keterangan ke Supabase Storage.
  - Alur approval berjenjang berbasis peran (Izin Guru disetujui Admin/Kepsek; Izin Operator disetujui Kepsek).
  - Notifikasi instan ke guru melalui Supabase Realtime & Expo Push Notifications saat status pengajuan diperbarui.
- **Tab Pimpinan & Operator (Mobile-First Dashboard)**:
  - Tab terintegrasi untuk ringkasan metrik harian (Hadir, Sakit, Izin, Alpha).
  - Pengurutan cerdas (*Alpha priority* di urutan teratas) dan kartu rincian kehadiran per guru.
  - Fungsi reset kunci perangkat (Device ID) bagi guru yang berganti smartphone resmi.
- **Kalender & Jadwal Kerja**:
  - Pengaturan hari kerja dan hari libur sekolah yang memvalidasi tombol presensi.

---

## Out of Scope
- **Penyimpanan Foto Presensi ke Storage/Database**: Foto selfie harian murni diproses di memori perangkat saat capture dan **tidak disimpan** ke Supabase Storage maupun database PostgreSQL guna menghemat penyimpanan.
- **Biometric AI Face Recognition**: Tidak menggunakan modul kecerdasan buatan untuk pemindaian/pencocokan wajah.
- **Aplikasi Web Admin Terpisah**: Seluruh fitur operasional dan monitoring terpadu langsung di tab Pimpinan & Operator aplikasi mobile AttendCis 3.
- **Fitur Ekspor PDF/Excel Rumit**: Format cetak laporan tabular kompleks dieksklusikan dari rilis awal mobile app.

---

## Risks
- **Risiko Manipulasi Lokasi (Fake GPS)**:
  - *Mitigasi*: Integrasikan pemeriksaan `isFromMockProvider` / deteksi mock location pada sensor GPS perangkat.
- **Kompatibilitas Kamera pada HP Low-End**:
  - *Mitigasi*: Kompresi tampilan kamera client-side secara efisien dan langsung lepaskan memori setelah verifikasi capture berhasil tanpa menyimpan blob ke storage.
- **Kondisi Sinyal Fluktuatif**:
  - *Mitigasi*: Query Supabase dioptimalkan dengan payload seringkas mungkin dan indikator status jaringan yang jelas.

---

## Assumptions
- Pengguna adalah guru dan staf SD Negeri Cisomang 3 dengan smartphone yang dilengkapi kamera depan dan GPS.
- Titik koordinat acuan gerbang SDN Cisomang 3 dan radius toleransi (misal: 50–100 meter) sudah ditentukan secara presisi.
- File pendukung surat izin/sakit yang diunggah ke Supabase Storage dibatasi berukuran wajar (< 2 MB).
