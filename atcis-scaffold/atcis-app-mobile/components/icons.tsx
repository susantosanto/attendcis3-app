import { View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';

/**
 * Set ikon AttendCis 3 — Feather (garis 2px konsisten, rounded, profesional).
 * "AI slop" kemarin karena path SVG digambar manual; sekarang pakai set ikon
 * yang didesain desainer ikon profesional, 1 gaya di seluruh app.
 */
export type IconName =
  | 'home' | 'menu' | 'leave' | 'approval' | 'dashboard'
  | 'calendar' | 'help' | 'info' | 'user' | 'checkin' | 'checkout'
  | 'clock' | 'refresh' | 'logout';

const MAP: Record<IconName, keyof typeof Feather.glyphMap> = {
  home: 'home',
  menu: 'grid',
  leave: 'file-text',
  approval: 'check-circle',
  dashboard: 'bar-chart-2',
  calendar: 'calendar',
  help: 'help-circle',
  info: 'info',
  user: 'user',
  checkin: 'log-in',
  checkout: 'log-out',
  clock: 'clock',
  refresh: 'refresh-cw',
  logout: 'log-out',
};

export function AppIcon({ name, size = 24, color = '#0F172A' }: {
  name: IconName; size?: number; color?: string;
}) {
  return <Feather name={MAP[name]} size={size} color={color} />;
}

/** LogoMark AttendCis 3 — huruf "A" + centang (pola logo presensi premium):
 *  biru brand + emerald, di atas squircle putih. */
export function LogoMark({ size = 76, radiusRatio = 0.28 }: { size?: number; radiusRatio?: number }) {
  return (
    <View style={{
      width: size, height: size, borderRadius: size * radiusRatio, backgroundColor: '#fff',
      alignItems: 'center', justifyContent: 'center',
      shadowColor: '#0B2A6B', shadowOpacity: 0.3, shadowRadius: 16,
      shadowOffset: { width: 0, height: 8 }, elevation: 8,
    }}>
      <Svg width={size * 0.58} height={size * 0.58} viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <Path d="M5 20 L12 4 L19 20" stroke="#4A2040" strokeWidth={2.8} />
        <Path d="M9 13.2l2.4 2.4L16.5 10" stroke="#10B981" strokeWidth={2.8} />
      </Svg>
    </View>
  );
}

/** Topi toga — ikon khas pendidikan (tidak ada di set Feather). */
export function GradCap({ size = 24, color = '#7C6CF0' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M12 4 2.5 9 12 14l9.5-5L12 4z" />
      <Path d="M6.5 11.5V16c0 1.5 2.5 3 5.5 3s5.5-1.5 5.5-3v-4.5" />
      <Path d="M18.5 9.5V15" />
    </Svg>
  );
}

/** Chip ikon: lingkaran tint lembut + ikon garis — pengganti emoji di kartu menu. */
export function IconChip({ name, bg, fg, size = 46 }: { name: IconName; bg: string; fg: string; size?: number }) {
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}>
      <AppIcon name={name} size={size * 0.48} color={fg} />
    </View>
  );
}