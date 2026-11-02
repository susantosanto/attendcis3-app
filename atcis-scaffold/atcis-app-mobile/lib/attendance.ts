import { supabase } from './supabase';
import { haversineM, todayJakarta } from './haversine';

export type TipeAbsen = 'in' | 'out';

export interface SubmitParams {
  userId: string;
  tipe: TipeAbsen;
  latitude: number;
  longitude: number;
  mock: boolean;
  mood?: string;
  alasanTerlambat?: string;
  bypass?: boolean;
  bypassReason?: string;
}

export async function submitAttendance(p: SubmitParams) {
  const tanggal = todayJakarta();
  const { data: cfg } = await supabase
    .from('school_config')
    .select('latitude, longitude, radius_meter')
    .eq('id', 1)
    .single();
  if (!cfg) throw new Error('Konfigurasi sekolah belum tersedia');
  const jarak = Math.round(haversineM(p.latitude, p.longitude, cfg.latitude, cfg.longitude));
  if (p.mock) throw new Error('Lokasi tiruan terdeteksi (mock location)');
  if (!p.bypass && jarak > cfg.radius_meter) {
    throw new Error(`Di luar radius sekolah (${jarak} m > ${cfg.radius_meter} m)`);
  }
  const { data, error } = await supabase.from('attendance').insert({
    user_id: p.userId,
    tanggal,
    tipe: p.tipe,
    latitude: p.latitude,
    longitude: p.longitude,
    jarak_meter: jarak,
    status: p.bypass ? 'bypass' : 'tepat_waktu',
    mood: p.mood ?? null,
    alasan_terlambat: p.alasanTerlambat ?? null,
    is_bypass: p.bypass ?? false,
    is_mock: p.mock,
  }).select('id, status').single();
  if (error) throw new Error(mapDbError(error.message));
  return { ...data, jarak };
}

function mapDbError(msg: string): string {
  if (msg.includes('OUT_OF_RADIUS')) return 'Di luar radius sekolah';
  if (msg.includes('MOCK_LOCATION')) return 'Lokasi tiruan terdeteksi';
  if (msg.includes('LATE_REASON_REQUIRED')) return 'Alasan keterlambatan wajib diisi';
  if (msg.includes('EARLY_CHECKOUT')) return 'Belum jam pulang';
  if (msg.includes('HOLIDAY')) return 'Hari libur — presensi nonaktif';
  if (msg.includes('OFFDAY')) return 'Bukan hari kerja';
  if (msg.includes('BYPASS_DENIED')) return 'Bypass hanya untuk kepsek/operator';
  if (msg.includes('NO_CHECKIN')) return 'Check-in dulu sebelum check-out';
  if (msg.includes('LATE_CHECKOUT')) return 'Melewati batas maksimal jam pulang';
  if (msg.includes('IZIN_CLOSED')) return 'Batas pengajuan hari ini sudah lewat (kecuali Dinas)';
  if (msg.includes('duplicate') || msg.includes('uq_attendance')) return 'Sudah presensi untuk tipe ini hari ini';
  return msg;
}
