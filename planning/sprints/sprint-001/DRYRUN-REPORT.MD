# DRYRUN-REPORT — Sprint 001: Auth Vertical Slice (MODE DRY RUN, 2026-10-31)

Skill: /ai-coding-coach MODE DRY RUN. Tanpa tulis kode di mode ini.

## Bootstrap (hasil)
- Pack dibaca: REQUIREMENTS + BLUEPRINT + ACCEPTANCE + HANDOFF-PROMPT + PRD + DATA-MODEL (profiles) + MODULE-PLAN (T1–T2). ✅
- `npx tsc --noEmit` GAGAL: typescript belum terinstal (node_modules kosong; npx malah pasang paket `tsc` yang salah). Artinya bootstrap `npm install` BELUM jalan — wajib sebelum BUILD.
- `supabase db reset` belum dijalankan (butuh linked project + CLI). Risiko dicatat di bawah.
- Struktur eksisting: `atcis-app-mobile/` berisi app.json, eas.json, package.json, tsconfig.json, src/, TANPA folder `app/`, `lib/`, `components/`, `supabase/` (belum dibuat — sesuai rencana B1–B4 akan membuatnya).

## Rencana task (urut, sesuai BLUEPRINT B1–B6)
1. B1: `app/_layout.tsx` (provider+tema login) — butuh `npm install` + `npx expo install expo-router`.
2. B2: `lib/supabase.ts` + `components/NetworkBadge.tsx` — butuh EXPO_PUBLIC_SUPABASE_URL/ANON_KEY dari user.
3. B3: `supabase/migrations/001–003` (enums, profiles, school_config+seed).
4. B4: `supabase/migrations/010_rls_profiles.sql` + uji per-role (output SQL ditempel).
5. B5: `app/login.tsx` login NIP/email + persist + error generik.
6. B6: `lib/device.ts` bind device_id + tolak HP kedua + pesan operator.

## File create/modify
- Create: app/_layout.tsx, app/login.tsx, lib/supabase.ts, lib/device.ts, components/NetworkBadge.tsx, supabase/migrations/001_enums.sql, 002_profiles.sql, 003_school_config.sql, 010_rls_profiles.sql.
- Modify: package.json (tambah expo-device, expo-application, @supabase/supabase-js — pinned, tanpa ^).

## Dependensi (tambah, pinned)
- @supabase/supabase-js 2.44.4, expo-device 6.0.2, expo-application 5.9.1 (via `npx expo install` agar cocok SDK 51).

## Risiko
- R1: `npm install` + Expo SDK 51 di Windows bisa lama/gagal — mitigasi: jalankan foreground, tempel output.
- R2: Supabase CLI belum link — butuh URL+keys + project ref dari user; tanpa ini B3/B4 tidak bisa hijau.
- R3: NIP→email mapping butuh konvensi (`nip@attendcis.local`) — konfirmasi user jika sudah ada akun Auth.

## DoD per task (akan dijalankan saat BUILD)
- B1/B2/B5/B6: `npx tsc --noEmit` + `npx eslint <file>` hijau, output ditempel.
- B3: `supabase db reset` hijau. B4: output uji RLS per-role ditempel. B5/B6: uji manual 6 kriteria ACCEPTANCE.

## STOP — TUNGGU APPROVAL
Butuh dari user sebelum BUILD: (1) setuju rencana + pinned deps di atas; (2) EXPO_PUBLIC_SUPABASE_URL + ANON_KEY (+ project ref untuk CLI); (3) perintah `npm install` boleh dijalankan sekarang?
