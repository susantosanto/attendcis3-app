import { Pressable, Text, View } from 'react-native';
import Svg, { Circle, G, Line, Path, Rect } from 'react-native-svg';
import { AppIcon } from './icons';
import { theme } from '../app/_layout';

/**
 * Kartu Peta Premium (skematik, bukan peta jalan beneran):
 * lingkaran radius sekolah, pin gerbang, titik posisi kamu,
 * label jarak live + tombol refresh. Jujur: skematis, bukan skala.
 */
export function MapCard({ jarak, radius, ready, onRefresh }: {
  jarak: number; radius: number; ready: boolean; onRefresh: () => void;
}) {
  const diDalam = ready && jarak <= radius;
  // Titik user bergerak SESUAI jarak asli: 0 m = tengah, =radius = tepi lingkaran, >radius = keluar sudut.
  const frac = !ready || jarak < 0 ? 0 : Math.min(jarak / (radius * 3), 1);
  const ux = 170 + frac * (296 - 170);
  const uy = 84 + frac * (32 - 84);
  return (
    <View style={{ backgroundColor: '#fff', borderRadius: 22, borderWidth: 1, borderColor: '#ECE9E2', overflow: 'hidden', marginTop: 12 }}>
      <Svg width="100%" height={168} viewBox="0 0 340 168">
        {/* dasar */}
        <Rect x="0" y="0" width="340" height="168" fill="#F2F0EA" />
        {/* blok taman & air */}
        <Rect x="18" y="96" width="70" height="52" rx="12" fill="#DFF0E2" />
        <Path d="M252 0v168" stroke="#D9E4F5" strokeWidth="14" />
        <Path d="M252 0v168" stroke="#fff" strokeWidth="1.5" strokeDasharray="8 8" />
        {/* jalan */}
        <G stroke="#FFFFFF" strokeLinecap="round">
          <Line x1="0" y1="60" x2="340" y2="60" strokeWidth="10" />
          <Line x1="120" y1="0" x2="120" y2="168" strokeWidth="8" />
          <Line x1="0" y1="126" x2="340" y2="118" strokeWidth="8" />
        </G>
        <G stroke="#D8D3C6" strokeWidth="1.5" strokeDasharray="6 6">
          <Line x1="0" y1="60" x2="340" y2="60" />
          <Line x1="120" y1="0" x2="120" y2="168" />
        </G>
        {/* radius sekolah */}
        <Circle cx="170" cy="84" r="52" fill="rgba(37,99,235,0.10)" />
        <Circle cx="170" cy="84" r="52" fill="none" stroke="#2563EB" strokeWidth="1.5" strokeDasharray="4 5" />
        <Circle cx="170" cy="84" r="30" fill="rgba(37,99,235,0.08)" />
        {/* pin gerbang */}
        <G>
          <Path d="M170 62c-9 0-15 6.5-15 14 0 9.5 12 22 15 22s15-12.5 15-22c0-7.5-6-14-15-14z" fill="#2563EB" />
          <Circle cx="170" cy="76" r="5.5" fill="#fff" />
        </G>
        {/* posisi kamu */}
        {ready ? (
          <G>
            <Circle cx={ux} cy={uy} r={11} fill={diDalam ? 'rgba(16,185,129,0.25)' : 'rgba(249,115,22,0.25)'} />
            <Circle cx={ux} cy={uy} r={6} fill={diDalam ? '#10B981' : '#F97316'} stroke="#fff" strokeWidth={2.5} />
          </G>
        ) : null}
        {/* label radius */}
        <G>
          <Rect x="128" y="128" width="84" height="22" rx="11" fill="#1F1B16" opacity="0.85" />
        </G>
      </Svg>
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 12 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 14, fontFamily: theme.font.extraBold, color: '#1F1B16' }}>
            {ready ? (diDalam ? `Dalam radius • ${jarak} m` : `Di luar radius • ${jarak} m`) : 'Menghitung posisi…'}
          </Text>
          <Text style={{ fontSize: 12, color: '#8A8578' }}>Radius presensi {radius} m dari gerbang</Text>
        </View>
        <Pressable
          onPress={onRefresh}
          style={({ pressed }) => ({
            flexDirection: 'row', alignItems: 'center', gap: 5,
            paddingVertical: 8, paddingHorizontal: 12, borderRadius: 100,
            backgroundColor: '#EEF2F7', opacity: pressed ? 0.7 : 1,
          })}
        >
          <AppIcon name="refresh" size={13} color={theme.colors.muted} />
          <Text style={{ fontSize: 11, fontFamily: theme.font.bold, color: theme.colors.muted }}>Refresh</Text>
        </Pressable>
      </View>
    </View>
  );
}
