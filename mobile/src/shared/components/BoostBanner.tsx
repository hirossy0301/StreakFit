import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useXpStore } from '@/features/streak/xpStore';
import { colors, radius, spacing } from '@/shared/theme';

function fmt(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

// 有効な XP ブーストがある間だけ、残り時間をカウントダウン表示する。
export function BoostBanner() {
  const activeBoost = useXpStore((s) => s.activeBoost);
  const [boost, setBoost] = useState(activeBoost());

  useEffect(() => {
    const id = setInterval(() => setBoost(activeBoost()), 1000);
    return () => clearInterval(id);
  }, [activeBoost]);

  if (!boost) return null;

  return (
    <View style={styles.banner}>
      <Text style={styles.text}>⚡ XP {boost.multiplier}倍 発動中</Text>
      <Text style={styles.time}>残り {fmt(boost.remainingSec)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.primaryDark,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  text: { color: '#fff', fontSize: 15, fontWeight: '700' },
  time: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
