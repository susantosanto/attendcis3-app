import { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { Tabs } from 'expo-router';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { theme } from '../_layout';
import { AppIcon, type IconName } from '../../components/icons';

const TABS: { name: string; label: string; icon: IconName }[] = [
  { name: 'presensi', label: 'Home', icon: 'home' },
  { name: 'izin', label: 'Izin', icon: 'leave' },
  { name: 'kalender', label: 'Kalender', icon: 'calendar' },
  { name: 'menu', label: 'Menu', icon: 'menu' },
];

/** Bottom menu animasi ala Dribbble: tab fokus mengembang jadi pil (ikon+label),
 *  tab lain ikon saja. Indikator pegas + fade label. */
function AnimatedBar({ state, navigation }: BottomTabBarProps) {
  const anims = useRef(TABS.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    TABS.forEach((t, i) => {
      const focused = state.routes[state.index]?.name === t.name;
      Animated.timing(anims[i], { toValue: focused ? 1 : 0, duration: 260, useNativeDriver: false }).start();
    });
  }, [state.index, state.routes, anims]);

  return (
    <View style={{ position: 'absolute', left: 20, right: 20, bottom: 22 }}>
      <View style={{ borderRadius: 36, overflow: 'hidden' }}>
        <BlurView intensity={62} tint="light" style={StyleSheet.absoluteFillObject} />
        <View style={{ ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255,255,255,0.42)' }} />
        <View style={{ position: 'absolute', top: 0, left: 26, right: 26, height: 1, backgroundColor: 'rgba(255,255,255,0.9)' }} />
        <View style={{ flexDirection: 'row', paddingVertical: 10, paddingHorizontal: 10 }}>
          {TABS.map((meta, i) => {
            const route = state.routes.find((r) => r.name === meta.name);
            if (!route) return null;
            const focused = state.routes[state.index]?.name === meta.name;
            const onPress = () => {
              const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
              if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
            };
            return (
              <Pressable key={route.key} onPress={onPress} style={{ flex: 1, alignItems: 'center' }}>
                <Animated.View style={{
                  flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
                  height: 40, borderRadius: 20, overflow: 'hidden',
                  paddingHorizontal: anims[i].interpolate({ inputRange: [0, 1], outputRange: [10, 16] }),
                  backgroundColor: anims[i].interpolate({ inputRange: [0, 1], outputRange: ['rgba(245,158,11,0)', 'rgba(245,158,11,0.18)'] }),
                }}>
                  <AppIcon name={meta.icon} size={23} color={focused ? theme.colors.amberDark : '#C2B59B'} />
                  <Animated.Text
                    numberOfLines={1}
                    style={{
                      fontSize: 12, fontFamily: theme.font.extraBold, color: theme.colors.amberDark,
                      opacity: anims[i], maxWidth: anims[i].interpolate({ inputRange: [0, 1], outputRange: [0, 120] }),
                    }}>
                    {meta.label}
                  </Animated.Text>
                </Animated.View>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <AnimatedBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="presensi" options={{ title: 'Home' }} />
      <Tabs.Screen name="izin" options={{ title: 'Izin' }} />
      <Tabs.Screen name="kalender" options={{ title: 'Kalender' }} />
      <Tabs.Screen name="menu" options={{ title: 'Menu' }} />
      <Tabs.Screen name="approval" options={{ href: null }} />
      <Tabs.Screen name="dashboard" options={{ href: null }} />
      <Tabs.Screen name="akun" options={{ href: null }} />
      <Tabs.Screen name="qa" options={{ href: null }} />
      <Tabs.Screen name="tim" options={{ href: null }} />
    </Tabs>
  );
}
