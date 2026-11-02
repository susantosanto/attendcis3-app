import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../_layout';
import { supabase } from '../../lib/supabase';
import { submitAttendance } from '../../lib/attendance';
import { SelfieCapture } from '../../components/SelfieCapture';
import { MapCard } from '../../components/MapCard';
import { TabFade } from '../../components/TabFade';
import { useGeofence } from '../../components/GeofenceGate';
import { SuccessMoodDialog } from '../../components/SuccessMoodDialog';
import { Pill, Row, SectionTitle } from '../../components/ui';
import { AppIcon } from '../../components/icons';
import { formatIndoDate, indoParts, todayJakarta } from '../../lib/haversine';

export default function PresensiScreen() {
  const [cfg, setCfg] = useState({ latitude: 0, longitude: 0, radius_meter: 100 });
  const [sched, setSched] = useState<{ jam_masuk: string; jam_pulang: string } | null>(null);
  const [isLibur, setIsLibur] = useState(false);
  const [liburBesok, setLiburBesok] = useState<string | null>(null);
  const [nama, setNama] = useState('Guru');
  const [role, setRole] = useState('guru');
  const [userId, setUserId] = useState<string | null>(null);
  const [bulan, setBulan] = useState({ hadir: 0, izin: 0, alpha: 0 });
  const [history, setHistory] = useState<{ tanggal: string; waktu: string; status: string; tipe: string }[]>([]);
  const [banner, setBanner] = useState<{ judul: string; isi: string } | null>(null);
  const [camOpen, setCamOpen] = useState(false);
  const [alasan, setAlasan] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [jarakOk, setJarakOk] = useState(0);
  const [waktuOk, setWaktuOk] = useState('');
  const [attId, setAttId] = useState<string | null>(null);
  const [gpsKey, setGpsKey] = useState(0);
  const geo = useGeofence(cfg.latitude, cfg.longitude, gpsKey);
  const tgl = todayJakarta();
  const parts = indoParts(tgl);
  const recIn = history.find((h) => h.tanggal === tgl && h.tipe === 'in');
  const recOut = history.find((h) => h.tanggal === tgl && h.tipe === 'out');
  const fmtWaktu = (w: string | null) => w ? new Date(w).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace(':', ' : ') : '– : –';

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
    const { count: bHadir } = await supabase.from('attendance').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('tipe', 'in').gte('tanggal', awalBulan);
    const { count: bIzin } = await supabase.from('leave_requests').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'approved').gte('tgl_mulai', awalBulan);
    setBulan({ hadir: bHadir ?? 0, izin: bIzin ?? 0, alpha: 0 });
    const { data: hist } = await supabase.from('attendance').select('tanggal, waktu, status, tipe')
      .eq('user_id', user.id).order('waktu', { ascending: false }).limit(5);
    if (hist) setHistory(hist);
  }, [tgl]);

  useEffect(() => { load().catch(() => {}); }, [load]);

  async function handleSubmit(tipe: 'in' | 'out') {
    setError(null);
    if (tipe === 'in' && !camOpen) {
      // Check-in SELALU lewat kamera otomatis — tanpa tombol selfie manual.
      if (geo.mock) { setError('Lokasi tiruan terdeteksi'); return; }
      setCamOpen(true);
      return;
    }
    await doSubmit(tipe);
  }

  async function doSubmit(tipe: 'in' | 'out') {
    setError(null);
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
    <TabFade>
    <ScrollView style={{ flex: 1, backgroundColor: '#F5F3EF' }} contentContainerStyle={{ paddingBottom: 120 }}>
      {/* Kepala halaman ringan */}
      <LinearGradient
        colors={[theme.colors.header, theme.colors.amberDark]}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={{ paddingHorizontal: 20, paddingTop: 18, paddingBottom: 26, borderBottomLeftRadius: 28, borderBottomRightRadius: 28, overflow: 'hidden', alignItems: 'center' }}
      >
        <View style={{ position: 'absolute', top: -70, right: -50, width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(255,255,255,0.08)' }} />
        <View style={{ position: 'absolute', bottom: -90, left: 30, width: 150, height: 150, borderRadius: 75, backgroundColor: 'rgba(255,255,255,0.05)' }} />
        <View style={{
          width: 84, height: 84, borderRadius: 42, marginTop: 10, alignItems: 'center', justifyContent: 'center',
          backgroundColor: 'rgba(255,255,255,0.25)', borderWidth: 3, borderColor: 'rgba(255,255,255,0.9)',
          shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 14,
          shadowOffset: { width: 0, height: 6 }, elevation: 6,
        }}>
          <View style={{ width: 70, height: 70, borderRadius: 35, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 28, fontFamily: theme.font.extraBold, color: theme.colors.amberDark }}>{nama.charAt(0).toUpperCase()}</Text>
          </View>
        </View>
        <Text style={{ fontSize: 22, fontFamily: theme.font.extraBold, color: '#fff', letterSpacing: -0.4, marginTop: 10 }}>{nama}</Text>
        <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 2 }}>{role === 'kepsek' ? 'Kepala Sekolah' : role === 'operator' ? 'Operator' : 'Guru'} • SDN Cisomang 3</Text>
      </LinearGradient>

      <View style={{ marginHorizontal: 16, marginTop: 14, backgroundColor: '#fff', borderRadius: 22, padding: 18, borderWidth: 1, borderColor: '#ECE9E2' }}>
        {banner ? (
          <View style={{ backgroundColor: '#FFF8E6', borderRadius: 12, padding: 10, marginBottom: 12 }}>
            <Text style={{ fontWeight: '700', fontSize: 13 }}>PENGUMUMAN — {banner.judul}</Text>
            <Text style={{ color: theme.colors.muted, marginTop: 2, fontSize: 12 }}>{banner.isi}</Text>
          </View>
        ) : null}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <Text style={{ fontSize: 13, fontFamily: theme.font.extraBold, color: '#1F1B16' }}>
            <Text style={{ color: '#7C6CF0' }}>▍</Text> Bulan ini
          </Text>
          <Text style={{ fontSize: 12, color: '#8A8578' }}>{parts ? `${parts.monFull} ${parts.year}` : ''}</Text>
        </View>
        <View style={{ flexDirection: 'row' }}>
          <View style={{ flex: 1, alignItems: 'flex-start' }}>
            <Text style={{ fontSize: 32, fontFamily: theme.font.extraBold, color: '#1F1B16' }}>{bulan.hadir}</Text>
            <Text style={{ fontSize: 13, color: '#6B6659' }}>Hadir</Text>
          </View>
          <View style={{ width: 1, backgroundColor: '#ECE9E2', marginVertical: 4 }} />
          <View style={{ flex: 1, alignItems: 'flex-start', paddingLeft: 18 }}>
            <Text style={{ fontSize: 32, fontFamily: theme.font.extraBold, color: '#1F1B16' }}>{bulan.izin}</Text>
            <Text style={{ fontSize: 13, color: '#6B6659' }}>Izin / sakit <Text style={{ fontSize: 11 }}>disetujui</Text></Text>
          </View>
        </View>
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: 20, marginTop: 22, marginBottom: 10 }}>
        <Text style={{ fontSize: 18, fontFamily: theme.font.extraBold, color: '#1F1B16' }}>Presensi hari ini</Text>
      </View>

      <View style={{ marginHorizontal: 16, backgroundColor: '#fff', borderRadius: 22, padding: 16, borderWidth: 1, borderColor: '#ECE9E2' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={{ width: 52, height: 60, borderRadius: 14, borderWidth: 1, borderColor: '#ECE9E2', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FAF9F6' }}>
            <Text style={{ fontSize: 10, fontFamily: theme.font.extraBold, letterSpacing: 1.5, color: '#8A8578' }}>{parts ? parts.monShort.toUpperCase() : ''}</Text>
            <Text style={{ fontSize: 22, fontFamily: theme.font.extraBold, color: '#1F1B16' }}>{parts ? parts.dayPadded : ''}</Text>
          </View>
          <View>
            <Text style={{ fontSize: 17, fontFamily: theme.font.extraBold, color: '#1F1B16' }}>{parts ? parts.dowName : ''}</Text>
            <Text style={{ fontSize: 13, color: '#8A8578' }}>{parts ? `${parts.dayNum} ${parts.monFull} ${parts.year}` : ''}</Text>
          </View>
        </View>
        {geo.error ? <Text style={{ color: theme.colors.danger, marginVertical: 6 }}>{geo.error}</Text> : null}
        {(!sched || isLibur) ? (
          <View style={{ backgroundColor: '#F1EFE9', borderRadius: 14, padding: 12, marginTop: 12, flexDirection: 'row', gap: 10, alignItems: 'center' }}>
            <AppIcon name="info" size={20} color="#8A8578" />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 13, fontFamily: theme.font.bold, color: '#5B564A' }}>Libur — presensi nonaktif</Text>
              <Text style={{ fontSize: 12, color: '#8A8578' }}>Tidak ada presensi yang perlu diisi.</Text>
            </View>
          </View>
        ) : (
          <View style={{ backgroundColor: '#EEF4FF', borderRadius: 14, padding: 12, marginTop: 12, flexDirection: 'row', gap: 10, alignItems: 'center' }}>
            <AppIcon name="info" size={20} color={theme.colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 13, fontFamily: theme.font.bold, color: '#1E40AF' }}>
                {!userId ? 'Masuk untuk mengaktifkan presensi GPS' : `Radius ${cfg.radius_meter} m • ${geo.ready ? (geo.jarak <= cfg.radius_meter ? `Dalam radius (${geo.jarak} m)` : `Di luar radius (${geo.jarak} m)`) : 'Menghitung jarak…'}`}
              </Text>
              {liburBesok ? <Text style={{ fontSize: 12, color: theme.colors.checkOut, marginTop: 2 }}>Besok libur: {liburBesok}</Text> : null}
            </View>
          </View>
        )}
        <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
          <Pressable
            onPress={() => handleSubmit('in')}
            style={({ pressed }) => ({
              flex: 1, borderRadius: 22, overflow: 'hidden',
              opacity: pressed ? 0.92 : 1, transform: [{ scale: pressed ? 0.96 : 1 }, { translateY: pressed ? 2 : 0 }],
              shadowColor: '#065F46', shadowOpacity: 0.35, shadowRadius: 18,
              shadowOffset: { width: 0, height: 10 }, elevation: 8,
            })}
          >
            <LinearGradient
              colors={['#34D399', '#10B981', '#059669']}
              start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
              style={{ padding: 16, borderRadius: 22, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.45)', borderBottomColor: '#065F46' }}
            >
              <View style={{ position: 'absolute', top: 0, left: 12, right: 12, height: 18, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.22)' }} />
              <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.95)', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.9)', shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 4 }}>
                <AppIcon name="checkin" size={22} color="#059669" />
              </View>
              <Text style={{ fontSize: 23, fontFamily: theme.font.extraBold, color: '#fff', marginTop: 12, textShadowColor: 'rgba(0,0,0,0.18)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 }}>{recIn ? fmtWaktu(recIn.waktu) : '– : –'}</Text>
              <Text style={{ fontSize: 12, fontFamily: theme.font.extraBold, color: 'rgba(255,255,255,0.95)', letterSpacing: 1.6, marginTop: 2 }}>CHECK IN</Text>
              <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.85)', marginTop: 2 }}>{recIn ? `Tercatat ${fmtWaktu(recIn.waktu)}` : 'Belum tercatat'}</Text>
            </LinearGradient>
          </Pressable>
          <Pressable
            onPress={() => handleSubmit('out')}
            style={({ pressed }) => ({
              flex: 1, borderRadius: 22, overflow: 'hidden',
              opacity: pressed ? 0.92 : 1, transform: [{ scale: pressed ? 0.96 : 1 }, { translateY: pressed ? 2 : 0 }],
              shadowColor: '#7C2D12', shadowOpacity: 0.35, shadowRadius: 18,
              shadowOffset: { width: 0, height: 10 }, elevation: 8,
            })}
          >
            <LinearGradient
              colors={['#FB923C', '#F97316', '#EA580C']}
              start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
              style={{ padding: 16, borderRadius: 22, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.45)', borderBottomColor: '#7C2D12' }}
            >
              <View style={{ position: 'absolute', top: 0, left: 12, right: 12, height: 18, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.22)' }} />
              <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.95)', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.9)', shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 4 }}>
                <AppIcon name="checkout" size={22} color="#EA580C" />
              </View>
              <Text style={{ fontSize: 23, fontFamily: theme.font.extraBold, color: '#fff', marginTop: 12, textShadowColor: 'rgba(0,0,0,0.18)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 }}>{recOut ? fmtWaktu(recOut.waktu) : '– : –'}</Text>
              <Text style={{ fontSize: 12, fontFamily: theme.font.extraBold, color: 'rgba(255,255,255,0.95)', letterSpacing: 1.6, marginTop: 2 }}>CHECK OUT</Text>
              <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.85)', marginTop: 2 }}>{recOut ? `Tercatat ${fmtWaktu(recOut.waktu)}` : 'Belum tercatat'}</Text>
            </LinearGradient>
          </Pressable>
        </View>
        <Text style={{ fontSize: 11, fontFamily: theme.font.extraBold, letterSpacing: 1.5, color: theme.colors.muted, marginTop: 14 }}>
          ALASAN KETERLAMBATAN
        </Text>
        <TextInput
          placeholder=""
          autoCapitalize="none" autoCorrect={false}
          value={alasan} onChangeText={setAlasan}
          style={{ fontSize: 16, fontFamily: theme.font.regular, color: theme.colors.text, borderBottomWidth: 1.5, borderBottomColor: '#E2E8F0', paddingVertical: 10, outlineStyle: 'none' } as never}
        />
        {error ? <Text style={{ color: theme.colors.danger, marginTop: 8 }}>{error}</Text> : null}
        {loading ? <ActivityIndicator style={{ marginTop: 8 }} /> : null}
      </View>

      <View style={{ marginHorizontal: 16 }}>
        <MapCard jarak={geo.ready ? geo.jarak : -1} radius={cfg.radius_meter} ready={geo.ready} onRefresh={() => setGpsKey((k) => k + 1)} />
      </View>

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
      <SelfieCapture
        visible={camOpen}
        onClose={() => setCamOpen(false)}
        onCaptured={() => { setCamOpen(false); doSubmit('in').catch(() => {}); }}
      />
    </ScrollView>
    </TabFade>
  );
}

function mapDbMessage(msg: string): string {
  if (msg.includes('NO_CHECKIN')) return 'Check-in dulu sebelum check-out';
  if (msg.includes('LATE_CHECKOUT')) return 'Melewati batas maksimal jam pulang';
  return msg;
}
