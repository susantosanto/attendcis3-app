import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TextInput, View } from 'react-native';
import { theme } from '../_layout';
import { supabase } from '../../lib/supabase';
import { useLeaveNotifications } from '../../lib/push';
import { Btn, Card, Pill, Row, ScreenHeader, SectionTitle, Segmented } from '../../components/ui';

const JENIS = ['izin', 'sakit', 'dinas'] as const;

export default function IzinScreen() {
  const [userId, setUserId] = useState<string | null>(null);
  const [jenis, setJenis] = useState<(typeof JENIS)[number]>('izin');
  const [mulai, setMulai] = useState('');
  const [selesai, setSelesai] = useState('');
  const [ket, setKet] = useState('');
  const [riwayat, setRiwayat] = useState<{ id: string; jenis: string; status: string; tgl_mulai: string; tgl_selesai: string }[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setUserId(user.id);
    const { data } = await supabase.from('leave_requests')
      .select('id, jenis, status, tgl_mulai, tgl_selesai')
      .eq('user_id', user.id).order('created_at', { ascending: false }).limit(20);
    if (data) setRiwayat(data);
  }, []);
  useEffect(() => { load().catch(() => {}); }, [load]);
  useLeaveNotifications(userId, load);

  async function submit() {
    setMsg(null);
    if (!mulai || !selesai || !ket.trim()) { setMsg('Tanggal mulai, selesai, dan keterangan wajib diisi'); return; }
    if (selesai < mulai) { setMsg('Tanggal selesai tidak boleh sebelum mulai'); return; }
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setMsg('Masuk dulu untuk mengajukan'); return; }
      const { error } = await supabase.from('leave_requests').insert({
        user_id: user.id, jenis, tgl_mulai: mulai, tgl_selesai: selesai, keterangan: ket.trim(),
      });
      if (error) throw error;
      setMsg('Pengajuan terkirim (pending). Izin reguler ditutup pukul 09:00; Dinas bebas waktu.');
      setKet(''); setMulai(''); setSelesai('');
      load().catch(() => {});
    } catch (e) {
      const m = e instanceof Error ? e.message : 'Gagal mengirim';
      setMsg(m.includes('IZIN_CLOSED') ? 'Batas pengajuan hari ini sudah lewat (09:00). Khusus Dinas tetap bisa.' : m);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScreenHeader title="Leave" subtitle="Izin • Sakit • Dinas" />
      <Card overlap>
        <SectionTitle>Pengajuan Baru</SectionTitle>
        <Segmented value={jenis} onChange={setJenis}
          options={JENIS.map((j) => ({ key: j, label: j.toUpperCase() }))} />
        <View style={{ height: 10 }} />
        <TextInput placeholder="Tgl mulai (YYYY-MM-DD)" value={mulai} onChangeText={setMulai}
          style={{ backgroundColor: theme.colors.background, padding: 12, borderRadius: 10, marginBottom: 8 }} />
        <TextInput placeholder="Tgl selesai (YYYY-MM-DD)" value={selesai} onChangeText={setSelesai}
          style={{ backgroundColor: theme.colors.background, padding: 12, borderRadius: 10, marginBottom: 8 }} />
        <TextInput placeholder="Keterangan" value={ket} onChangeText={setKet} multiline
          style={{ backgroundColor: theme.colors.background, padding: 12, borderRadius: 10, marginBottom: 8, minHeight: 70 }} />
        {msg ? <Text style={{ marginBottom: 8 }}>{msg}</Text> : null}
        {loading ? <ActivityIndicator /> : <Btn title="Kirim Pengajuan" onPress={submit} />}
      </Card>
      <View style={{ margin: theme.spacing.md }}>
        <SectionTitle>Riwayat ({riwayat.length})</SectionTitle>
        <View style={{ backgroundColor: theme.colors.card, borderRadius: 18, paddingHorizontal: 16, borderWidth: 1, borderColor: '#ECEFF3' }}>
          {riwayat.length === 0 ? <Text style={{ color: theme.colors.muted, paddingVertical: 14 }}>Belum ada pengajuan.</Text> : riwayat.map((r, i) => (
            <Row key={r.id} last={i === riwayat.length - 1}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View>
                  <Text style={{ fontWeight: '700', fontSize: 15 }}>{r.jenis.toUpperCase()}</Text>
                  <Text style={{ color: theme.colors.muted, fontSize: 12 }}>{r.tgl_mulai} → {r.tgl_selesai}</Text>
                </View>
                <Pill text={r.status} tone={r.status === 'approved' ? 'ok' : r.status === 'rejected' ? 'bad' : 'warn'} />
              </View>
            </Row>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
