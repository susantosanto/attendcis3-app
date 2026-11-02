import { useEffect, useState } from 'react';
import { Text } from 'react-native';
import * as Location from 'expo-location';
import { theme } from '../app/_layout';
import { haversineM } from '../lib/haversine';

export interface GeoState {
  ready: boolean;
  latitude: number;
  longitude: number;
  jarak: number;
  mock: boolean;
  error: string | null;
}

/** Ambil 3 sampel lokasi, rata-ratakan untuk meredam drift GPS HP low-end. */
export function useGeofence(schoolLat: number, schoolLon: number, refreshKey = 0) {
  const [state, setState] = useState<GeoState>({
    ready: false, latitude: 0, longitude: 0, jarak: -1, mock: false, error: null,
  });

  useEffect(() => {
    setState((s) => ({ ...s, ready: false, error: null }));
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setState((s) => ({ ...s, error: 'Izin lokasi ditolak' }));
        return;
      }
      const samples = await Promise.all(
        [0, 1, 2].map(() => Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }))
      );
      const lat = samples.reduce((a, s) => a + s.coords.latitude, 0) / samples.length;
      const lon = samples.reduce((a, s) => a + s.coords.longitude, 0) / samples.length;
      const mocked = samples.some((s) => s.mocked === true);
      setState({
        ready: true, latitude: lat, longitude: lon,
        jarak: Math.round(haversineM(lat, lon, schoolLat, schoolLon)),
        mock: mocked, error: null,
      });
    })().catch((e) => setState((s) => ({ ...s, error: String(e?.message ?? e) })));
  }, [schoolLat, schoolLon, refreshKey]);

  return state;
}

export function GeoInfo({ jarak, radius }: { jarak: number; radius: number }) {
  const ok = jarak >= 0 && jarak <= radius;
  return (
    <Text style={{ color: ok ? theme.colors.checkIn : theme.colors.danger, marginVertical: 8, fontWeight: '700' }}>
      {jarak < 0 ? 'Menghitung jarak…' : ok ? `Dalam radius (${jarak} m)` : `Di luar radius (${jarak} m dari ${radius} m)`}
    </Text>
  );
}
