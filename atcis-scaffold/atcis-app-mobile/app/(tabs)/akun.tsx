import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TextInput, View } from 'react-native';
import { theme } from '../_layout';
import { supabase } from '../../lib/supabase';
import { Btn, Card, ScreenHeader } from '../../components/ui';

/** GAP-03: Pengaturan akun — ganti password mandiri (verifikasi via login ulang tidak perlu; session aktif = pemilik). */
export default function AkunScreen() {
  const [nama, setNama] = useState('-');
  const [nip, setNip] = useState('-');
  const [role, setRole] = useState('-');
  const [pw1, setPw1] = useState('');
  const [pw2, setPw2] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from('profiles').select('nama, nip, role').eq('id', user.id).single();
      if (data) { setNama(data.nama); setNip(data.nip); setRole(data.role); }
    })().catch(() => {});
  }, []);

  async function ganti() {
    setMsg(null);
    if (pw1.length < 6) { setMsg('Password minimal 6 karakter'); return; }
    if (pw1 !== pw2) { setMsg('Konfirmasi tidak sama'); return; }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: pw1 });
      if (error) throw error;
      setMsg('Password berhasil diganti ✅');
      setPw1(''); setPw2('');
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Gagal mengganti password');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScreenHeader title="Akun Saya" subtitle="Profil & pengaturan" />
      <Card overlap>
        <Text style={{ fontSize: 17, fontWeight: '800' }}>{nama}</Text>
        <Text style={{ color: theme.colors.muted }}>NIP {nip} • {role === 'kepsek' ? 'Kepala Sekolah' : role === 'operator' ? 'Operator' : 'Guru'}</Text>
      </Card>
      <Card>
        <Text style={{ fontWeight: '800', marginBottom: 8 }}>Ganti Password</Text>
        <TextInput placeholder="Password baru (min 6)" secureTextEntry value={pw1} onChangeText={setPw1}
          style={{ backgroundColor: theme.colors.background, padding: 12, borderRadius: 10, marginBottom: 8 }} />
        <TextInput placeholder="Ulangi password baru" secureTextEntry value={pw2} onChangeText={setPw2}
          style={{ backgroundColor: theme.colors.background, padding: 12, borderRadius: 10, marginBottom: 8 }} />
        {msg ? <Text style={{ marginBottom: 8 }}>{msg}</Text> : null}
        {loading ? <ActivityIndicator /> : <Btn title="Simpan Password" onPress={ganti} />}
        <View style={{ marginTop: 12 }}>
          <Btn title="Keluar" onPress={async () => { await supabase.auth.signOut(); }} tone="danger" />
        </View>
      </Card>
    </ScrollView>
  );
}
