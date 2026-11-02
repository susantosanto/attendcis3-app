import * as Application from 'expo-application';
import * as Device from 'expo-device';

/** ID perangkat persisten untuk One Device One Account. */
export async function getDeviceId(): Promise<string> {
  const androidId = Application.getAndroidId?.() ?? null;
  if (androidId) return `android:${androidId}`;
  const iosId = await Application.getIosIdForVendorAsync().catch(() => null);
  if (iosId) return `ios:${iosId}`;
  return `dev:${Device.osName ?? 'unknown'}-${Device.modelName ?? 'unknown'}`;
}

export function nipToEmail(nip: string): string {
  return `${nip.trim().toLowerCase()}@attendcis.local`;
}

export function isNip(value: string): boolean {
  return /^[0-9]{4,20}$/.test(value.trim());
}
