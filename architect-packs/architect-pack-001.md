# Architect Pack 001 — Auth Vertical Slice (copy audit Bab 8.5, 2026-10-31)

Sprint: satu goal — login NIP/email + One Device One Account end-to-end (M1+M2+M6 parsial).
Rencana sprint berikutnya: 002 Presensi geofence+selfie (M3), 003 Izin/approval/push (M4), 004 Dashboard/kalender (M5) + hardening RLS penuh.

## Cross-artifact check (Bab 8.4/10)
- [x] Setiap REQUIREMENTS item ada di BLUEPRINT (B1–B6)
- [x] Setiap BLUEPRINT task ada kriteria ACCEPTANCE (#1–#6 + edge)
- [x] Setiap task punya DoD machine-checked (tsc + eslint + db reset)
- [x] Hot-path: none — DSA exempt
- [x] ACCEPTANCE tidak butuh fitur luar BLUEPRINT
- [x] HANDOFF punya bootstrap block
- [x] Dependensi == advisor (Expo+Supabase, pinned)
- [x] Satu sprint satu goal

Sumber: planning/sprints/sprint-001/{REQUIREMENTS,BLUEPRINT,ACCEPTANCE,HANDOFF-PROMPT}.MD
