import { Pressable, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../app/_layout';

/** Bahasa desain 2026 — minimalis premium:
 *  putih + ink, 1 aksen biru, radius besar, tanpa shadow berat,
 *  tombol kustom penuh (nol <Button> bawaan di seluruh app). */

type BtnTone = 'primary' | 'success' | 'warning' | 'danger' | 'ghost' | 'dark';

const TONE_BG: Record<BtnTone, string> = {
  primary: theme.colors.primary,
  success: theme.colors.checkIn,
  warning: theme.colors.checkOut,
  danger: theme.colors.danger,
  dark: '#111827',
  ghost: '#EEF2F7',
};
const TONE_FG: Record<BtnTone, string> = {
  primary: '#fff', success: '#fff', warning: '#fff',
  danger: '#fff', dark: '#fff', ghost: theme.colors.primary,
};

export function Btn({
  title, onPress, tone = 'primary', flex,
}: {
  title: string; onPress: () => void; tone?: BtnTone; flex?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: TONE_BG[tone],
        borderRadius: 16,
        paddingVertical: 15,
        paddingHorizontal: 18,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: pressed ? 0.85 : 1,
        transform: [{ scale: pressed ? 0.98 : 1 }],
        ...(tone !== 'ghost' ? {
          shadowColor: TONE_BG[tone], shadowOpacity: 0.3, shadowRadius: 10,
          shadowOffset: { width: 0, height: 4 }, elevation: 3,
        } : null),
        ...(flex ? { flex: 1 } : null),
      })}
    >
      <Text style={{ color: TONE_FG[tone], fontWeight: '800', fontSize: 15, letterSpacing: 0.3 }}>{title}</Text>
    </Pressable>
  );
}

export function ScreenHeader({ title, subtitle, right }: { title: string; subtitle?: string; right?: React.ReactNode }) {
  return (
    <LinearGradient
      colors={[theme.colors.header, '#1E40AF']}
      start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
      style={{ padding: 20, paddingBottom: 36, borderBottomLeftRadius: 26, borderBottomRightRadius: 26, overflow: 'hidden' }}
    >
      <View style={{ position: 'absolute', top: -70, right: -50, width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(255,255,255,0.08)' }} />
      <View style={{ position: 'absolute', bottom: -90, left: 30, width: 150, height: 150, borderRadius: 75, backgroundColor: 'rgba(255,255,255,0.05)' }} />
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: '#fff', fontWeight: '800', fontSize: 22, letterSpacing: -0.6 }}>{title}</Text>
          {subtitle ? <Text style={{ color: 'rgba(255,255,255,0.78)', fontSize: 12.5, marginTop: 4 }}>{subtitle}</Text> : null}
        </View>
        {right}
      </View>
    </LinearGradient>
  );
}

export function Card({ children, overlap }: { children: React.ReactNode; overlap?: boolean }) {
  return (
    <View style={{
      backgroundColor: theme.colors.card, borderRadius: 18, padding: 16,
      marginHorizontal: 16, marginTop: overlap ? -20 : 12,
      borderWidth: 1, borderColor: '#ECEFF3',
      shadowColor: '#0F2A5A', shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 2,
    }}>
      {children}
    </View>
  );
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return <Text style={{ fontWeight: '800', fontSize: 13, marginBottom: 10, color: theme.colors.muted, letterSpacing: 1.2, textTransform: 'uppercase' }}>{children}</Text>;
}

/** Kontrol segmented ala iOS (ganti deretan teks biasa). */
export function Segmented<T extends string>({ options, value, onChange }: {
  options: { key: T; label: string }[]; value: T; onChange: (k: T) => void;
}) {
  return (
    <View style={{ flexDirection: 'row', backgroundColor: '#E9EDF3', borderRadius: 14, padding: 4, gap: 4 }}>
      {options.map((o) => {
        const active = o.key === value;
        return (
          <Pressable key={o.key} onPress={() => onChange(o.key)}
            style={({ pressed }) => ({
              flex: 1, borderRadius: 10, paddingVertical: 10, alignItems: 'center',
              backgroundColor: active ? '#fff' : 'transparent',
              opacity: pressed ? 0.85 : 1,
              shadowColor: active ? '#0F2A5A' : 'transparent',
              shadowOpacity: active ? 0.12 : 0, shadowRadius: 6,
              shadowOffset: { width: 0, height: 2 }, elevation: active ? 2 : 0,
            })}>
            <Text style={{ fontWeight: '800', fontSize: 13, color: active ? theme.colors.primary : theme.colors.muted, letterSpacing: 0.5 }}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** Baris grouped iOS: konten + chevron + hairline. */
export function Row({ children, onPress, last }: { children: React.ReactNode; onPress?: () => void; last?: boolean }) {
  return (
    <Pressable onPress={onPress} disabled={!onPress}
      style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}>
      <View style={{
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingVertical: 13, borderBottomWidth: last ? 0 : 1, borderBottomColor: '#F1F4F8',
      }}>
        <View style={{ flex: 1 }}>{children}</View>
        {onPress ? <Text style={{ color: '#C3CAD4', fontSize: 18, fontWeight: '700', marginLeft: 8 }}>›</Text> : null}
      </View>
    </Pressable>
  );
}

export function Pill({ text, tone }: { text: string; tone: 'ok' | 'warn' | 'bad' | 'info' }) {
  const bg = tone === 'ok' ? '#DFF7E6' : tone === 'warn' ? '#FFF3D6' : tone === 'bad' ? '#FDE4E4' : '#E2EDFF';
  const fg = tone === 'ok' ? '#15803D' : tone === 'warn' ? '#9A6200' : tone === 'bad' ? '#B91C1C' : '#1D4ED8';
  return (
    <View style={{ backgroundColor: bg, paddingHorizontal: 11, paddingVertical: 5, borderRadius: 100 }}>
      <Text style={{ color: fg, fontSize: 11.5, fontWeight: '800' }}>{text}</Text>
    </View>
  );
}

/** GAP-12: normalisasi nama (buang gelar S.Pd/M.Pd/S.Kom/ST/Drs/Dra/dll, tanda baca, spasi ganda). */
const GELAR = /\b(s\.?pd\.?(--h)?|m\.?pd\.?|s\.?kom\.?|s\.?si\.?|s\.?e\.?|s\.?t\.?|s\.?h\.?|s\.?ag\.?|s\.?sos\.?|drs?\.?|dra\.?|ir\.?|h\.?|hj\.?|m\.?si\.?|m\.?m\.?|dr\.?|prof\.?)\b\.?/gi;
export function normalNama(nama: string): string {
  return nama.replace(GELAR, '').replace(/[^a-zA-Z\s]/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase();
}
