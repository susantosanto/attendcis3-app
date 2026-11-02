import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { theme } from '../app/_layout';

export function NetworkBadge({ online }: { online: boolean }) {
  const [visible, setVisible] = useState(!online);
  useEffect(() => setVisible(!online), [online]);
  if (!visible) return null;
  return (
    <View style={{ backgroundColor: theme.colors.danger, padding: theme.spacing.sm }}>
      <Text style={{ color: '#fff', textAlign: 'center' }}>Offline — periksa koneksi sebelum login</Text>
    </View>
  );
}
