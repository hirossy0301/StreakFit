import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '@/shared/theme';

type Props = {
  current: number;
  completedToday: boolean;
};

// ホームの主役。損失回避を効かせるため、連続日数を最も大きく表示する。
export function StreakBadge({ current, completedToday }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.flame}>{completedToday ? '🔥' : '🕯️'}</Text>
      <Text style={styles.count}>{current}</Text>
      <Text style={styles.label}>
        {current === 0
          ? 'ストリークを始めよう'
          : completedToday
            ? '日連続 — 今日も達成!'
            : '日連続 — 今日はまだ'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  flame: { fontSize: 48 },
  count: {
    color: colors.primary,
    fontSize: 72,
    fontWeight: '800',
    lineHeight: 78,
  },
  label: { color: colors.textMuted, fontSize: 15 },
});
