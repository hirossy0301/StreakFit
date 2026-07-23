import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useStreakStore } from '@/features/streak/streakStore';
import { colors } from '@/shared/theme';

const queryClient = new QueryClient();

export default function RootLayout() {
  const reconcile = useStreakStore((s) => s.reconcile);

  // 起動時に、フリーズ消費/ストリーク途切れを判定する。
  useEffect(() => {
    reconcile();
  }, [reconcile]);

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: colors.bg },
            headerTintColor: colors.text,
            contentStyle: { backgroundColor: colors.bg },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="add"
            options={{ presentation: 'modal', title: '動画を追加' }}
          />
          <Stack.Screen name="player/[videoId]" options={{ title: 'トレーニング' }} />
        </Stack>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
