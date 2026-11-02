import { useEffect, useRef, useState } from 'react';
import { Modal, Text, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { theme } from '../app/_layout';
import { Btn } from './ui';

/**
 * Kamera selfie otomatis (zero-storage):
 * dibuka → hitung mundur singkat → jepret sendiri → tutup.
 * Tanpa tombol ambil, tanpa galeri; foto hanya di memori, tidak disimpan/di-upload.
 */
export function SelfieCapture({ visible, onClose, onCaptured }: {
  visible: boolean; onClose: () => void; onCaptured: () => void;
}) {
  const [permission, requestPermission] = useCameraPermissions();
  const [count, setCount] = useState(3);
  const ref = useRef<CameraView>(null);
  const doneRef = useRef(false);

  useEffect(() => {
    if (visible) {
      doneRef.current = false;
      setCount(3);
    }
  }, [visible ]);

  async function shoot() {
    if (doneRef.current) return;
    doneRef.current = true;
    try {
      await ref.current?.takePictureAsync({ quality: 0.4, skipProcessing: true });
      // photo.uri sengaja DIBUANG — hanya bukti capture sesaat, bukan bukti simpan.
    } catch { /* abaikan, lanjut */ }
    onCaptured();
  }

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={{ flex: 1, backgroundColor: 'rgba(5,10,25,0.92)', padding: 20, justifyContent: 'center' }}>
        <Text style={{ color: '#fff', fontFamily: theme.font.extraBold, fontSize: 18, textAlign: 'center', marginBottom: 4 }}>
          Selfie Otomatis
        </Text>
        <Text style={{ color: 'rgba(255,255,255,0.7)', textAlign: 'center', marginBottom: 14 }}>
          Hadapkan wajah ke kamera — foto diambil otomatis
        </Text>
        {!permission?.granted ? (
          <View style={{ gap: 10 }}>
            <Text style={{ color: '#fff', textAlign: 'center' }}>Izin kamera diperlukan untuk presensi.</Text>
            <Btn title="Izinkan Kamera" onPress={requestPermission} />
            <Btn title="Batal" onPress={onClose} tone="ghost" />
          </View>
        ) : (
          <>
            <CameraView
              ref={ref}
              facing="front"
              style={{ height: 380, borderRadius: 24, overflow: 'hidden' }}
              onCameraReady={() => {
                let n = 3;
                setCount(n);
                const t = setInterval(() => {
                  n -= 1;
                  if (n <= 0) {
                    clearInterval(t);
                    shoot().catch(() => {});
                  } else {
                    setCount(n);
                  }
                }, 700);
              }}
            />
            <Text style={{ color: '#fff', fontFamily: theme.font.extraBold, fontSize: 44, textAlign: 'center', marginVertical: 12 }}>
              {count}
            </Text>
            <Btn title="Batal" onPress={onClose} tone="ghost" />
          </>
        )}
      </View>
    </Modal>
  );
}
