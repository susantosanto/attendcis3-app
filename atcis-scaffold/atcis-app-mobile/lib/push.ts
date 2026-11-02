import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { supabase } from './supabase';

Notifications.setNotificationHandler({
  handleNotification: async () => ({ shouldShowAlert: true, shouldPlaySound: true, shouldSetBadge: false }),
});

/** Daftarkan expo_push_token ke profil + dengarkan perubahan leave milik sendiri. */
export function useLeaveNotifications(userId: string | null, onUpdate: () => void) {
  useEffect(() => {
    if (!userId) return;
    (async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') return;
      const token = (await Notifications.getExpoPushTokenAsync()).data;
      await supabase.from('profiles').update({ expo_push_token: token }).eq('id', userId);
    })().catch(() => {});
    const ch = supabase
      .channel(`leave-${userId}`)
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'leave_requests', filter: `user_id=eq.${userId}` },
        (payload) => {
          const s = (payload.new as { status: string }).status;
          Notifications.scheduleNotificationAsync({
            content: { title: s === 'approved' ? 'Pengajuan disetujui ✅' : s === 'rejected' ? 'Pengajuan ditolak ❌' : 'Status pengajuan berubah' },
            trigger: null,
          }).catch(() => {});
          onUpdate();
        })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [userId, onUpdate]);
}
