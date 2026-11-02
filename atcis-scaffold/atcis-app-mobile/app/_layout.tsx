import { useEffect } from 'react';
import { Text, TextInput } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts, PlusJakartaSans_400Regular, PlusJakartaSans_600SemiBold, PlusJakartaSans_700Bold, PlusJakartaSans_800ExtraBold } from '@expo-google-fonts/plus-jakarta-sans';

export const theme = {
  colors: {
    primary: '#F59E0B',
    primaryDark: '#D97706',
    amber: '#F59E0B',
    amberDark: '#D97706',
    amberLight: '#FEF3C7',
    background: '#FFFBEB',
    card: '#FFFFFF',
    text: '#1F0F00',
    muted: '#8C7A65',
    danger: '#EF4444',
    checkIn: '#10B981',
    checkOut: '#EA580C',
    header: '#F59E0B',
  },
  spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
  font: {
    regular: 'PlusJakartaSans_400Regular',
    medium: 'PlusJakartaSans_600SemiBold',
    bold: 'PlusJakartaSans_700Bold',
    extraBold: 'PlusJakartaSans_800ExtraBold',
  },
};

/** Terapkan Plus Jakarta Sans ke SELURUH teks + input aplikasi. */
function applyGlobalFont() {
  const AnyText = Text as unknown as { defaultProps?: { style?: unknown } };
  AnyText.defaultProps = { ...(AnyText.defaultProps ?? {}), style: { fontFamily: theme.font.regular } };
  const AnyInput = TextInput as unknown as { defaultProps?: { style?: unknown } };
  AnyInput.defaultProps = { ...(AnyInput.defaultProps ?? {}), style: { fontFamily: theme.font.regular } };
}

export default function RootLayout() {
  const [loaded] = useFonts({ PlusJakartaSans_400Regular, PlusJakartaSans_600SemiBold, PlusJakartaSans_700Bold, PlusJakartaSans_800ExtraBold });

  useEffect(() => {
    if (loaded) applyGlobalFont();
  }, [loaded ]);

  if (!loaded) return null;

  return (
    <>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.colors.background } }}>
        <Stack.Screen name="login" />
      </Stack>
    </>
  );
}
