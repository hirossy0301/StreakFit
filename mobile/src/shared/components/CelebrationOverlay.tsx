import { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '@/shared/theme';

type Props = {
  visible: boolean;
  streak: number;
  onDismiss: () => void;
};

// マイルストーン(7/14/30…)は特別なメッセージで祝う。
function milestoneMessage(streak: number): string | null {
  const map: Record<number, string> = {
    3: '3日連続!習慣の入り口です',
    7: '1週間達成!ここから離脱率がぐっと下がります',
    14: '2週間!完全に軌道に乗ってきました',
    30: '30日連続!もう「毎日鍛える人」です',
    50: '50日!圧巻の継続力',
    100: '100日連続!!伝説の領域です',
    365: '365日!1年間、毎日。本物です',
  };
  return map[streak] ?? null;
}

// 達成時のご褒美演出(Hookモデルの「変動報酬」)。
// 追加ライブラリ不要で、React Native 標準の Animated を使う。
export function CelebrationOverlay({ visible, streak, onDismiss }: Props) {
  const scale = useRef(new Animated.Value(0)).current;
  const flameY = useRef(new Animated.Value(0)).current;
  const milestone = milestoneMessage(streak);

  useEffect(() => {
    if (!visible) return;
    scale.setValue(0);
    flameY.setValue(0);
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, friction: 5, tension: 80, useNativeDriver: true }),
      Animated.timing(flameY, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [visible, streak, scale, flameY]);

  if (!visible) return null;

  const flameTranslate = flameY.interpolate({ inputRange: [0, 1], outputRange: [20, -8] });

  return (
    <Pressable style={styles.backdrop} onPress={onDismiss}>
      <Animated.View style={[styles.card, { transform: [{ scale }] }]}>
        <Animated.Text style={[styles.flame, { transform: [{ translateY: flameTranslate }] }]}>
          🔥
        </Animated.Text>
        <Text style={styles.count}>{streak}</Text>
        <Text style={styles.days}>日連続!</Text>
        {milestone ? (
          <View style={styles.milestone}>
            <Text style={styles.milestoneText}>{milestone}</Text>
          </View>
        ) : (
          <Text style={styles.sub}>今日も達成。明日も続けよう。</Text>
        )}
        <View style={styles.xp}>
          <Text style={styles.xpText}>+10 XP</Text>
        </View>
        <Text style={styles.tap}>タップして閉じる</Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    zIndex: 100,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
    width: '100%',
    maxWidth: 340,
    gap: spacing.xs,
  },
  flame: { fontSize: 64 },
  count: { color: colors.primary, fontSize: 64, fontWeight: '800', lineHeight: 70 },
  days: { color: colors.text, fontSize: 20, fontWeight: '700' },
  sub: { color: colors.textMuted, fontSize: 15, marginTop: spacing.sm, textAlign: 'center' },
  milestone: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  milestoneText: { color: colors.text, fontSize: 15, textAlign: 'center', lineHeight: 22 },
  xp: {
    marginTop: spacing.md,
    backgroundColor: colors.success,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  xpText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  tap: { color: colors.textMuted, fontSize: 12, marginTop: spacing.md },
});
