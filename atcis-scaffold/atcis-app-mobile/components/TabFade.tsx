import { useCallback, useRef } from 'react';
import { Animated } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

/** Transisi halaman tab: fade cepat yang bersih (tanpa geser — terlihat seperti bug). */
export function TabFade({ children }: { children: React.ReactNode }) {
  const op = useRef(new Animated.Value(0)).current;

  useFocusEffect(
    useCallback(() => {
      op.setValue(0);
      Animated.timing(op, { toValue: 1, duration: 160, useNativeDriver: true }).start();
    }, [op])
  );

  return (
    <Animated.View style={{ flex: 1, opacity: op }}>
      {children}
    </Animated.View>
  );
}
