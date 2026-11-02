import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { AppIcon } from '../components/icons';
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

/** Login premium 2026: gradien biru + kartu kaca (blur akrilik) + lingkaran dekor. */
export default function LoginScreen() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPw, setShowPw] = useState(false);

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
      // GAP-02: smart bind via RPC — ganti HP diizinkan selama device baru belum dipakai orang.
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
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={['#0B2A6B', '#1D4ED8', '#3B82F6']}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      {/* Lingkaran dekor akrilik */}
      <View style={{ position: 'absolute', top: -90, right: -90, width: 260, height: 260, borderRadius: 130, backgroundColor: 'rgba(255,255,255,0.10)' }} />
      <View style={{ position: 'absolute', top: 120, left: -70, width: 190, height: 190, borderRadius: 95, backgroundColor: 'rgba(255,255,255,0.07)' }} />
      <View style={{ position: 'absolute', bottom: -60, right: 40, width: 150, height: 150, borderRadius: 75, backgroundColor: 'rgba(255,255,255,0.08)' }} />

      <View style={{ flex: 1, justifyContent: 'center', padding: 24 }}>
        <View style={{ alignItems: 'center', marginBottom: 26 }}>
          <View style={{ width: 76, height: 76, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.22)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.35)' }}>
            <AppIcon name="approval" size={38} color="#fff" />
          </View>
          <Text style={{ fontSize: 30, fontWeight: '800', color: '#fff', marginTop: 14, letterSpacing: -0.5 }}>AttendCis 3</Text>
          <Text style={{ color: 'rgba(255,255,255,0.85)', marginTop: 4 }}>SD Negeri Cisomang 3 • Kehadiran Digital</Text>
        </View>

        <View style={{ paddingHorizontal: 28 }}>
          <Text style={{ fontSize: 11, fontWeight: '800', letterSpacing: 2.5, color: 'rgba(255,255,255,0.75)', marginBottom: 6 }}>SELAMAT DATANG KEMBALI</Text>
          <Text style={{ fontWeight: '800', fontSize: 30, color: '#FFFFFF', letterSpacing: -0.5, marginBottom: 22 }}>Masuk Akun</Text>
          <TextInput
            placeholder="NIP atau Email" placeholderTextColor="rgba(255,255,255,0.6)"
            autoCapitalize="none" autoComplete="off" autoCorrect={false}
            value={identifier} onChangeText={setIdentifier}
            style={{ backgroundColor: 'rgba(255,255,255,0.16)', padding: 17, borderRadius: 18, marginBottom: 10, fontSize: 16, color: '#fff', borderWidth: 1, borderColor: 'rgba(255,255,255,0.22)' }}
          />
          <TextInput
            placeholder="Password" placeholderTextColor="rgba(255,255,255,0.6)"
            secureTextEntry={!showPw} autoComplete="off" autoCorrect={false}
            value={password} onChangeText={setPassword}
            style={{ backgroundColor: 'rgba(255,255,255,0.16)', padding: 17, borderRadius: 18, marginBottom: 4, fontSize: 16, color: '#fff', borderWidth: 1, borderColor: 'rgba(255,255,255,0.22)' }}
          />
          <Text onPress={() => setShowPw((s) => !s)} style={{ color: 'rgba(255,255,255,0.85)', fontWeight: '700', marginBottom: 12, marginTop: 4, fontSize: 13, textAlign: 'right' }}>
            {showPw ? 'Sembunyikan' : 'Lihat password'}
          </Text>
          {error ? <Text style={{ color: '#FFB4B4', fontWeight: '700', marginBottom: 10, textAlign: 'center' }}>{error}</Text> : null}
          {loading ? <ActivityIndicator color="#fff" /> : (
            <Pressable
              onPress={handleLogin}
              style={({ pressed }) => ({
                backgroundColor: '#fff', borderRadius: 18, paddingVertical: 17, alignItems: 'center',
                opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.98 : 1 }],
                shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 5,
              })}
            >
              <Text style={{ color: '#1D4ED8', fontWeight: '800', fontSize: 16, letterSpacing: 0.3 }}>Masuk</Text>
            </Pressable>
          )}
          <Pressable onPress={() => router.replace('/(tabs)/presensi')}>
            <Text style={{ color: 'rgba(255,255,255,0.7)', textAlign: 'center', marginTop: 16, fontSize: 12 }}>
              Mode pratinjau UI (tanpa login)
            </Text>
          </Pressable>
        </View>

        <Text style={{ color: 'rgba(255,255,255,0.85)', textAlign: 'center', marginTop: 20, fontSize: 12, fontWeight: '600' }}>
          Dikembangkan oleh Tim IT SD Cisomang 3
        </Text>
        <Text style={{ color: 'rgba(255,255,255,0.6)', textAlign: 'center', marginTop: 4, fontSize: 11 }}>
          One Device One Account • Geofence presisi • v0.1.0
        </Text>
      </View>
    </View>
  );
}
