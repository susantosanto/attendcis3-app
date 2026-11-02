import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { LogoMark } from '../components/icons';
import { HeroArt, CardPattern } from '../components/LoginArt';
import { theme } from './_layout';
import { getDeviceId, isNip, nipToEmail } from '../lib/device';
import { supabase } from '../lib/supabase';

const GENERIC_ERROR = 'NIP/email atau password salah';
const LOCK_KEY = 'atcis_lock_until';
const FAIL_KEY = 'atcis_fail_count';

/** GAP-01: lockout client 3x salah → kunci 5 menit (lapis pertama; RLS tetap di server). */
async function checkLock(): Promise<number> {
  const until = Number((await AsyncStorage.getItem(LOCK_KEY)) ?? 0);
  return until > Date.now() ? Math.ceil((until - Date.now()) / 1000) : 0;
}
async function noteFail(): Promise<number> {
  const n = Number((await AsyncStorage.getItem(FAIL_KEY)) ?? 0) + 1;
  await AsyncStorage.setItem(FAIL_KEY, String(n));
  if (n >= 3) {
    await AsyncStorage.setItem(LOCK_KEY, String(Date.now() + 5 * 60 * 1000));
    await AsyncStorage.setItem(FAIL_KEY, '0');
  }
  return n;
}

/**
 * Login konsep kartu bottom-sheet (adaptasi referensi):
 * hero gradien biru + gumpalan dekor + kartu putih melengkung menindih,
 * field gaya label-atas + garis bawah, remember-me + lupa password,
 * tombol LOGIN besar, footer akun. Warna & logo tetap aplikasi.
 */
