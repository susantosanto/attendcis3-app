import { ScrollView, Text, View } from 'react-native';
import { theme } from '../_layout';
import { Card, ScreenHeader, SectionTitle } from '../../components/ui';

/** Tanya Jawab / Panduan (SIKADIR hub menu). Konten statis, tanpa backend. */
const QA = [
  { q: 'Bagaimana cara check-in?', a: 'Buka Home → ambil selfie → pastikan dalam radius sekolah → ketuk tile CHECK IN. Status tepat waktu/terlambat otomatis tercatat.' },
  { q: 'Kenapa tombol menolak padahal di sekolah?', a: 'GPS HP butuh kalibrasi: ketuk "Refresh GPS", aktifkan Mode Akurasi Tinggi, dan pastikan tidak memakai Fake GPS.' },
  { q: 'Saya ganti HP, apakah harus ke operator?', a: 'Tidak — cukup login di HP baru. Sistem otomatis memindahkan kuncian selama HP baru belum dipakai akun lain. Jika gagal, operator bisa reset dari Dashboard.' },
  { q: 'Bagaimana mengajukan izin/sakit/dinas?', a: 'Menu → Izin & Sakit → isi form → kirim. Izin reguler ditutup pukul 09:00; Dinas bebas waktu. Pantau status di riwayat.' },
  { q: 'Siapa yang menyetujui izin saya?', a: 'Guru disetujui Operator atau Kepala Sekolah; Operator hanya oleh Kepala Sekolah. Penolakan wajib disertai alasan.' },
  { q: 'Lupa password?', a: 'Menu → Akun Saya → Ganti Password. Jika tidak bisa masuk sama sekali, minta operator mereset via Dashboard → Reset Device tidak cukup — hubungi operator untuk reset password.' },
];

export default function QaScreen() {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScreenHeader title="Bantuan & Q&A" subtitle="Panduan penggunaan AttendCis 3" />
      <Card overlap>
        <SectionTitle>Sering Ditanyakan</SectionTitle>
        {QA.map((x) => (
          <View key={x.q} style={{ paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F1F4F8' }}>
            <Text style={{ fontWeight: '800', fontSize: 14 }}>❓ {x.q}</Text>
            <Text style={{ color: theme.colors.muted, marginTop: 4, lineHeight: 20 }}>{x.a}</Text>
          </View>
        ))}
      </Card>
      <View style={{ height: 24 }} />
    </ScrollView>
  );
}
