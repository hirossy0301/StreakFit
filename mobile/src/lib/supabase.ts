import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // 開発初期に env 未設定でも落ちないよう警告に留める。
  console.warn(
    '[supabase] EXPO_PUBLIC_SUPABASE_URL / ANON_KEY が未設定です。.env を作成してください。',
  );
}

export const supabase = createClient<Database>(
  supabaseUrl ?? 'http://localhost',
  supabaseAnonKey ?? 'public-anon-key',
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  },
);
