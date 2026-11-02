import { useState } from 'react';
import { Modal, ScrollView, Text, View } from 'react-native';
import { theme } from '../app/_layout';
import { Btn } from './ui';
import { dailyQuote } from '../lib/quotes';

const MOODS = ['😄', '🙂', '😐', '😴', '🔥'];

/** GAP-06: dialog sukses ala mockup — pilih mood → sertifikat disiplin + quotes. */
export function SuccessMoodDialog({
  visible, jarak, nama, waktu, onPick,
}: {
  visible: boolean; jarak: number; nama: string; waktu: string; onPick: (mood: string) => void;
}) {
  const [mood, setMood] = useState('😄');
  const [step, setStep] = useState<'mood' | 'cert'>('mood');
  const quote = dailyQuote();

  function close(m: string) {
    onPick(m);
    setStep('mood');
  }

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(15,23,42,0.35)' }}>
        <View style={{ backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 22, paddingBottom: 34 }}>
          <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: '#E2E8F0', alignSelf: 'center', marginBottom: 14 }} />
          {step === 'mood' ? (
            <>
              <Text style={{ fontSize: 22, fontWeight: '800', textAlign: 'center' }}>Check In Success!</Text>
              <Text style={{ textAlign: 'center', color: theme.colors.muted, marginVertical: 4 }}>How is your day?</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginVertical: 14 }}>
                {MOODS.map((m) => (
                  <Text key={m} onPress={() => setMood(m)} style={{ fontSize: mood === m ? 42 : 28, opacity: mood === m ? 1 : 0.45 }}>{m}</Text>
                ))}
              </View>
              <Text style={{ textAlign: 'center', color: theme.colors.muted, fontSize: 12, marginBottom: 12 }}>Please choose mood for back to menu</Text>
              <Btn title="Lanjut" onPress={() => setStep('cert')} />
            </>
          ) : (
            <ScrollView>
              <Text style={{ textAlign: 'center', fontSize: 13, color: theme.colors.muted }}>SERTIFIKAT DISIPLIN DIGITAL</Text>
              <Text style={{ textAlign: 'center', fontSize: 20, fontWeight: '800', marginVertical: 6 }}>{nama}</Text>
              <Text style={{ textAlign: 'center', color: theme.colors.muted }}>Check-in {waktu} • {jarak} m dari sekolah</Text>
              <Text style={{ textAlign: 'center', color: theme.colors.muted }}>SD Negeri Cisomang 3 • Mood hari ini {mood}</Text>
              <View style={{ backgroundColor: '#EEF4FF', borderRadius: 10, padding: 12, marginVertical: 12 }}>
                <Text style={{ textAlign: 'center', fontStyle: 'italic' }}>"{quote}"</Text>
              </View>
              <Btn title="Selesai" onPress={() => close(mood)} />
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}
