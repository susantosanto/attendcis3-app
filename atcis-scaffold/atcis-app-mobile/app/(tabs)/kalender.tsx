import { useCallback, useEffect, useState } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';
import { theme } from '../_layout';
import { supabase } from '../../lib/supabase';
import { Btn, Card, ScreenHeader, SectionTitle } from '../../components/ui';
import { formatIndoDate, todayJakarta } from '../../lib/haversine';

/** Manajemen kalender & jadwal kerja (SIKADIR §10): daftar libur + tambah/hapus (admin), jam kerja per hari. */
export default function KalenderScreen() {
  const [libs, setLibs] = useState<{ id: string; tanggal: string; keterangan: string }[]>([]);
  const [scheds, setScheds] = useState<{ hari: number; jam_masuk: string; jam_pulang: string; aktif: boolean }[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [tgl, setTgl] = useState('');
  const [ket, setKet] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const tglNow = todayJakarta();
  const HARI = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: me } = await supabase.from('profiles').select('role').eq('id', user.id).single();
      setIsAdmin(me?.role === 'operator' || me?.role === 'kepsek');
    }
    const { data: h } = await supabase.from('holidays').select('id, tanggal, keterangan').gte('tanggal', tglNow).order('tanggal').limit(60);
    if (h) setLibs(h);
    const { data: s } = await supabase.from('schedules').select('hari, jam_masuk, jam_pulang, aktif').order('hari');
    if (s) setScheds(s);
  }, [tglNow]);
  useEffect(() => { load().catch(() => {}); }, [load]);

  async function tambah() {
    setMsg(null);
    if (!tgl || !ket.trim()) { setMsg('Tanggal dan keterangan wajib diisi'); return; }
    const { error } = await supabase.from('holidays').insert({ tanggal: tgl, keterangan: ket.trim() });
    if (error) setMsg(`Gagal: ${error.message}`);
    else { setTgl(''); setKet(''); load().catch(() => {}); }
  }

  async function hapus(id: string) {
    const { error } = await supabase.from('holidays').delete().eq('id', id);
    if (!error) load().catch(() => {});
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScreenHeader title="Kalender Kerja" subtitle="Hari kerja & hari libur sekolah" />
      <Card overlap>
        <SectionTitle>Jam Kerja per Hari</SectionTitle>
        {scheds.map((s) => (
          <View key={s.hari} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#F1F4F8' }}>
            <Text style={{ fontWeight: '700' }}>{HARI[s.hari]}</Text>
            <Text style={{ color: s.aktif ? theme.colors.text : theme.colors.muted }}>
              {s.aktif ? `${s.jam_masuk.slice(0, 5)} – ${s.jam_pulang.slice(0, 5)}` : 'Nonaktif'}
            </Text>
          </View>
        ))}
      </Card>
      <View style={{ margin: theme.spacing.md }}>
        <SectionTitle>Hari Libur Mendatang</SectionTitle>
        {libs.map((l) => (
          <View key={l.id} style={{ backgroundColor: theme.colors.card, borderRadius: 12, padding: 12, marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <Text style={{ fontWeight: '700' }}>{formatIndoDate(l.tanggal)}</Text>
              <Text style={{ color: theme.colors.muted, fontSize: 12 }}>{l.keterangan}</Text>
            </View>
            {isAdmin ? <Text onPress={() => hapus(l.id)} style={{ color: theme.colors.danger, fontWeight: '700' }}>Hapus</Text> : null}
          </View>
        ))}
        {libs.length === 0 ? <Text style={{ color: theme.colors.muted }}>Belum ada hari libur terjadwal.</Text> : null}
      </View>
      {isAdmin ? (
        <Card>
          <SectionTitle>Tambah Hari Libur</SectionTitle>
          <TextInput placeholder="Tanggal (YYYY-MM-DD)" value={tgl} onChangeText={setTgl}
            style={{ backgroundColor: theme.colors.background, padding: 12, borderRadius: 10, marginBottom: 8 }} />
          <TextInput placeholder="Keterangan (mis. Cuti bersama)" value={ket} onChangeText={setKet}
            style={{ backgroundColor: theme.colors.background, padding: 12, borderRadius: 10, marginBottom: 8 }} />
          {msg ? <Text style={{ marginBottom: 8 }}>{msg}</Text> : null}
          <Btn title="Simpan Libur" onPress={tambah} />
        </Card>
      ) : null}
      <View style={{ height: 24 }} />
    </ScrollView>
  );
}
