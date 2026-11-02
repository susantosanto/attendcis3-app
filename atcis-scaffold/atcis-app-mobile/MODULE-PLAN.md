# Module Plan — AttendCis 3

Input: `PRD.md` (12 US) + `TECH-STACK.md` (Expo + Supabase) + `DATA-MODEL.md` (7 tabel, migrasi 001–011). Root kode: `atcis-scaffold/atcis-app-mobile`.

## 1. Module Map

### M1: Foundation (config, Supabase client, design token)
- Entities: school_config (read)
- Responsibility: boot app, env, Supabase client, tema dari `design-mockup.webp`, error/network indicator
- US: semua (cross-cutting)
- Dependencies: none

### M2: Auth + Device Lock
- Entities: profiles
- Responsibility: login NIP/email, session persist, binding device_id, tolak perangkat kedua
- US: US-01, US-02
- Dependencies: M1

### M3: Presensi (check-in/out + geofence + selfie)
- Entities: attendance, schedules, holidays, school_config
- Responsibility: live-capture only, Haversine client, tolak mock, kirim INSERT, dialog sukses + mood, aturan Jumat/libur
- US: US-03, US-04, US-05, US-12 (bypass flag)
- Dependencies: M1, M2

### M4: Izin/Sakit/Dinas + Approval + Push
- Entities: leave_requests, Storage `surat-izin`
- Responsibility: form + upload <2 MB, antrean approval berjenjang, trigger → Expo push, deep-link detail
- US: US-06, US-07, US-08
- Dependencies: M1, M2

### M5: Dashboard Pimpinan/Operator + Reset Device + Kalender
- Entities: attendance, profiles, device_reset_audit, schedules, holidays
- Responsibility: metrik harian + Alpha priority, reset device + audit, CRUD jadwal/libur
- US: US-09, US-10, US-11
- Dependencies: M1, M2 (read M3/M4)

### M6: Supabase Backend (migrasi, function, RLS, realtime, storage policy)
- Entities: semua 7 tabel
- Responsibility: migrasi 001–011, `haversine_m()` + `validate_attendance()`, RLS per-role, bucket policy, trigger push
- US: semua (penegakan server)
- Dependencies: none (bisa jalan paralel dengan M1/M2 awal)

## 2. Dependency Graph

```
M1 Foundation (no deps) ──┐
                           ├──▶ M2 Auth/Device ──┬──▶ M3 Presensi
M6 Backend (no deps, paralel)                     ├──▶ M4 Izin/Approval/Push
                                                  └──▶ M5 Dashboard/Kalender (read M3/M4)
Urutan: M1 → M2 → (M3, M4 paralel) → M5 ; M6 paralel sejak awal, wajib selesai sebelum uji M3/M4
```

## 3. Task Breakdown (semua ≤2 jam)

## M1 Foundation
### T1.1 Boot Expo Router + TS + env (1h, paralel: ya)
- Init di `atcis-app-mobile`, env Supabase URL/anon, struktur `app/` tabs
- Done: `npx expo start` jalan, routing login/(tabs) terbentuk

### T1.2 Supabase client + network indicator (1h, butuh T1.1)
- `lib/supabase.ts`, hook online/offline, payload minimal
- Done: select `school_config` tampil di layar debug

### T1.3 Tema dari design-mockup.webp (1.5h, paralel dengan T1.2)
- Token warna/spacing, komponen Button/Card/Dialog
- Done: layar presensi meniru mockup

## M2 Auth + Device Lock
### T2.1 Login NIP/email + session (1.5h, butuh T1.1-T1.2)
- Mapping NIP→email, `signInWithPassword`, persist, error generik
- Done: US-01 AC terpenuhi

### T2.2 Binding device_id + tolak perangkat kedua (1.5h, butuh T2.1 + M6 policy)
- `expo-device/application` UUID, INSERT/cek device_id, pesan hubungi operator
- Done: US-02 AC terpenuhi

## M3 Presensi
### T3.1 Layar check-in: kamera live + blokir galeri (2h, butuh M2)
- `expo-camera` depan, tanpa picker, lepas memori pasca-capture
- Done: capture <3 dtk di HP uji, tanpa file tersimpan

### T3.2 Geofence Haversine + mock detect (1.5h, butuh T3.1)
- `expo-location`, hitung jarak, tampilkan meter, tolak mock/out-of-radius
- Done: US-03 AC (radius 100 m, galat <15 m di uji lapangan)

### T3.3 Submit in/out + keterlambatan + Jumat/libur (2h, butuh T3.2 + M6 function)
- INSERT attendance, alasan wajib saat terlambat, tolak checkout dini, info H-1 libur
- Done: US-04 + US-05 AC

### T3.4 Dialog sukses + mood + bypass flag (1h, butuh T3.3)
- Dialog + emoji, `is_bypass` hanya kepsek/operator + alasan dinas
- Done: US-12 AC + audit terlihat

## M4 Izin + Approval + Push
### T4.1 Form izin + upload <2 MB (2h, butuh M2)
- react-hook-form+zod, picker jpg/png/pdf, upload bucket private
- Done: US-06 AC, file besar/tipe salah ditolak 2 lapis

