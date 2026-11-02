import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Modal, ScrollView, Text, View } from 'react-native';
import { theme } from '../_layout';
import { supabase } from '../../lib/supabase';
import { Btn, Card, Pill, Row, ScreenHeader, SectionTitle, normalNama } from '../../components/ui';
import { IconChip } from '../../components/icons';
import { todayJakarta, formatIndoDate } from '../../lib/haversine';

interface RowData {
  id: string; nama: string; status: 'Alpha' | 'Sakit' | 'Izin' | 'Hadir' | 'Terlambat';
  waktu: string | null; alasan: string | null;
}

/** GAP-11: Alpha > Sakit > Izin > Hadir/Terlambat; GAP-12: sortir abjad via normalNama. */
const RANK: Record<RowData['status'], number> = { Alpha: 0, Sakit: 1, Izin: 2, Hadir: 3, Terlambat: 3 };

export default function DashboardScreen() {
  const [rows, setRows] = useState<RowData[]>([]);
  const [counts, setCounts] = useState({ hadir: 0, izin: 0, sakit: 0, alpha: 0, total: 0 });
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [detail, setDetail] = useState<RowData | null>(null);
  const tgl = todayJakarta();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: me } = await supabase.from('profiles').select('role').eq('id', user.id).single();
        setIsAdmin(me?.role === 'operator' || me?.role === 'kepsek');
      }
      const { data: profs } = await supabase.from('profiles').select('id, nama').order('nama');
      const { data: att } = await supabase.from('attendance').select('user_id, status, waktu, tipe, alasan_terlambat').eq('tanggal', tgl).eq('tipe', 'in');
      const { data: leave } = await supabase.from('leave_requests').select('user_id, jenis, keterangan')
        .lte('tgl_mulai', tgl).gte('tgl_selesai', tgl).eq('status', 'approved');
      const attMap = new Map((att ?? []).map((a) => [a.user_id, a]));
      const leaveMap = new Map((leave ?? []).map((l) => [l.user_id, l]));
      const list: RowData[] = (profs ?? []).map((p) => {
        const a = attMap.get(p.id);
        const l = leaveMap.get(p.id);
        const status: RowData['status'] = a ? (a.status === 'terlambat' ? 'Terlambat' : 'Hadir')
          : l ? (l.jenis === 'sakit' ? 'Sakit' : 'Izin') : 'Alpha';
        return { id: p.id, nama: p.nama, status, waktu: a?.waktu ?? null, alasan: a?.alasan_terlambat ?? l?.keterangan ?? null };
      });
      list.sort((x, y) => RANK[x.status] - RANK[y.status] || normalNama(x.nama).localeCompare(normalNama(y.nama)));
      setRows(list);
      setCounts({
        hadir: list.filter((r) => r.status === 'Hadir' || r.status === 'Terlambat').length,
        izin: list.filter((r) => r.status === 'Izin').length,
        sakit: list.filter((r) => r.status === 'Sakit').length,
        alpha: list.filter((r) => r.status === 'Alpha').length,
        total: list.length,
      });
    } finally {
      setLoading(false);
    }
  }, [tgl]);
  useEffect(() => { load().catch(() => {}); }, [load]);

  async function resetDevice(targetId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from('profiles').update({ device_id: null }).eq('id', targetId);
    if (!error) await supabase.from('device_reset_audit').insert({ target_user_id: targetId, reset_by: user.id });
    load().catch(() => {});
  }

  const dotColor = (s: RowData['status']) => s === 'Alpha' ? '#EF4444' : s === 'Hadir' ? '#10B981' : s === 'Terlambat' ? '#F59E0B' : '#F97316';

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScreenHeader title="Dashboard Monitoring" subtitle={`${formatIndoDate(tgl)} • ${counts.total} guru/staf`} />
      <Card overlap>
        <View style={{ flexDirection: 'row' }}>
          {[
            ['Hadir', counts.hadir, '#10B981', '#E7F6EC'],
            ['Izin', counts.izin, '#2563EB', '#EAF1FE'],
            ['Sakit', counts.sakit, '#F59E0B', '#FFF3E8'],
            ['Alpha', counts.alpha, '#EF4444', '#FDE4E4'],
          ].map(([k, v, ink, tint]) => (
            <View key={k as string} style={{ flex: 1, alignItems: 'center' }}>
              <IconChip name="dashboard" bg={tint as string} fg={ink as string} size={40} />
              <Text style={{ fontSize: 22, fontWeight: '800', marginTop: 6 }}>{v}</Text>
              <Text style={{ color: theme.colors.muted, fontSize: 11 }}>{k}</Text>
            </View>
          ))}
        </View>
        <View style={{ marginTop: 12 }}><Btn title="Muat Ulang" onPress={load} tone="ghost" /></View>
      </Card>

      <View style={{ margin: theme.spacing.md }}>
        <SectionTitle>Daftar Kehadiran</SectionTitle>
        <View style={{ backgroundColor: theme.colors.card, borderRadius: 18, paddingHorizontal: 16, borderWidth: 1, borderColor: '#ECEFF3' }}>
          {loading ? <ActivityIndicator style={{ paddingVertical: 14 }} /> : rows.map((r, i) => (
            <Row key={r.id} last={i === rows.length - 1} onPress={() => setDetail(r)}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                  <View style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: dotColor(r.status), marginRight: 10 }} />
                  <Text numberOfLines={1} style={{ fontWeight: r.status === 'Alpha' ? '800' : '600', fontSize: 15, flex: 1 }}>{r.nama}</Text>
                </View>
                <Pill text={r.status} tone={r.status === 'Hadir' ? 'ok' : r.status === 'Alpha' ? 'bad' : r.status === 'Terlambat' ? 'warn' : 'info'} />
              </View>
            </Row>
          ))}
        </View>
        {isAdmin ? <Text style={{ color: theme.colors.muted, fontSize: 12, marginTop: 8, textAlign: 'center' }}>Ketuk baris untuk detail & reset device.</Text> : null}
      </View>

      {/* GAP-13: card detail per guru */}
      <Modal visible={!!detail} transparent animationType="slide">
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(15,23,42,0.35)' }}>
          <View style={{ backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 22, paddingBottom: 34 }}>
            <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: '#E2E8F0', alignSelf: 'center', marginBottom: 14 }} />
            <Text style={{ fontSize: 18, fontWeight: '800' }}>{detail?.nama}</Text>
            <Text style={{ color: theme.colors.muted, marginVertical: 6 }}>Status: {detail?.status}</Text>
            <Text style={{ color: theme.colors.muted }}>Jam: {detail?.waktu ? new Date(detail.waktu).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}</Text>
            <Text style={{ color: theme.colors.muted, marginTop: 4 }}>Catatan: {detail?.alasan || '-'}</Text>
            <View style={{ marginTop: 14, gap: 8 }}>
              {isAdmin && detail ? <Btn title="Reset Device Guru Ini" onPress={() => { resetDevice(detail.id); setDetail(null); }} tone="dark" /> : null}
              <Btn title="Tutup" onPress={() => setDetail(null)} />
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
