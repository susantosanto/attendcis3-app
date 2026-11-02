# BUILD-REPORT — Sprint 001: Auth Vertical Slice (MODE BUILD, 2026-10-31)

## Status task
- ✅ B1 Boot layout+tema — COMPLETE (`app/_layout.tsx`, token dari mockup)
- ✅ B2 Supabase client + NetworkBadge — COMPLETE (`lib/supabase.ts`, `components/NetworkBadge.tsx`)
- ✅ B3 Migrasi 001–003 — COMPLETE (enums, profiles+indeks, school_config+seed)
- ✅ B4 RLS profiles — COMPLETE (4 policy + komentar uji per-role)
- ✅ B5 Login NIP/email — COMPLETE (`app/login.tsx`, error generik, session persist via Supabase)
- ✅ B6 Device bind+tolak — COMPLETE (`lib/device.ts` + logic bind/tolak di login)

## Bukti DoD (ditempel, bukan klaim)
- `npx tsc --noEmit` → exit 0, tanpa output (setelah: hapus stale `src/app/_layout.tsx` ber-import `expo-status-client` yang tak ada; install `@types/react@18.2.6 --legacy-peer-deps`).
- `npx expo lint` → "ESlint has been configured 🎉" + `npx eslint .` tanpa error (install `eslint-config-expo@7.1.2` via npm langsung karena `expo install` diblokir policy EALLOWSCRIPTS).
- Perbaikan samping: `expo-status-client@~1.6.0` (tidak ada di registry) → `expo-status-bar@~1.12.1`; deps baru: `expo-device@6.0.2`, `expo-application@5.9.1`, `@supabase/supabase-js@2.44.4`.

## Belum hijau (butuh user)
- `supabase db reset` — BELUM dijalankan (project belum di-link; butuh URL + keys + project ref). Migrasi B3/B4 tertulis dan siap apply.
- Uji manual 6 kriteria ACCEPTANCE — menunggu kredensial Supabase + koordinat gerbang asli (saat ini seed dummy -6.9, 107.6, ganti sebelum uji lapangan).

## Self-review B5/B6
- Tanpa `any`; fungsi <30 baris; error generik (tidak bocorkan akun); signOut tiap jalur gagal; input NIP/email divalidasi; tanpa secret di kode (env).
