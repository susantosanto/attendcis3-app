# Tech Stack — AttendCis 3

Input: `PRD.md` + `IDEA-BRIEF.md`. Stack inti sudah dikunci brief (Expo + Supabase); dokumen ini merinci pilihan per-layer, alternatif, diagram, decision log, dan risiko.

## Requirement Extraction

- Performance: presensi <3 dtk @4G, realtime <1 dtk, galat GPS <15 m
- Scale: <50 user, 1 sekolah, payload kecil, RAM 2–3 GB
- Security: Supabase Auth + RLS, One Device One Account, tolak mock location, zero-storage foto
- Team: solo/operator sekolah, phased rollout, tanpa backend custom
- Deploy: APK/IPA internal (EAS build), Supabase cloud, tanpa web admin

## Recommendation Matrix

## Frontend
| Choice | Why | Trade-off |
|---|---|---|
| Expo SDK 51+ + Expo Router + TypeScript | Dikunci brief; file-based routing, OTA via EAS Update, akses kamera/GPS/notif via Expo modules | Ketergantungan ekosistem Expo; native module custom terbatas |
| Alternative: bare React Native CLI | Kontrol native penuh | Setup/pembuatan build jauh lebih berat untuk tim sekolah |

Lib pendukung: `expo-camera` (live capture), `expo-location` (GPS + mock check), `expo-device` + `expo-application` (device_id), `expo-notifications` (push), `@supabase/supabase-js`, `react-native-maps` (opsional debug jarak), `zustand` (state ringan), `react-hook-form+zod` (form izin), `tamagui`/`nativewind` untuk UI cepat.

## Backend
| Choice | Why | Trade-off |
|---|---|---|
| Supabase (Postgres + Auth + RLS + Realtime + Storage + Edge Functions + pg_cron) | Tanpa server custom; RLS + function validasi radius/jam; trigger push; cocok <50 user | Kunci ke vendor Supabase; limit Realtime/Storage free-tier perlu diawasi |
| Alternative: Firebase | Realtime mudah | Aturan keamanan lebih lemah untuk RLS kompleks + biaya storage foto |

## Database
| Choice | Why | Trade-off |
|---|---|---|
| PostgreSQL (Supabase) + PostGIS-lite (haversine via function, tanpa extensi berat) | ACID, unique(user,tanggal,tipe), RLS per-role, function `validate_attendance()` | Perlu indeks tanggal/user agar dashboard cepat |
| Alternative: MongoDB | Skema fleksibel | Join/report + RLS setara tidak ada |

## Auth
| Choice | Why | Trade-off |
|---|---|---|
| Supabase Auth (email/pass; NIP dipetakan ke email `nip@attendcis.local`) | Gratis, session persist, integrasi RLS langsung | Dual-login butuh kolom mapping nip→email |
| Alternative: Clerk/Auth0 | UI siap | Biaya + ketergantungan eksternal |

## Storage
| Choice | Why | Trade-off |
|---|---|---|
| Supabase Storage bucket `surat-izin` (private, <2 MB, jpg/png/pdf) | Hanya lampiran izin; foto presensi TIDAK disimpan | Perlu policy ketat + validasi MIME/size |
| Alternative: S3 langsung | Murah skala besar | Overkill untuk <50 user |

## Hosting/Deploy
| Choice | Why | Trade-off |
|---|---|---|
| EAS Build + EAS Update (internal APK/IPA) + Supabase Cloud | Tanpa Play Store di MVP; OTA untuk jadwal/aturan | Kuota build EAS free-tier |
| Alternative: Play Store/App Store publik | Distribusi luas | Review + biaya akun, tidak perlu untuk 1 sekolah |

## Architecture Diagram

```
┌──────────┐    ┌──────────────────┐    ┌─────────────────────┐
│ Android /│───▶│ Expo App         │───▶│ Supabase Cloud      │
│ iOS (2GB)│    │ Router+Camera/GPS│    │ Auth│Postgres+RLS    │
└──────────┘    │ DeviceLock/Mood  │    │ Realtime│Storage     │
                └────────┬─────────┘    │ Edge Fn push│pg_cron │
                         │ push token   └─────────┬───────────┘
                         ▼                        ▼
                ┌─────────────────┐    ┌─────────────────────┐
                │ Expo PushSvc    │◀───│ Trigger on approval │
                └─────────────────┘    └─────────────────────┘
```

Alur presensi: capture in-memory → hitung Haversine client → INSERT attendance → function validasi radius/jam/duplikat → Realtime broadcast. Alur izin: upload surat → INSERT pending → approval → trigger push.

## Decision Log

### D1: Frontend = Expo SDK 51 + Router + TS — 2026-10-31
- Rationale: dikunci brief; tercepat untuk solo dev + OTA tanpa store
- Alternatif: RN CLI (ditolak: overhead build), Flutter (ditolak: tim JS)
- Revisit jika: butuh modul native custom berat / >5000 user

### D2: Backend = Supabase all-in-one — 2026-10-31
- Rationale: RLS + function gantikan API custom; Realtime <1 dtk bawaan
- Alternatif: Firebase (ditolak: RLS lemah), Express custom (ditolak: maintenance)
- Revisit jika: butuh logika berat di luar Postgres

### D3: Validasi di DB function, bukan hanya client — 2026-10-31
- Rationale: cegah bypass (fake GPS/curl); client hanya UX cepat
- Alternatif: validasi client saja (ditolak: tidak aman)

### D4: Zero-storage selfie — 2026-10-31
- Rationale: hemat biaya + sesuai brief; wajah hanya formalitas
- Alternatif: simpan thumbnail (ditolak: langgar brief)

### D5: Push via Edge Function + Trigger — 2026-10-31
- Rationale: decoupled, retry mudah, service_role aman
- Alternatif: polling (ditolak: boros baterai, >1 dtk)

## Risk Assessment

| Technology | Risk | Likelihood | Impact | Mitigasi |
|---|---|---|---|---|
| expo-location | Fake GPS lolos | Medium | High | Cek mock flag + validasi server + flag audit |
| expo-camera low-end | OOM / lambat >3 dtk | Medium | Medium | Resolusi rendah, lepas memori segera, tanpa upload |
| Supabase Realtime | Delay >1 dtk saat sinyal jelek | Medium | Medium | Payload minimal, indikator offline, retry |
| EAS free-tier | Kuota build habis | Low | Medium | Build internal + OTA, jadwalkan build |
| RLS misconfig | Data bocor antar-role | Low | High | Matriks RLS per-tabel + uji per-role sebelum rilis |
| Storage | Lampiran >2 MB / MIME jahat | Low | Medium | Validasi client+policy+function, bucket private |

## Verification Checklist
- [x] Setiap PRD requirement terpetakan ke pilihan teknologi
- [x] Setiap pilihan ada rationale + alternatif
- [x] Trade-off jujur
- [x] Diagram mencakup semua komponen + koneksi
- [x] Decision log untuk reproduksibilitas

Next: `/entity-modeler` — skema detail + RLS + migrasi dari PRD §4 + stack ini.
