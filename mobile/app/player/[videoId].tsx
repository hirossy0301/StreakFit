import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';
import { useStreakStore } from '@/features/streak/streakStore';
import { colors, radius, spacing } from '@/shared/theme';

// 公式 IFrame プレーヤーで前面再生。DL/バックグラウンド再生はしない(規約準拠)。
export default function PlayerScreen() {
  const { videoId } = useLocalSearchParams<{ videoId: string }>();
  const router = useRouter();
  const [playing, setPlaying] = useState(true);

  const completeToday = useStreakStore((s) => s.completeToday);
  const isCompletedToday = useStreakStore((s) => s.isCompletedToday());

  // 再生が終わったら自動で「達成」扱いにする。手動ボタンでも達成可能。
  const onStateChange = useCallback(
    (state: string) => {
      if (state === 'ended') {
        setPlaying(false);
        completeToday();
      }
    },
    [completeToday],
  );

  function onManualComplete() {
    completeToday();
    router.back();
  }

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
          onPress={onManualComplete}
        >
          <Text style={styles.ctaText}>✓ 完了にする</Text>
        </Pressable>
      )}
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
