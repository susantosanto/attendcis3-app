import { View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

/**
 * Set ikon AttendCis 3 — hyper-minimal line (tren 2026 utk aplikasi produktivitas):
 * 1 bobot garis (1.8px @ 24px), round caps, tanpa fill, 1 warna via prop.
 * Nol emoji di chrome UI.
 */
export type IconName =
  | 'home' | 'menu' | 'leave' | 'approval' | 'dashboard'
  | 'calendar' | 'help' | 'info' | 'user' | 'checkin' | 'checkout'
  | 'clock' | 'refresh' | 'logout';

const PATHS: Record<IconName, React.ReactNode> = {
  home: <Path d="M4 11.5 12 4l8 7.5M6.5 10.5V20h11v-9.5" />,
  menu: <Path d="M4 7h16M4 12h16M4 17h16" />,
  leave: <Path d="M7 3h8l4 4v14H7zM15 3v4h4M10 12h6M10 16h6" />,
  approval: <Path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM8.5 12.5l2.5 2.5 4.5-5" />,
  dashboard: <Path d="M4 20V10M10 20V4M16 20v-7M21 20H3" />,
  calendar: <Path d="M5 6h14v15H5zM5 10h14M9 3v4M15 3v4" />,
  help: <Path d="M9.5 9.5a2.5 2.5 0 1 1 3.4 2.3c-.8.3-.9 1-.9 1.7M12 17.5v.01M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18" />,
  info: <Path d="M12 11v6M12 7.5V8M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18" />,
  user: <Path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM5 21c1-4 4-5.5 7-5.5s6 1.5 7 5.5" />,
  checkin: <Path d="M14 4h-8v16h8M10 12h11M18 8.5 21.5 12 18 15.5" />,
  checkout: <Path d="M10 4H2v16h8M14 12h-9M17 8.5 13.5 12l3.5 3.5" />,
  clock: <Path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3.5 2" />,
  refresh: <Path d="M20 12a8 8 0 1 1-2.3-5.6M20 3v4h-4" />,
  logout: <Path d="M14 4H6v16h8M10 12h11M18 8.5 21.5 12 18 15.5" />,
};

export function AppIcon({ name, size = 24, color = '#0F172A', strokeWidth = 1.8 }: {
  name: IconName; size?: number; color?: string; strokeWidth?: number;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <Circle cx="12" cy="12" r="0.1" strokeWidth={0} />
      {PATHS[name]}
    </Svg>
  );
}

/** Chip ikon: lingkaran tint lembut + garis berwarna — pengganti emoji di kartu menu. */
export function IconChip({ name, bg, fg, size = 46 }: { name: IconName; bg: string; fg: string; size?: number }) {
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}>
      <AppIcon name={name} size={size * 0.5} color={fg} />
    </View>
  );
}
