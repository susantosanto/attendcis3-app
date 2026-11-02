import { Pressable, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../app/_layout';

/** Bahasa desain 2026 — minimalis premium:
 *  putih + ink, 1 aksen biru, radius besar, tanpa shadow berat,
 *  tombol kustom penuh (nol <Button> bawaan di seluruh app). */

type BtnTone = 'primary' | 'amber' | 'success' | 'warning' | 'danger' | 'ghost' | 'dark';

const TONE_BG: Record<BtnTone, string> = {
  primary: theme.colors.primary,
  amber: theme.colors.amber,
  success: theme.colors.checkIn,
  warning: theme.colors.amber,
  danger: theme.colors.danger,
  dark: '#111827',
  ghost: '#FFFFFF',
};
const TONE_FG: Record<BtnTone, string> = {
  primary: '#fff', amber: '#fff', success: '#fff', warning: '#fff',
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
        borderRadius: 18,
        paddingVertical: 16,
        paddingHorizontal: 18,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: pressed ? 0.88 : 1,
        transform: [{ scale: pressed ? 0.97 : 1 }],
        overflow: 'hidden',
        ...(tone !== 'ghost' ? {
          shadowColor: TONE_BG[tone], shadowOpacity: 0.35, shadowRadius: 12,
          shadowOffset: { width: 0, height: 6 }, elevation: 4,
        } : { borderWidth: 1, borderColor: '#E2E8F0' }),
        ...(flex ? { flex: 1 } : null),
      })}
    >
      <View style={{ position: 'absolute', top: 0, left: 16, right: 16, height: 1, backgroundColor: 'rgba(255,255,255,0.35)', borderRadius: 1 }} />
      <Text style={{ color: TONE_FG[tone], fontFamily: theme.font.extraBold, fontSize: 15, letterSpacing: 0.4 }}>{title}</Text>
    </Pressable>
  );
}

export function ScreenHeader({ title, subtitle, right, onBack }: { title: string; subtitle?: string; right?: React.ReactNode; onBack?: () => void }) {
  return (
    <LinearGradient
      colors={[theme.colors.header, '#D97706']}
      start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
      style={{ padding: 20, paddingBottom: 36, borderBottomLeftRadius: 26, borderBottomRightRadius: 26, overflow: 'hidden' }}
    >
      <View style={{ position: 'absolute', top: -70, right: -50, width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(255,255,255,0.14)' }} />
      <View style={{ position: 'absolute', bottom: -90, left: 30, width: 150, height: 150, borderRadius: 75, backgroundColor: 'rgba(255,255,255,0.08)' }} />
      <View style={{ position: 'absolute', top: 18, right: 14, width: 88, height: 88, borderRadius: 44, backgroundColor: 'rgba(255,255,255,0.18)', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.32)' }} />
      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 5, backgroundColor: '#fff', opacity: 0.35 }} />
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
          {onBack ? (
            <Pressable onPress={onBack} style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
              <Text style={{ color: '#fff', fontSize: 20, fontFamily: theme.font.extraBold, lineHeight: 22 }}>‹</Text>
            </Pressable>
          ) : null}
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#fff', fontFamily: theme.font.extraBold, fontSize: 22, letterSpacing: -0.6 }}>{title}</Text>
            {subtitle ? <Text style={{ color: 'rgba(255,255,255,0.78)', fontSize: 12.5, marginTop: 4, fontFamily: theme.font.regular }}>{subtitle}</Text> : null}
          </View>
        </View>
        {right}
      </View>
    </LinearGradient>
  );
}

export function Card({ children, overlap, amberAccent }: { children: React.ReactNode; overlap?: boolean; amberAccent?: boolean }) {
  return (
    <View style={{
      backgroundColor: theme.colors.card, borderRadius: 22, padding: 18,
      marginHorizontal: 16, marginTop: overlap ? -20 : 12,
      borderWidth: 1, borderColor: amberAccent ? theme.colors.amber : '#ECE9E2',
      borderLeftWidth: amberAccent ? 4 : 1, borderLeftColor: amberAccent ? theme.colors.amber : '#ECE9E2',
      shadowColor: '#0F2A5A', shadowOpacity: amberAccent ? 0.08 : 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 2,
    }}>
      {children}
    </View>
  );
}

export function SectionTitle({ children, amberDot }: { children: React.ReactNode; amberDot?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
      {amberDot ? <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: theme.colors.amber }} /> : null}
      <Text style={{ fontFamily: theme.font.extraBold, fontSize: 13, color: theme.colors.muted, letterSpacing: 1.4, textTransform: 'uppercase' }}>{children}</Text>
    </View>
  );
}

/** Kontrol segmented ala iOS (ganti deretan teks biasa). */
export function Segmented<T extends string>({ options, value, onChange }: {
  options: { key: T; label: string }[]; value: T; onChange: (k: T) => void;
}) {
  return (
    <View style={{ flexDirection: 'row', backgroundColor: '#FDF1D0', borderRadius: 14, padding: 4, gap: 4 }}>
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
            <Text style={{ fontWeight: '800', fontSize: 13, color: active ? theme.colors.primary : '#BFA77A', letterSpacing: 0.5 }}>{o.label}</Text>
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

export function Pill({ text, tone }: { text: string; tone: 'ok' | 'warn' | 'bad' | 'info' }) {  const bg = tone === 'ok' ? '#DFF7E6' : tone === 'warn' ? theme.colors.amberLight : tone === 'bad' ? '#FDE4E4' : '#E2EDFF';
  const fg = tone === 'ok' ? '#15803D' : tone === 'warn' ? theme.colors.amberDark : tone === 'bad' ? '#B91C1C' : '#1D4ED8';
  return (
    <View style={{ backgroundColor: bg, paddingHorizontal: 11, paddingVertical: 5, borderRadius: 100 }}>
      <Text style={{ color: fg, fontSize: 11.5, fontFamily: theme.font.extraBold }}>{text}</Text>
    </View>
  );
}

/** GAP-12: normalisasi nama (buang gelar S.Pd/M.Pd/S.Kom/ST/Drs/Dra/dll, tanda baca, spasi ganda). */
const GELAR = /\b(s\.?pd\.?(--h)?|m\.?pd\.?|s\.?kom\.?|s\.?si\.?|s\.?e\.?|s\.?t\.?|s\.?h\.?|s\.?ag\.?|s\.?sos\.?|drs?\.?|dra\.?|ir\.?|h\.?|hj\.?|m\.?si\.?|m\.?m\.?|dr\.?|prof\.?)\b\.?/gi;
export function normalNama(nama: string): string {
  return nama.replace(GELAR, '').replace(/[^a-zA-Z\s]/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase();
}