### T4.2 Antrean approval berjenjang (1.5h, butuh T4.1 + M6 RLS)
- List pending, approve/reject (reject wajib alasan), update <1 dtk
- Done: US-07 AC (guru→operator/kepsek; operator→kepsek)

### T4.3 Push + deep-link (1.5h, butuh T4.2 + M6 trigger)
- `expo-notifications` token, terima push, tap → detail
- Done: US-08 AC

## M5 Dashboard + Admin
### T5.1 Dashboard harian + Alpha priority (2h, butuh M3)
- Kartu Hadir/Sakit/Izin/Alpha, sort alpha di atas, filter tanggal, realtime
- Done: US-09 AC

### T5.2 Reset device + audit (1h, butuh M2)
- Tombol reset (operator/kepsek saja), tulis audit
- Done: US-10 AC

### T5.3 CRUD jadwal + libur (1.5h, butuh M5.1)
- Atur jam/Jumat/libur, tombol presensi nonaktif saat libur
- Done: US-11 AC

## M6 Backend
### T6.1 Migrasi 001–007 tabel + seed (1.5h, paralel: ya)
- Enums, profiles, school_config + seed koordinat, schedules/holidays + seed, attendance, leave, audit
- Done: `supabase db reset` hijau

### T6.2 Function + trigger validasi (1.5h, butuh T6.1)
- `haversine_m()`, `validate_attendance()` (mock/radius/jam/duplikat/bypass-role)
- Done: curl bypass ditolak di level DB

### T6.3 RLS + Storage policy + Realtime/Push (2h, butuh T6.2)
- Policy per-tabel (matriks US-07/US-10), bucket private, trigger push
- Done: uji per-role lolos, foto presensi 0 byte

## 4. Parallelization Map

### Fase A (paralel): T1.1, T6.1
### Fase B (paralel setelah A): T1.2, T1.3, T6.2
### Fase C: T2.1 → T2.2 (+ T6.3 bersamaan)
### Fase D (paralel setelah C): T3.1→T3.2→T3.3→T3.4 | T4.1→T4.2→T4.3
### Fase E (setelah D): T5.1 → T5.2 + T5.3

## 5. File Structure (Expo Router)

```
atcis-scaffold/atcis-app-mobile/
├── app/
│   ├── _layout.tsx            # M1: provider + tema
│   ├── login.tsx              # M2: T2.1
│   └── (tabs)/
│       ├── presensi.tsx       # M3: T3.1–T3.4
│       ├── izin.tsx           # M4: T4.1 (form) + riwayat
│       ├── approval.tsx       # M4: T4.2 (kepsek/operator)
│       └── dashboard.tsx      # M5: T5.1–T5.3
├── components/
│   ├── SelfieCapture.tsx      # M3 live-capture, in-memory
│   ├── GeofenceGate.tsx       # M3 jarak + mock check
│   ├── SuccessMoodDialog.tsx  # M3 mood
│   ├── LeaveForm.tsx          # M4
│   └── MetricCard.tsx         # M5
├── lib/
│   ├── supabase.ts            # M1
│   ├── haversine.ts           # M3 (mirror client dari DB fn)
│   ├── device.ts              # M2 device_id
│   └── push.ts                # M4 token + handler
├── supabase/
│   ├── migrations/001–011_*.sql  # M6
│   └── functions/send-push-on-approval/
└── assets/design-mockup.webp
```

Aturan: M3/M4 tidak import komponen M5; logika validasi di `lib/` mirror function DB; tidak ada file yang ditulis 2 task paralel dalam satu fase.

## 6. Risk Flags

| Task | Risk | Mitigasi |
|---|---|---|
| T3.1 | OOM HP 2 GB | Resolusi rendah, `takePictureAsync({quality:0.4})`, unmount langsung |
| T3.2 | GPS drift >15 m | Rata-rata 3 sampel, tampilkan akurasi, radius 100 m |
| T2.2/T6.3 | Device lock diloloskan via reinstall | device_id dari UUID persisten + cek server, bukan AsyncStorage saja |
| T6.2 | Haversine beda client/DB | Satu rumus, uji: 5 titik dalam/luar radius identik |
| T4.1 | Upload >2 MB lolos client | Policy Storage + check function, pesan jelas |
| T4.3 | Push delay >1 dtk | Payload <2 KB, fallback realtime in-app |
| T5.1 | Dashboard lambat | Gunakan indeks tanggal + limit, lazy tab |

## 7. Self-Review
- [x] Semua modul memetakan ke US (M1 cross-cutting, M2→US01-02, M3→US03-05+12, M4→US06-08, M5→US09-11, M6→semua)
- [x] Setiap task ≤2 jam + estimasi eksplisit
- [x] Dependensi eksplisit; paralel hanya file independen
- [x] Struktur ikuti konvensi Expo Router
- [x] Setiap task punya definisi done

Next: `/ai-coding-coach` — mulai dari T1.1 + T6.1 (Fase A paralel).