export default function LoginScreen() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPw, setShowPw] = useState(false);
  const [info, setInfo] = useState<string | null>(null);

  async function fail(msg: string) {
    const n = await noteFail();
    setError(n >= 3 ? 'Terlalu banyak salah. Terkunci 5 menit.' : msg);
    await supabase.auth.signOut().catch(() => {});
  }

  async function handleLogin() {
    setError(null);
    if (!identifier.trim() || !password) {
      setError('NIP/email dan password wajib diisi');
      return;
    }
    const sisa = await checkLock();
    if (sisa > 0) {
      setError(`Akun terkunci. Coba lagi dalam ${Math.ceil(sisa / 60)} menit.`);
      return;
    }
    setLoading(true);
    try {
      const email = isNip(identifier) ? nipToEmail(identifier) : identifier.trim().toLowerCase();
      const { data, error: signErr } = await supabase.auth.signInWithPassword({ email, password });
      if (signErr || !data.user) {
        await fail(GENERIC_ERROR);
        return;
      }
      const deviceId = await getDeviceId();
      const { error: rpcErr } = await supabase.rpc('bind_device', { p_device: deviceId });
      if (rpcErr) {
        const msg = rpcErr.message.includes('DEVICE_TAKEN')
          ? 'Akun ini terikat ke perangkat lain. Hubungi operator untuk reset.'
          : GENERIC_ERROR;
        await fail(msg);
        return;
      }
      await AsyncStorage.setItem(FAIL_KEY, '0');
      router.replace('/(tabs)/presensi');
    } catch {
      await fail(GENERIC_ERROR);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.header }}>
      <LinearGradient
        colors={['#92400E', '#D97706', '#F59E0B']}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      {/* Gumpalan dekor biru + amber madu */}
      <View style={{ position: 'absolute', top: -110, right: -110, width: 300, height: 300, borderRadius: 150, backgroundColor: 'rgba(255,255,255,0.10)', transform: [{ rotate: '18deg' }] }} />
      <View style={{ position: 'absolute', top: -20, right: 40, width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(245,158,11,0.28)', borderWidth: 1, borderColor: 'rgba(245,158,11,0.35)' }} />
      <View style={{ position: 'absolute', top: 60, left: -80, width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(255,255,255,0.07)' }} />

      {/* Hero atas */}
      <View style={{ paddingTop: 52, paddingHorizontal: 28 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <LogoMark size={44} />
            <View>
              <Text style={{ color: '#fff', fontFamily: theme.font.extraBold, fontSize: 17, letterSpacing: 0.5 }}>ATTENDCIS 3</Text>
              <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 11, letterSpacing: 1.5, fontFamily: theme.font.bold }}>SD NEGERI CISOMANG 3</Text>
            </View>
          </View>
          <Text onPress={() => router.replace('/(tabs)/presensi')} style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, fontFamily: theme.font.bold }}>
            Lewati ›
          </Text>
        </View>
        <View style={{ alignItems: 'flex-end', marginTop: 8, marginBottom: -6, marginRight: -10 }}>
          <HeroArt h={124} mt={0} />
        </View>
        <Text style={{ color: '#fff', fontFamily: theme.font.extraBold, fontSize: 30, letterSpacing: -0.5 }}>
          Attendance,{'\n'}verified in seconds.
        </Text>
        <Text style={{ color: 'rgba(255,255,255,0.8)', marginTop: 8, fontFamily: theme.font.regular, lineHeight: 21 }}>
          GPS-validated, tamper-proof check-ins for SDN Cisomang 3 staff.
        </Text>
      </View>

      {/* Kartu putih bottom-sheet */}
      <View style={{ flex: 1 }} />
      <View style={{
        backgroundColor: '#fff', borderTopLeftRadius: 32, borderTopRightRadius: 32,
        paddingHorizontal: 28, paddingTop: 22, paddingBottom: 30, overflow: 'hidden',
        shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 20, shadowOffset: { width: 0, height: -6 }, elevation: 10,
      }}>
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, backgroundColor: theme.colors.amber }} />
        <CardPattern />
        <Text style={{ fontSize: 11, fontFamily: theme.font.extraBold, letterSpacing: 1.5, color: theme.colors.muted }}>NIP ATAU EMAIL</Text>
        <TextInput
          autoCapitalize="none" autoComplete="off" autoCorrect={false}
          value={identifier} onChangeText={setIdentifier}
          style={{ fontSize: 17, fontFamily: theme.font.regular, color: theme.colors.text, borderBottomWidth: 1.5, borderBottomColor: '#E2E8F0', paddingVertical: 10, marginBottom: 18, outlineStyle: 'none' } as never}
        />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontSize: 11, fontFamily: theme.font.extraBold, letterSpacing: 1.5, color: theme.colors.muted }}>PASSWORD</Text>
          <Text onPress={() => setInfo('Lupa password? Hubungi Operator Sekolah untuk reset.') } style={{ fontSize: 12, fontFamily: theme.font.bold, color: theme.colors.amberDark }}>
            Lupa Password?
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1.5, borderBottomColor: '#E2E8F0', marginBottom: 6 }}>
          <TextInput
            placeholder="••••••••"
            placeholderTextColor="#AEB7C4"
            secureTextEntry={!showPw} autoComplete="off" autoCorrect={false}
            value={password} onChangeText={setPassword}
            style={{ flex: 1, fontSize: 17, fontFamily: theme.font.regular, color: theme.colors.text, paddingVertical: 10, outlineStyle: 'none' } as never}
          />
          <Text onPress={() => setShowPw((s) => !s)} style={{ fontSize: 12, fontFamily: theme.font.bold, color: theme.colors.muted }}>
            {showPw ? 'SEMBUNYI' : 'LIHAT'}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 14, marginBottom: 4 }}>
          <Pressable
            onPress={() => setRemember((r) => !r)}
            style={{ width: 20, height: 20, borderRadius: 6, borderWidth: 1.5, borderColor: remember ? theme.colors.amber : '#CBD5E1', backgroundColor: remember ? theme.colors.amber : '#fff', alignItems: 'center', justifyContent: 'center', marginRight: 8 }}
          >
            {remember ? <Text style={{ color: '#fff', fontSize: 13, fontFamily: theme.font.extraBold }}>✓</Text> : null}
          </Pressable>
          <Text style={{ fontSize: 13, color: theme.colors.muted, fontFamily: theme.font.regular }}>Ingat saya di perangkat ini</Text>
        </View>
        {info ? <Text style={{ color: theme.colors.primary, fontSize: 12, marginTop: 6 }}>{info}</Text> : null}
        {error ? <Text style={{ color: theme.colors.danger, fontFamily: theme.font.bold, marginTop: 8, textAlign: 'center' }}>{error}</Text> : null}
        <View style={{ marginTop: 16 }}>
          {loading ? <ActivityIndicator color={theme.colors.amber} /> : (
            <Pressable
              onPress={handleLogin}
              style={({ pressed }) => ({
                backgroundColor: theme.colors.amber, borderRadius: 18, paddingVertical: 17, alignItems: 'center',
                opacity: pressed ? 0.88 : 1, transform: [{ scale: pressed ? 0.98 : 1 }],
                shadowColor: theme.colors.amber, shadowOpacity: 0.42, shadowRadius: 14,
                shadowOffset: { width: 0, height: 7 }, elevation: 5, overflow: 'hidden',
              })}
            >
              <View style={{ position: 'absolute', top: 0, left: 20, right: 20, height: 1, backgroundColor: 'rgba(255,255,255,0.55)', borderRadius: 1 }} />
              <Text style={{ color: '#fff', fontFamily: theme.font.extraBold, fontSize: 16, letterSpacing: 1.5 }}>LOGIN</Text>
            </Pressable>
          )}
        </View>
        <Text style={{ color: theme.colors.muted, textAlign: 'center', marginTop: 16, fontSize: 11 }}>
          Dikembangkan oleh Operator SD Negeri Cisomang 3 • v0.1.0
        </Text>
      </View>
    </View>
  );
}
