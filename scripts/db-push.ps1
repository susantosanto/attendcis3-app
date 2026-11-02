# Helper push migrasi ke Supabase (token TIDAK disimpan, hanya di memori sesi ini)
if (-not $env:SUPABASE_ACCESS_TOKEN) {
  $env:SUPABASE_ACCESS_TOKEN = Read-Host 'Tempel Personal Access Token (sbp_...) sekali pakai'
}
npx supabase db push --linked
