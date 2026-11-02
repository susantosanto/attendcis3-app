# Perbandingan Fitur: SIKADIR v2.1.0 vs AttendCis 3 (status: audit 1 Nov 2026)

Sumber: `SIKADIR/main-fitur.md` vs kode `atcis-scaffold/atcis-app-mobile` + `PRD.md`.
Legenda: ✅ ada • ❌ hilang (wajib tambah) • ➖ sengaja out-of-scope (sesuai IDEA-BRIEF/PRD) • 🔜 fase 2.

## Otentikasi & Perangkat (§2)
| Fitur SIKADIR | AttendCis 3 | Status |
|---|---|---|
| Dual login NIP/Email (case-insensitive, trimmed) | `login.tsx` (trim+lowercase email; NIP regex) | ✅ |
| Brute-force lockout 3x/5 mnt | tidak ada | ❌ GAP-01 → tambah (fungsi RPC hitung + blokir) |
| Device lock 2 arah + auto-pairing | bind device_id + tolak HP kedua | ✅ |
| Smart Device Update (ganti HP selama ID baru belum dipakai orang) | hanya reset manual operator | ❌ GAP-02 → tambah (izinkan update jika device_id baru unik) |
| Reset kunci perangkat | tombol admin + audit | ✅ |
| Ganti password mandiri | tidak ada | ❌ GAP-03 → tambah (layar Akun, `auth.updateUser`) |
| Foto profil kustom | tidak ada | 🔜 (butuh bucket avatar; bukan inti presensi) |

## Geolocation (§3)
| Fitur | Status |
|---|---|
| Haversine + radius sekolah | ✅ (`haversine_m` + client mirror) |
| VIP bypass kepsek/operator | ✅ |
| Tolak mock location | ✅ |
| Dual-step GPS (cepat + presisi) | ✅ parsial (3-sampel rata-rata; tanpa watchPosition live) |
| Tombol Refresh GPS | ❌ GAP-04 → tambah |
| Peta Leaflet + pin + lingkaran radius + pill status | ➖ out-of-scope mobile MVP (pill status ✅ ditambah via GAP-05) |
| Silent free-zone checkout allowlist | ➖ diganti VIP bypass (tercatat audit) |

## Check In (§4)
| Fitur | Status |
|---|---|
| Validasi jam + status terlambat + alasan wajib | ✅ |
| Selfie live-only + kompresi + zero-storage | ✅ |
| Anti-duplikasi 1x/hari | ✅ (unique constraint) |
| Sertifikat disiplin + share WhatsApp + confetti + quotes | ❌ GAP-06 → tambah (sertifikat + quotes; share WA 🔜) |

## Check Out (§5)
| Fitur | Status |
|---|---|
| Tolak checkout sebelum check-in | ❌ GAP-07 → tambah di trigger |
| Jam pulang min + khusus Jumat | ✅ |
| Batas maksimal pulang 16:30 | ❌ GAP-08 → tambah di trigger |
| Holiday alert esok hari (kartu ucapan) | ❌ GAP-09 → tambah (info H-1 libur di Home) |

## Izin & Sakit (§6)
| Fitur | Status |
|---|---|
| Kategori Sakit/Keluarga/Dinas/Lainnya | ⚠️ parsial (izin/sakit/dinas; Keluarga+Lainnya → "izin") |
| Batas jam pengajuan 09:00 (Dinas bebas) | ❌ GAP-10 → tambah di trigger |
| Lampiran surat | ✅ parsial (policy siap; picker UI 🔜) |
| Status pending | ✅ |

## Approval (§7)
| Fitur | Status |
|---|---|
| Role-based (guru→operator/kepsek; operator→kepsek) | ✅ |
| Approve/Reject + reject wajib alasan | ✅ |
| Audit decided_by/decided_at | ✅ |
| Notifikasi instan (ganti polling 30 dtk → Realtime+Push) | ✅ (lebih baik dari SIKADIR) |

## Dashboard (§8)
| Fitur | Status |
|---|---|
| Metrik Hadir/Sakit/Izin/Alpha | ✅ |
| Smart sorting Alpha>Sakit>Izin>Hadir | ❌ GAP-11 → perbaiki (sekarang hanya Alpha di atas) |
| Smart Matching V3 (bersihkan gelar S.Pd/M.Pd/dll) | ❌ GAP-12 → tambah normalisasi nama |
| Card detail per guru (jam, alasan, status) | ❌ GAP-13 → tambah modal detail |
| Widget statistik pribadi bulan berjalan | ❌ GAP-14 → tambah di Home (hitung bulan ini) |

## Pelaporan/Drive/Admin Sheet (§9, §11, §13)
➖ Semua sengaja out-of-scope (PRD §7): tanpa ekspor Excel/PDF, tanpa simpan foto, tanpa web admin — diganti Supabase.

## Kalender (§10)
| Fitur | Status |
|---|---|
| Cek libur sebelum presensi | ✅ (trigger HOLIDAY/OFFDAY) |
| Generate bulanan + libur nasional otomatis + cuti lokal | �elia (CRUD manual via SQL; generator 🔜) |

## UI/UX (§12)
| Fitur | Status |
|---|---|
| Mobile-first + kartu + header biru mockup | ⚠️ diperbaiki di sprint polish ini |
| Jam digital realtime + status pill kontekstual | ❌ GAP-05 → tambah |
| FAB hub / badge approval / pengaturan / Q&A / info tim | 🔜 (badge approval GAP-15; Q&A/info 🔜) |
| Banner pengumuman dinamis | 🔜 (butuh tabel announcements) |
| Skeleton + quotes motivasi | ⚠️ quotes ikut GAP-06; skeleton 🔜 |
| Ripple/haptic | ➖ bawaan RN (Pressable) cukup |

## Rencana dieksekusi SEKARANG (sprint polish ini)
GAP-03 (ganti password), GAP-04 (refresh GPS), GAP-05 (jam+status pill), GAP-07, GAP-08, GAP-09 (H-1 libur), GAP-10 (batas jam izin), GAP-11 (sorting penuh), GAP-12 (normalisasi nama), GAP-13 (modal detail guru), GAP-14 (statistik bulanan di Home), GAP-15 (badge pending di tab Approval), GAP-06 parsial (sertifikat + quotes), GAP-01 (lockout sederhana), GAP-02 (smart device update).
