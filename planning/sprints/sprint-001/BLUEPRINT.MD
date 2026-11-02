# BLUEPRINT — Sprint 001: Auth Vertical Slice

Stack (dari TECH-STACK, tidak diubah): Expo SDK 51 + Router + TS, Supabase (Auth/Postgres/RLS).

## Files (exact)
- `atcis-scaffold/atcis-app-mobile/app/_layout.tsx` — provider + tema
- `atcis-scaffold/atcis-app-mobile/app/login.tsx` — layar login NIP/email
- `atcis-scaffold/atcis-app-mobile/lib/supabase.ts` — client
- `atcis-scaffold/atcis-app-mobile/lib/device.ts` — device_id (expo-device/application)
- `atcis-scaffold/atcis-app-mobile/components/NetworkBadge.tsx` — indikator online
- `atcis-scaffold/atcis-app-mobile/supabase/migrations/001_enums.sql`
- `atcis-scaffold/atcis-app-mobile/supabase/migrations/002_profiles.sql`
- `atcis-scaffold/atcis-app-mobile/supabase/migrations/003_school_config.sql`
- `atcis-scaffold/atcis-app-mobile/supabase/migrations/010_rls_profiles.sql` (parsial: profiles saja)

## Dependencies (pinned — sinkron dengan package.json, tanpa ^)
- expo 51.0.38, expo-router 3.5.23, react 18.2.0, react-native 0.74.5
- @supabase/supabase-js 2.44.4, expo-device 6.0.2, expo-application 5.9.1
- dev: typescript 5.3.3, eslint 8.57.0
- Baru: `npx expo install expo-device expo-application @supabase/supabase-js`

## Tasks (2–5 menit tiap sublangkah dirangkum; DoD per task = perintah hijau)
1. **B1** Boot layout+tema (T1.1+T1.3 parsial login): buat _layout, token dari mockup. DoD: `npx expo start --no-dev --minify` boot tanpa error; `npx tsc --noEmit` hijau; `npx eslint app/_layout.tsx` hijau.
2. **B2** Supabase client + NetworkBadge (T1.2): `lib/supabase.ts` baca EXPO_PUBLIC_*, badge online. DoD: tsc+eslint hijau; select school_config di dev tampil.
3. **B3** Migrasi 001–003 (T6.1 parsial): enums, profiles, school_config+seed. DoD: `supabase db reset` hijau.
4. **B4** RLS profiles (T6.3 parsial): owner-read/update token sendiri; reset device_id hanya operator/kepsek; authenticated insert profil sendiri. DoD: uji per-role via SQL (guru tidak bisa update milik orang; operator bisa reset) — simpan output.
5. **B5** Login NIP/email (T2.1): mapping NIP→`nip@attendcis.local`, persist session, error generik. DoD: tsc+eslint hijau; login manual 2 jalur sukses.
6. **B6** Device bind+tolak (T2.2): bind pertama, tolak kedua + pesan operator. DoD: login HP-B ditolak; setelah reset via SQL bisa login; output ditempel.

DSA: tidak ada hot-path di sprint ini (tanpa loop koleksi/endpoint per-request) — exempt.
