import { useRef, useState } from 'react';
import { Text, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { theme } from '../app/_layout';
import { Btn, Pill } from './ui';

/**
 * Live-capture only. Sengaja TANPA ImagePicker/launchImageLibrary:
 * foto hanya pratinjau di memori, tidak disimpan/di-upload (zero-storage).
 */
export function SelfieCapture({ onCaptured }: { onCaptured: () => void }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [done, setDone] = useState(false);
  const ref = useRef<CameraView>(null);

  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View style={{ padding: theme.spacing.md }}>
        <Text style={{ marginBottom: theme.spacing.sm }}>Izin kamera diperlukan untuk presensi.</Text>
        <Btn title="Izinkan Kamera" onPress={requestPermission} />
      </View>
    );
  }

  async function capture() {
    const photo = await ref.current?.takePictureAsync({ quality: 0.4, skipProcessing: true });
    if (photo) {
      // photo.uri sengaja TIDAK disimpan/di-upload — hanya bukti capture sesaat.
      setDone(true);
      onCaptured();
    }
  }

  if (done) return <Pill text="Selfie terverifikasi (tidak disimpan)" tone="ok" />;

  return (
    <View>
      <CameraView ref={ref} facing="front" style={{ height: 300, borderRadius: 16, overflow: 'hidden' }} />
      <View style={{ marginTop: 10 }}>
        <Btn title="Ambil Selfie" onPress={capture} tone="dark" />
      </View>
    </View>
  );
}
