# REQUIREMENTS — Sprint 001: Auth Vertical Slice

Sumber: PRD US-01/US-02, DATA-MODEL (profiles), MODULE-PLAN Fase A–C (T1.1–T2.2, T6.1–T6.3 parsial profiles). Bab 8.4: what & why only, no how.

## Goal (satu)
Guru bisa login NIP/email dan akun terkunci ke 1 perangkat, end-to-end client + Supabase.

## Users
- Guru (login, device bind)
- Operator (reset — hanya API/RLS siap, UI di Sprint 003)

## Cakupan
- Boot Expo Router + tema mockup (layar login saja)
- Login NIP/email via Supabase Auth, session persist, error generik
- Binding device_id saat login pertama; tolak perangkat kedua + pesan hubungi operator
- Migrasi profiles + school_config seed, RLS profiles, policy reset operator/kepsek

## Non-goal (Sprint lain)
- Presensi/geofence/selfie (Sprint 002), izin/push (Sprint 003), dashboard/kalender (Sprint 004)

## Constraints
- Zero-storage tidak relevan di sprint ini (tanpa kamera)
- RLS wajib sebelum uji tolak-perangkat
- Pin versi di BLUEPRINT; DoD = lint+typecheck+test hijau
