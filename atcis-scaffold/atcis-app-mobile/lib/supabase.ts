import { createClient } from '@supabase/supabase-js';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

// Jangan throw saat import (static rendering web mengevaluasi modul ini
// sebelum env tersedia). Pakai placeholder agar prerender lolos; request
// tanpa env valid akan gagal dengan pesan jelas saat dipakai.
if (!url || !anonKey) {
  console.warn('Supabase env belum diisi: EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY');
}

export const supabase = createClient(
  url || 'https://placeholder.supabase.co',
  anonKey || 'placeholder-anon-key'
);

export function isSupabaseConfigured(): boolean {
  return Boolean(url && anonKey);
}
