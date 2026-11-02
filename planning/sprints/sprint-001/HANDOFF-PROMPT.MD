# HANDOFF-PROMPT — Sprint 001: Auth Vertical Slice (builder: /ai-coding-coach MODE DRY RUN)

1. Baca dulu: `planning/sprints/sprint-001/REQUIREMENTS.MD`, `BLUEPRINT.MD`, `ACCEPTANCE.MD`, `AGENTS.MD`, `atcis-scaffold/atcis-app-mobile/PRD.md`, `DATA-MODEL.md` (tabel profiles), `MODULE-PLAN.md` (T1–T2).
2. Bootstrap (jangan dikarang):
   - `cd atcis-scaffold/atcis-app-mobile && npm install && npx expo start`
   - Sanity: `npx tsc --noEmit && npx eslint app/ lib/ components/`
   - Supabase: `supabase db reset` (butuh linked project)
3. DRY RUN dulu: laporkan rencana file, dependensi pinned, risiko — TUNGGU approval sebelum coding.
4. JANGAN: ubah requirements; tambah lib di luar BLUEPRINT; kerjakan presensi/izin/dashboard; simpan foto apa pun; longgarkan RLS.
5. Bukti DoD: tempel output tsc/eslint/db reset + hasil uji manual 6 kriteria ACCEPTANCE.
