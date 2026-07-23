import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { useXpStore, type ChestReward } from '@/features/streak/xpStore';
import { colors, radius, spacing } from '@/shared/theme';

export default function ChestScreen() {
  const router = useRouter();
  const openNextChest = useXpStore((s) => s.openNextChest);
  const chestsAvailable = useXpStore((s) => s.chestsAvailable());

  const [reward, setReward] = useState<ChestReward | null>(null);
  const shake = useRef(new Animated.Value(0)).current;
  const revealScale = useRef(new Animated.Value(0)).current;

  function onOpen() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    // 宝箱をガタガタ揺らしてから中身を出す。
    Animated.sequence([
      Animated.timing(shake, {
        toValue: 1,
        duration: 400,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ]).start(() => {
      const r = openNextChest();
      setReward(r);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      revealScale.setValue(0);
      Animated.spring(revealScale, {
        toValue: 1,
        friction: 5,
        tension: 80,
        useNativeDriver: true,
      }).start();
    });
  }

  const rotate = shake.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: ['0deg', '-8deg', '8deg', '-8deg', '0deg'],
  });

  return (
    <View style={styles.screen}>
      {reward ? (
        <Animated.View style={[styles.rewardCard, { transform: [{ scale: revealScale }] }]}>
          <Text style={styles.openChest}>🎉</Text>
          <Text style={styles.rewardTitle}>宝箱をゲット!</Text>
          <View style={styles.rewardBadge}>
            <Text style={styles.rewardText}>{reward.label}</Text>
          </View>
          <Pressable
            style={({ pressed }) => [styles.cta, pressed && { opacity: 0.9 }]}
            onPress={() => router.back()}
          >
            <Text style={styles.ctaText}>受け取る</Text>
          </Pressable>
        </Animated.View>
      ) : (
        <View style={styles.center}>
          <Text style={styles.remaining}>開けられる宝箱:{chestsAvailable}</Text>
          <Pressable onPress={onOpen} disabled={chestsAvailable <= 0}>
            <Animated.Text style={[styles.chest, { transform: [{ rotate }] }]}>
              {chestsAvailable > 0 ? '🎁' : '🔒'}
            </Animated.Text>
          </Pressable>
          <Text style={styles.hint}>
            {chestsAvailable > 0 ? 'タップして開ける' : 'トレーニングを続けて宝箱を貯めよう'}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  center: { alignItems: 'center', gap: spacing.lg },
  remaining: { color: colors.textMuted, fontSize: 15 },
  chest: { fontSize: 120 },
  hint: { color: colors.text, fontSize: 16, fontWeight: '600' },
  rewardCard: {
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.primary,
    width: '100%',
    maxWidth: 340,
  },
  openChest: { fontSize: 72 },
  rewardTitle: { color: colors.text, fontSize: 20, fontWeight: '800' },
  rewardBadge: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  rewardText: { color: colors.primary, fontSize: 18, fontWeight: '700' },
  cta: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  ctaText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
