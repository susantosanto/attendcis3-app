export const QUOTES = [
  'Disiplin hari ini, berkah esok hari. 💪',
  'Tepat waktu adalah bentuk hormat pada amanah. ⏰',
  'Satu check-in tepat waktu, satu langkah kebaikan. 🌱',
  'Guru hebat datang lebih awal. 🌟',
  'Konsistensi kecil mengalahkan semangat sesaat. 🔥',
];

export function dailyQuote(seed = new Date().toISOString().slice(0, 10)): string {
  let h = 0;
  for (const c of seed) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return QUOTES[h % QUOTES.length];
}
