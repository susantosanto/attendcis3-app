# ACCEPTANCE — Sprint 001: Auth Vertical Slice

## Task Gate (wajib hijau dulu)
- `npx tsc --noEmit` hijau; `npx eslint app/ lib/ components/` hijau; `supabase db reset` hijau. Bukti: tempel output.

## Kriteria (Given/When/Then + perintah + output harapan)
1. **Login email**: Given akun guru aktif; When login email+password benar via `app/login.tsx`; Then masuk + session persist restart. Perintah: manual di Expo Go. Harapan: tidak kembali ke login setelah reload.
2. **Login NIP**: Given NIP terdaftar; When input NIP+password; Then masuk (dipetakan ke email internal). Harapan: sama dengan #1.
3. **Kredensial salah**: When password salah; Then error generik, tanpa bocorkan akun. Harapan: pesan "NIP/email atau password salah".
4. **Device bind**: Given login pertama HP-A; When cek `profiles.device_id`; Then terisi UUID HP-A. Perintah: `select device_id from profiles where nip='...'`. Harapan: 1 baris non-null.
5. **Tolak HP kedua**: Given terikat HP-A; When login HP-B; Then ditolak + arahan hubungi operator. Harapan: pesan terlihat, tanpa session.
6. **Reset operator**: Given ditolak; When operator reset `device_id=NULL`; Then login HP-B sukses. Harapan: session terbentuk.

## Edge cases
- NIP kosong → validasi client, tanpa query. Harapan: pesan "NIP/email wajib diisi".
- Offline → badge offline, tombol login disabled/berpesan. Harapan: tanpa crash.
