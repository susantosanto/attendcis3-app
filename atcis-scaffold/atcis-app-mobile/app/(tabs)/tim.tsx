import { ScrollView, Text, View } from 'react-native';
import { theme } from '../_layout';
import { AppIcon } from '../../components/icons';
import { Card, ScreenHeader, SectionTitle } from '../../components/ui';

/** Info tim pengembang (SIKADIR hub menu). */
export default function TimScreen() {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScreenHeader title="Tentang" subtitle="AttendCis 3 • Sistem Kehadiran Digital" />
      <Card overlap>
        <View style={{ alignItems: 'center', paddingVertical: 8 }}>
          <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center' }}>
            <AppIcon name="approval" size={34} color={theme.colors.primary} />
          </View>
          <Text style={{ fontSize: 20, fontWeight: '800', marginTop: 10 }}>AttendCis 3</Text>
          <Text style={{ color: theme.colors.muted }}>SD Negeri Cisomang 3</Text>
          <Text style={{ color: theme.colors.muted, fontSize: 12, marginTop: 2 }}>Versi 0.1.0 • React Native + Supabase</Text>
        </View>
      </Card>
      <Card>
        <SectionTitle>Dikembangkan Oleh</SectionTitle>
        <Text style={{ fontWeight: '700' }}>Operator Sekolah SD N Cisomang 3</Text>
        <Text style={{ color: theme.colors.muted, marginTop: 4, lineHeight: 20 }}>
          Dibangun bersama operator sekolah untuk presensi yang cepat, jujur, dan transparan. Saran & laporan bug: hubungi operator sekolah.
        </Text>
      </Card>
      <View style={{ height: 24 }} />
    </ScrollView>
  );
}
