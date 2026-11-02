import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { theme } from '../_layout';
import { supabase } from '../../lib/supabase';
import { submitAttendance } from '../../lib/attendance';
import { SelfieCapture } from '../../components/SelfieCapture';
import { GeoInfo, useGeofence } from '../../components/GeofenceGate';
import { SuccessMoodDialog } from '../../components/SuccessMoodDialog';
import { Card, Pill, Row, ScreenHeader, SectionTitle } from '../../components/ui';
import { IconChip } from '../../components/icons';
import { formatIndoDate, todayJakarta } from '../../lib/haversine';

function useClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return now;
}

export default function PresensiScreen() {
  const [cfg, setCfg] = useState({ latitude: 0, longitude: 0, radius_meter: 100 });
  const [sched, setSched] = useState<{ jam_masuk: string; jam_pulang: string } | null>(null);
  const [isLibur, setIsLibur] = useState(false);
  const [liburBesok, setLiburBesok] = useState<string | null>(null);
  const [nama, setNama] = useState('Guru');
  const [role, setRole] = useState('guru');
  const [userId, setUserId] = useState<string | null>(null);
  const [stats, setStats] = useState({ hadir: 0, sakit: 0, izin: 0 });
  const [bulan, setBulan] = useState({ hadir: 0, izin: 0, alpha: 0 });
  const [history, setHistory] = useState<{ tanggal: string; waktu: string; status: string; tipe: string }[]>([]);
  const [banner, setBanner] = useState<{ judul: string; isi: string } | null>(null);
  const [selfieOk, setSelfieOk] = useState(false);
  const [alasan, setAlasan] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [jarakOk, setJarakOk] = useState(0);
  const [waktuOk, setWaktuOk] = useState('');
  const [attId, setAttId] = useState<string | null>(null);
  const [gpsKey, setGpsKey] = useState(0);
  const geo = useGeofence(cfg.latitude, cfg.longitude, gpsKey);
  const now = useClock();
  const tgl = todayJakarta();

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data: cfgRow } = await supabase.from('school_config').select('latitude, longitude, radius_meter').eq('id', 1).single();
    if (cfgRow) setCfg(cfgRow);
    const dow = new Date().getDay();
    const { data: sch } = await supabase.from('schedules').select('jam_masuk, jam_pulang').eq('hari', dow).eq('aktif', true).single();
    setSched(sch ?? null);
    const { data: lib } = await supabase.from('holidays').select('tanggal').eq('tanggal', tgl).single();
    setIsLibur(!!lib);
    // GAP-09: info H-1 libur
    const besok = new Date(Date.now() + 7 * 3600 * 1000 + 86400000).toISOString().slice(0, 10);
    const { data: lb } = await supabase.from('holidays').select('tanggal, keterangan').eq('tanggal', besok).single();
    setLiburBesok(lb ? `${lb.keterangan || 'Hari libur'} (${formatIndoDate(lb.tanggal)})` : (new Date(besok).getDay() === 0 ? `Akhir pekan (${formatIndoDate(besok)})` : null));
    const { data: ann } = await supabase.from('announcements').select('judul, isi').eq('aktif', true).order('created_at', { ascending: false }).limit(1).maybeSingle();
    if (ann) setBanner(ann);
    if (!user) return;
    setUserId(user.id);
    const { data: prof } = await supabase.from('profiles').select('nama, role').eq('id', user.id).single();
    if (prof) { setNama(prof.nama); setRole(prof.role); }
    const awalBulan = tgl.slice(0, 7) + '-01';
    const { count: hadir } = await supabase.from('attendance').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('tipe', 'in');
    const { count: sakit } = await supabase.from('leave_requests').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('jenis', 'sakit').eq('status', 'approved');
    const { count: izin } = await supabase.from('leave_requests').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('jenis', 'izin').eq('status', 'approved');
    setStats({ hadir: hadir ?? 0, sakit: sakit ?? 0, izin: izin ?? 0 });
    const { count: bHadir } = await supabase.from('attendance').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('tipe', 'in').gte('tanggal', awalBulan);
    const { count: bIzin } = await supabase.from('leave_requests').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'approved').gte('tgl_mulai', awalBulan);
    setBulan({ hadir: bHadir ?? 0, izin: bIzin ?? 0, alpha: 0 });
    const { data: hist } = await supabase.from('attendance').select('tanggal, waktu, status, tipe')
      .eq('user_id', user.id).order('waktu', { ascending: false }).limit(5);
    if (hist) setHistory(hist);
  }, [tgl]);

  useEffect(() => { load().catch(() => {}); }, [load]);

  // GAP-05: status pill kontekstual
  const jamNow = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
  const hm = jamNow.slice(0, 5);
  let pill: { text: string; tone: 'ok' | 'warn' | 'bad' | 'info' } = { text: 'Memuat jadwal…', tone: 'info' };
  if (isLibur || !sched) pill = { text: 'Libur — presensi nonaktif', tone: 'bad' };
  else if (hm < sched.jam_masuk.slice(0, 5)) pill = { text: 'Menunggu Jam Masuk', tone: 'info' };
  else if (hm < sched.jam_pulang.slice(0, 5)) pill = { text: 'Jam Kerja Aktif', tone: 'ok' };
  else pill = { text: 'Waktu Pulang Tiba', tone: 'warn' };

  async function handleSubmit(tipe: 'in' | 'out') {
    setError(null);
    if (!selfieOk) { setError('Ambil selfie dulu'); return; }
    if (geo.mock) { setError('Lokasi tiruan terdeteksi'); return; }
    if (!userId) { setError('Masuk dulu untuk presensi (atau Mode pratinjau untuk lihat tampilan)'); return; }
    setLoading(true);
    try {
      const res = await submitAttendance({
        userId, tipe, latitude: geo.latitude, longitude: geo.longitude,
        mock: geo.mock, alasanTerlambat: alasan || undefined,
      });
      setJarakOk(res.jarak);
      setWaktuOk(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));
      setAttId(res.id ?? null);
      if (tipe === 'in') setDone(true);
      load().catch(() => {});
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Gagal presensi';
      setError(mapDbMessage(msg));
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScreenHeader
        title={`Halo, ${nama} 👋`}
        subtitle={`${role === 'kepsek' ? 'Kepala Sekolah' : role === 'operator' ? 'Operator' : 'Guru'} • SDN Cisomang 3 • ${jamNow}`}
        right={<Pill text="● Online" tone="ok" />}
      />

      <Card overlap>
        {banner ? (
          <View style={{ backgroundColor: '#FFF8E6', borderRadius: 12, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#F5DFA0' }}>
            <Text style={{ fontWeight: '800', fontSize: 13 }}>PENGUMUMAN — {banner.judul}</Text>
            <Text style={{ color: theme.colors.muted, marginTop: 2 }}>{banner.isi}</Text>
          </View>
        ) : null}
        <View style={{ flexDirection: 'row' }}>
          {[['Presence', `${stats.hadir}`, 'Days'], ['Sick', `${stats.sakit}`, 'Times'], ['Permission', `${stats.izin}`, 'Times']].map(([k, v, u]) => (
            <View key={k} style={{ flex: 1, alignItems: 'center' }}>
              <Text style={{ color: theme.colors.muted, fontSize: 12 }}>{k}</Text>
              <Text style={{ fontSize: 20, fontWeight: '800' }}>{v}<Text style={{ fontSize: 11, fontWeight: '400' }}> {u}</Text></Text>
            </View>
          ))}
        </View>
        <Text style={{ color: theme.colors.muted, fontSize: 12, marginTop: 8, textAlign: 'center' }}>
          Bulan ini: {bulan.hadir} hadir • {bulan.izin} izin/sakit disetujui
        </Text>
      </Card>

      <Card>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <SectionTitle>{formatIndoDate(tgl)}</SectionTitle>
          <Pill text={pill.text} tone={pill.tone} />
        </View>
        {liburBesok ? <Text style={{ color: theme.colors.checkOut, marginBottom: 6 }}>Besok libur: {liburBesok}</Text> : null}
        <SelfieCapture onCaptured={() => setSelfieOk(true)} />
        <GeoInfo jarak={geo.ready ? geo.jarak : -1} radius={cfg.radius_meter} />
        <Text onPress={() => setGpsKey((k) => k + 1)} style={{ color: theme.colors.primary, marginBottom: 6 }}>📡 Refresh GPS</Text>
        {geo.error ? <Text style={{ color: theme.colors.danger }}>{geo.error}</Text> : null}
        <View style={{ flexDirection: 'row', gap: 12, marginTop: 6 }}>
          <Pressable
            onPress={() => handleSubmit('in')}
            style={({ pressed }) => ({
              flex: 1, borderRadius: 20, padding: 16, backgroundColor: '#fff',
              borderWidth: 1.5, borderColor: pressed ? '#10B981' : '#ECEFF3',
              opacity: pressed ? 0.9 : 1, transform: [{ scale: pressed ? 0.97 : 1 }],
              shadowColor: '#10B981', shadowOpacity: pressed ? 0.25 : 0.1, shadowRadius: 12,
              shadowOffset: { width: 0, height: 5 }, elevation: 3,
            })}
          >
            <IconChip name="checkin" bg="#DFF7E6" fg="#10B981" size={44} />
            <Text style={{ fontSize: 21, fontWeight: '800', color: '#0F172A', marginTop: 10 }}>{sched ? sched.jam_masuk.slice(0, 5) : '--:--'}</Text>
            <Text style={{ fontSize: 12, fontWeight: '800', color: '#10B981', letterSpacing: 1, marginTop: 2 }}>CHECK IN</Text>
          </Pressable>
          <Pressable
            onPress={() => handleSubmit('out')}
            style={({ pressed }) => ({
              flex: 1, borderRadius: 20, padding: 16, backgroundColor: '#fff',
              borderWidth: 1.5, borderColor: pressed ? '#F97316' : '#ECEFF3',
              opacity: pressed ? 0.9 : 1, transform: [{ scale: pressed ? 0.97 : 1 }],
              shadowColor: '#F97316', shadowOpacity: pressed ? 0.25 : 0.1, shadowRadius: 12,
              shadowOffset: { width: 0, height: 5 }, elevation: 3,
            })}
          >
            <IconChip name="checkout" bg="#FFEEDD" fg="#F97316" size={44} />
            <Text style={{ fontSize: 21, fontWeight: '800', color: '#0F172A', marginTop: 10 }}>{sched ? sched.jam_pulang.slice(0, 5) : '--:--'}</Text>
            <Text style={{ fontSize: 12, fontWeight: '800', color: '#F97316', letterSpacing: 1, marginTop: 2 }}>CHECK OUT</Text>
          </Pressable>
        </View>
        <TextInput
          placeholder="Alasan (wajib jika terlambat)"
          value={alasan} onChangeText={setAlasan}
          style={{ backgroundColor: theme.colors.background, padding: 12, borderRadius: 10, marginTop: 8 }}
        />
        {error ? <Text style={{ color: theme.colors.danger, marginTop: 8 }}>{error}</Text> : null}
        {loading ? <ActivityIndicator style={{ marginTop: 8 }} /> : null}
      </Card>

      <View style={{ margin: theme.spacing.md }}>
        <SectionTitle>Last History</SectionTitle>
        <View style={{ backgroundColor: theme.colors.card, borderRadius: 18, paddingHorizontal: 16, borderWidth: 1, borderColor: '#ECEFF3' }}>
          {history.length === 0 ? <Text style={{ color: theme.colors.muted, paddingVertical: 14 }}>Belum ada riwayat presensi.</Text> : history.map((h, i) => (
            <Row key={`${h.tanggal}-${h.tipe}-${i}`} last={i === history.length - 1}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View>
                  <Text style={{ fontWeight: '700', fontSize: 15 }}>{formatIndoDate(h.tanggal)}</Text>
                  <Text style={{ color: theme.colors.muted, fontSize: 12 }}>{h.tipe === 'in' ? 'Check In' : 'Check Out'} • {new Date(h.waktu).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</Text>
                </View>
                <Pill text={h.status === 'terlambat' ? 'Terlambat' : h.status === 'bypass' ? 'Dinas' : 'Tepat'} tone={h.status === 'terlambat' ? 'warn' : 'ok'} />
              </View>
            </Row>
          ))}
        </View>
      </View>

      <SuccessMoodDialog visible={done} jarak={jarakOk} nama={nama} waktu={waktuOk} onPick={(m) => {
        setDone(false);
        // BUGFIX: mood dipilih SETELAH insert — simpan via update.
        if (attId) (async () => { try { await supabase.from('attendance').update({ mood: m }).eq('id', attId); } catch { /* abaikan */ } })();
      }} />
    </ScrollView>
  );
}

function mapDbMessage(msg: string): string {
  if (msg.includes('NO_CHECKIN')) return 'Check-in dulu sebelum check-out';
  if (msg.includes('LATE_CHECKOUT')) return 'Melewati batas maksimal jam pulang';
  return msg;
}
