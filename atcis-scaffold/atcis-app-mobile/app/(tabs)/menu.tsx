import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { theme } from '../_layout';
import { supabase } from '../../lib/supabase';
import { IconChip, type IconName } from '../../components/icons';
import { Card, ScreenHeader, SectionTitle } from '../../components/ui';

/** Menu utama: grid kartu + chip ikon garis minimalis (nol emoji). */
const ITEMS: { route: string; icon: IconName; label: string; desc: string; tint: string; ink: string; admin?: boolean; badgeKey?: string }[] = [
  { route: '/(tabs)/approval', icon: 'approval', label: 'Approval', desc: 'Persetujuan pimpinan', tint: '#EEF2F7', ink: '#0F172A', admin: true, badgeKey: 'pending' },
  { route: '/(tabs)/dashboard', icon: 'dashboard', label: 'Dashboard', desc: 'Monitoring harian', tint: '#EEF2F7', ink: '#0F172A', admin: true },
  { route: '/(tabs)/akun', icon: 'user', label: 'Akun Saya', desc: 'Profil & password', tint: '#EEF2F7', ink: '#0F172A' },
  { route: '/(tabs)/qa', icon: 'help', label: 'Bantuan', desc: 'Q&A panduan', tint: '#EEF2F7', ink: '#0F172A' },
  { route: '/(tabs)/tim', icon: 'info', label: 'Tentang', desc: 'Info aplikasi', tint: '#EEF2F7', ink: '#0F172A' },
];

export default function MenuScreen() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [pending, setPending] = useState(0);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: me } = await supabase.from('profiles').select('role').eq('id', user.id).single();
      const admin = me?.role === 'operator' || me?.role === 'kepsek';
      setIsAdmin(admin);
      if (admin) {
        const { count } = await supabase.from('leave_requests').select('id', { count: 'exact', head: true }).eq('status', 'pending');
        setPending(count ?? 0);
      }
    })().catch(() => {});
  }, []);

  const shown = ITEMS.filter((i) => !i.admin || isAdmin);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScreenHeader title="Menu" subtitle="Semua fitur dalam satu tempat" />
      <Card overlap>
        <SectionTitle>Pintasan</SectionTitle>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          {shown.map((i) => (
            <Pressable key={i.label} onPress={() => router.push(i.route as never)}
              style={({ pressed }) => ({
                width: '47%', backgroundColor: theme.colors.background, borderRadius: 16, padding: 16,
                opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.97 : 1 }],
              })}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <IconChip name={i.icon} bg={i.tint} fg={i.ink} />
                {i.badgeKey && pending > 0 ? (
                  <View style={{ backgroundColor: theme.colors.danger, borderRadius: 10, minWidth: 20, alignItems: 'center', paddingHorizontal: 5 }}>
                    <Text style={{ color: '#fff', fontSize: 11, fontWeight: '800' }}>{pending}</Text>
                  </View>
                ) : null}
              </View>
              <Text style={{ fontWeight: '800', marginTop: 8, fontSize: 15 }}>{i.label}</Text>
              <Text style={{ color: theme.colors.muted, fontSize: 12 }}>{i.desc}</Text>
            </Pressable>
          ))}
        </View>
        {!isAdmin ? (
          <Text style={{ color: theme.colors.muted, fontSize: 12, marginTop: 12, textAlign: 'center' }}>
            Menu Approval & Dashboard khusus Operator/Kepala Sekolah
          </Text>
        ) : null}
      </Card>
    </ScrollView>
  );
}
