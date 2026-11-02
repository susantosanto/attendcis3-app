# ACCEPTANCE — Sprint 002: Presensi

## Task Gate
- `npx tsc --noEmit` hijau; `npx expo lint` hijau; 4 migrasi "Success" di SQL Editor.

## Kriteria (Given/When/Then — uji logika; uji HP fisik di akhir)
1. **Dalam radius**: Given koordinat ≤100 m; When submit; Then INSERT sukses status tepat_waktu/mood tersimpan. Perintah: panggil `submitAttendance` dengan titik uji / SQL insert titik dalam. Harapan: 1 baris.
2. **Luar radius**: Given titik >100 m; When submit; Then ditolak + tampil jarak meter. Harapan: tanpa baris baru, pesan jarak.
3. **Mock location**: Given `is_mock=true`; When submit; Then ditolak di DB (trigger). Harapan: error validasi.
4. **Terlambat wajib alasan**: Given lewat jam masuk; When tanpa alasan; Then diblokir client. Harapan: pesan "alasan wajib".
5. **Duplikat**: Given sudah check-in hari ini; When check-in lagi; Then unique violation. Harapan: 1 in/hari.
6. **Libur/Jumat**: Given tanggal libur; Then tombol nonaktif "Libur". Given Jumat; Then jam pulang pakai `jam_pulang_jumat`.
7. **Bypass**: Given role guru; When bypass; Then ditolak. Given kepsek+alasan dinas; Then sukses flag `is_bypass=true`.

## Edge
- GPS akurasi buruk (>50 m): tampilkan peringatan, tetap hitung dengan 3-sampel rata-rata.
- Tanpa galeri: grep `ImagePicker|launchImageLibrary` → 0 hasil di `components/`.
