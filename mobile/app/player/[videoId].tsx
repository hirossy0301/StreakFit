import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';
import { useStreakStore } from '@/features/streak/streakStore';
import { CelebrationOverlay } from '@/shared/components/CelebrationOverlay';
import { colors, radius, spacing } from '@/shared/theme';

// マイルストーンかどうか(演出を強める)。
const MILESTONES = new Set([3, 7, 14, 30, 50, 100, 365]);

// 公式 IFrame プレーヤーで前面再生。DL/バックグラウンド再生はしない(規約準拠)。
export default function PlayerScreen() {
  const { videoId } = useLocalSearchParams<{ videoId: string }>();
  const router = useRouter();
  const [playing, setPlaying] = useState(true);
  const [celebrate, setCelebrate] = useState(false);

  const completeToday = useStreakStore((s) => s.completeToday);
  const isCompletedToday = useStreakStore((s) => s.isCompletedToday());

  const runCompletion = useCallback(() => {
    const alreadyDone = useStreakStore.getState().isCompletedToday();
    completeToday();
    const streak = useStreakStore.getState().current;
    // すでに今日達成済みなら演出は出さない(二重演出防止)。
    if (alreadyDone) return;
    // 達成の触覚フィードバック(変動報酬の身体的な手応え)。
    if (MILESTONES.has(streak)) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy), 120);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    setCelebrate(true);
  }, [completeToday]);

  const onStateChange = useCallback(
    (state: string) => {
      if (state === 'ended') {
        setPlaying(false);
        runCompletion();
      }
    },
    [runCompletion],
  );

  return (
    <View style={styles.screen}>
      <View style={styles.playerWrap}>
        <YoutubePlayer
          height={220}
          play={playing}
          videoId={videoId}
          onChangeState={onStateChange}
        />
      </View>

      {isCompletedToday ? (
        <View style={styles.doneBanner}>
          <Text style={styles.doneText}>🔥 今日のトレーニング達成!ストリーク継続中</Text>
        </View>
      ) : (
        <Pressable
          style={({ pressed }) => [styles.cta, pressed && { opacity: 0.9 }]}
          onPress={runCompletion}
        >
          <Text style={styles.ctaText}>✓ 完了にする</Text>
        </Pressable>
      )}

      <CelebrationOverlay
        visible={celebrate}
        streak={useStreakStore.getState().current}
        onDismiss={() => {
          setCelebrate(false);
          router.back();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg, padding: spacing.md, gap: spacing.lg },
  playerWrap: {
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  cta: {
    backgroundColor: colors.success,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  ctaText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  doneBanner: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.success,
  },
  doneText: { color: colors.text, fontSize: 16, fontWeight: '600' },
});
