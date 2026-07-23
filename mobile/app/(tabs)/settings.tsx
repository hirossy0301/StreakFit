import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  requestPermission,
  scheduleDailyReminder,
} from '@/features/notifications/reminders';
import { useStreakStore } from '@/features/streak/streakStore';
import { colors, radius, spacing } from '@/shared/theme';

export default function SettingsScreen() {
  const freezeCount = useStreakStore((s) => s.freezeCount);
  const longest = useStreakStore((s) => s.longest);
  const [reminderSet, setReminderSet] = useState(false);

  async function enableReminder() {
    const granted = await requestPermission();
    if (!granted) {
      Alert.alert('通知が許可されていません', '設定アプリから通知を許可してください。');
      return;
    }
    // MVP: 毎日 19:00 固定。将来は時刻ピッカーで設定。
    await scheduleDailyReminder(19, 0);
    setReminderSet(true);
    Alert.alert('リマインダーを設定しました', '毎日 19:00 に通知します。');
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text style={styles.label}>最長ストリーク</Text>
        <Text style={styles.value}>{longest} 日</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.label}>ストリークフリーズ</Text>
        <Text style={styles.value}>{freezeCount} 個</Text>
      </View>

      <Pressable
        style={({ pressed }) => [styles.cta, pressed && { opacity: 0.9 }]}
        onPress={enableReminder}
      >
        <Text style={styles.ctaText}>
          {reminderSet ? '✓ 毎日のリマインダー設定済み' : '毎日のリマインダーを設定'}
        </Text>
      </Pressable>

      <Text style={styles.note}>
        ※ MVP 版。時刻設定・アカウント同期・課金は今後実装。
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.md, gap: spacing.md },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: { color: colors.textMuted, fontSize: 15 },
  value: { color: colors.text, fontSize: 18, fontWeight: '700' },
  cta: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  ctaText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  note: { color: colors.textMuted, fontSize: 13, marginTop: spacing.sm },
});
