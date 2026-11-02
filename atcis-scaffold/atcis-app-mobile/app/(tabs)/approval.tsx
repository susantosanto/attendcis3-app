import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { theme } from '../_layout';
import { supabase } from '../../lib/supabase';
import { Btn, Card, Pill, ScreenHeader, SectionTitle } from '../../components/ui';
import { TabFade } from '../../components/TabFade';

interface Item { id: string; user_id: string; jenis: string; tgl_mulai: string; tgl_selesai: string; keterangan: string; status: string; nama?: string }

export default function ApprovalScreen() {
  const [items, setItems] = useState<Item[]>([]);
  const [reason, setReason] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: me } = await supabase.from('profiles').select('role').eq('id', user.id).single();
        setIsAdmin(me?.role === 'operator' || me?.role === 'kepsek');
      }
      const { data } = await supabase.from('leave_requests')
        .select('id, user_id, jenis, tgl_mulai, tgl_selesai, keterangan, status')
        .eq('status', 'pending').order('created_at').limit(50);
      if (data) {
        const ids = [...new Set(data.map((d) => d.user_id))];
        const { data: profs } = await supabase.from('profiles').select('id, nama').in('id', ids);
        const map = new Map((profs ?? []).map((p) => [p.id, p.nama]));
        setItems(data.map((d) => ({ ...d, nama: map.get(d.user_id) ?? d.user_id })));
      }
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { load().catch(() => {}); }, [load]);

  async function decide(id: string, status: 'approved' | 'rejected') {
    setMsg(null);
    if (status === 'rejected' && !reason.trim()) { setMsg('Alasan penolakan wajib diisi'); return; }
    const { error } = await supabase.from('leave_requests').update({
      status, reject_reason: status === 'rejected' ? reason.trim() : null,
    }).eq('id', id);
    if (error) setMsg(`Gagal: ${error.message}`);
    else { setReason(''); load().catch(() => {}); }
  }

  return (
    <TabFade>
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }} contentContainerStyle={{ paddingBottom: 120 }}>
      <ScreenHeader
        title="Approval"
        subtitle="Persetujuan berjenjang"
        onBack={() => router.back()}
        right={<Pill text={`${items.length} pending`} tone={items.length ? 'warn' : 'ok'} />}
      />
      <Card overlap>
        {isAdmin ? (
          <TextInput placeholder="Alasan penolakan (wajib jika menolak)" value={reason} onChangeText={setReason}
            style={{ backgroundColor: theme.colors.background, padding: 12, borderRadius: 10 }} />
        ) : (
          <Text style={{ color: theme.colors.muted }}>Hanya Operator/Kepala Sekolah yang dapat menyetujui. Di bawah ini pengajuan pending milik Anda.</Text>
        )}
        {msg ? <Text style={{ color: theme.colors.danger, marginTop: 8 }}>{msg}</Text> : null}
      </Card>
      <View style={{ margin: theme.spacing.md }}>
        <SectionTitle>Antrean</SectionTitle>
        {loading ? <ActivityIndicator /> : null}
        {items.map((it) => (
          <View key={it.id} style={{ backgroundColor: theme.colors.card, borderRadius: 12, padding: 12, marginBottom: 8 }}>
            <Text style={{ fontWeight: '800', fontSize: 15 }}>{it.nama} • {it.jenis.toUpperCase()}</Text>
            <Text style={{ color: theme.colors.muted }}>{it.tgl_mulai} → {it.tgl_selesai}</Text>
            <Text style={{ marginVertical: 4 }}>{it.keterangan}</Text>
            {isAdmin ? (
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 6 }}>
                <Btn title="Setujui" onPress={() => decide(it.id, 'approved')} tone="success" flex />
                <Btn title="Tolak" onPress={() => decide(it.id, 'rejected')} tone="danger" flex />
              </View>
            ) : null}
          </View>
        ))}
        {items.length === 0 && !loading ? <Text style={{ color: theme.colors.muted }}>Tidak ada pengajuan pending.</Text> : null}
      </View>
    </ScrollView>
    </TabFade>
  );
}
