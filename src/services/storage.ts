import { createMMKV } from 'react-native-mmkv';

// Single on-device key-value store (MMKV). In tests, react-native-mmkv swaps in an in-memory mock.
export const storage = createMMKV({ id: 'hyakki' });
