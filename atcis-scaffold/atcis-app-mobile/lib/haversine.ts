/** Haversine mirror dari DB `haversine_m()` — satu rumus, O(1), tanpa alokasi loop. */
export function haversineM(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

export function todayJakarta(): string {
  const now = new Date(Date.now() + 7 * 3600 * 1000);
  return now.toISOString().slice(0, 10);
}

const BULAN = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
const BULAN_PENDEK = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
const HARI = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];

export function formatIndoDate(yyyyMMDD: string): string {
  const p = indoParts(yyyyMMDD);
  return p ? `${p.dowName}, ${p.dayNum} ${p.monFull} ${p.year}` : yyyyMMDD;
}

export function indoParts(yyyyMMDD: string): {
  dowName: string; dayNum: string; dayPadded: string;
  monShort: string; monFull: string; year: string;
} | null {
  const [y, m, d] = yyyyMMDD.split('-').map(Number);
  if (!y || !m || !d) return null;
  return {
    dowName: HARI[new Date(y, m - 1, d).getDay()],
    dayNum: String(d),
    dayPadded: String(d).padStart(2, '0'),
    monShort: BULAN_PENDEK[m - 1],
    monFull: BULAN[m - 1],
    year: String(y),
  };
}
