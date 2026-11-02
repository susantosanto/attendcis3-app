import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export const theme = {
  colors: {
    primary: '#2563EB', // biru premium 2026
    primaryDark: '#1E40AF',
    background: '#F6F7F9',
    card: '#FFFFFF',
    text: '#0F172A',
    muted: '#8A94A6',
    danger: '#EF4444',
    checkIn: '#10B981', // emerald — standar sukses/go 2026
    checkOut: '#F97316', // vivid orange — standar energi/aksi 2026
    header: '#1D4ED8',
  },
  spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
};

export default function RootLayout() {
  return (
    <>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.colors.background } }}>
        <Stack.Screen name="login" />
      </Stack>
    </>
  );
}
