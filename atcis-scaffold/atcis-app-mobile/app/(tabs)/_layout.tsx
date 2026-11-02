import { StyleSheet, View } from 'react-native';
import { Tabs } from 'expo-router';
import { BlurView } from 'expo-blur';
import { theme } from '../_layout';
import { AppIcon, type IconName } from '../../components/icons';

function TabIcon({ name, color, focused }: { name: IconName; color: string; focused: boolean }) {
  return (
    <View style={{
      width: 46, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center',
      backgroundColor: focused ? 'rgba(37,99,235,0.16)' : 'transparent',
    }}>
      <AppIcon name={name} color={color} strokeWidth={focused ? 2.2 : 1.8} />
    </View>
  );
}

/**
 * Tab bar Liquid Glass iOS 26 (Apple HIG):
 * - kapsul mengambang (radius = 1/2 tinggi), thin material
 * - specular highlight 1pt di tepi atas (putih 12%)
 * - tab aktif: ikon lebih tebal + lingkaran aksen 16%
 * - kaca HANYA di lapis navigasi — konten tetap opak (aturan Apple)
 */
export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: '#9AA3B2',
        tabBarStyle: {
          position: 'absolute',
          marginHorizontal: 20,
          marginBottom: 22,
          borderRadius: 36,
          height: 72,
          paddingTop: 10,
          paddingBottom: 12,
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          elevation: 0,
        },
        tabBarBackground: () => (
          <View style={{ ...StyleSheet.absoluteFillObject, borderRadius: 36, overflow: 'hidden' }}>
            <BlurView intensity={62} tint="light" style={StyleSheet.absoluteFillObject} />
            <View style={{ ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255,255,255,0.42)' }} />
            {/* specular highlight tepi atas */}
            <View style={{ position: 'absolute', top: 0, left: 24, right: 24, height: 1, backgroundColor: 'rgba(255,255,255,0.9)' }} />
            <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, top: 0, borderRadius: 36, borderWidth: 0.5, borderColor: 'rgba(15,23,42,0.08)' }} />
          </View>
        ),
        tabBarLabelStyle: { fontSize: 10, fontWeight: '800', marginTop: 1 },
      }}
    >
      <Tabs.Screen
        name="presensi"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused, color }) => <TabIcon name="home" color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="izin"
        options={{
          title: 'Izin',
          tabBarIcon: ({ focused, color }) => <TabIcon name="leave" color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="kalender"
        options={{
          title: 'Kalender',
          tabBarIcon: ({ focused, color }) => <TabIcon name="calendar" color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="menu"
        options={{
          title: 'Menu',
          tabBarIcon: ({ focused, color }) => <TabIcon name="menu" color={color} focused={focused} />,
        }}
      />
      {/* Layar dalam — diakses dari grid Menu, bukan tab bar */}
      <Tabs.Screen name="approval" options={{ href: null }} />
      <Tabs.Screen name="dashboard" options={{ href: null }} />
      <Tabs.Screen name="akun" options={{ href: null }} />
      <Tabs.Screen name="qa" options={{ href: null }} />
      <Tabs.Screen name="tim" options={{ href: null }} />
    </Tabs>
  );
}
