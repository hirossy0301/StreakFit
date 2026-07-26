import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useKeepAwake } from 'expo-keep-awake';
import { useCallback, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';
import { useStreakStore } from '@/features/streak/streakStore';
import { useXpStore, type WorkoutResult } from '@/features/streak/xpStore';
import { CelebrationOverlay } from '@/shared/components/CelebrationOverlay';
import { colors, radius, spacing } from '@/shared/theme';

// マイルストーンかどうか(演出を強める)。
const MILESTONES = new Set([3, 7, 14, 30, 50, 100, 365]);

// 公式 IFrame プレーヤーで前面再生。DL/バックグラウンド再生はしない(規約準拠)。
export default function PlayerScreen() {
  // トレーニング中は画面を消さない(スリープ/ロックで動画が止まるのを防ぐ)。
  useKeepAwake();

  const { videoId } = useLocalSearchParams<{ videoId: string }>();
  const router = useRouter();
  const [playing, setPlaying] = useState(true);
  const [result, setResult] = useState<WorkoutResult | null>(null);
  // この再生で「動画終了」による自動カウントを済ませたか(手動完了との二重防止)。
  const autoCountedRef = useRef(false);

  const completeToday = useStreakStore((s) => s.completeToday);
  const recordWorkout = useXpStore((s) => s.recordWorkout);
  const streak = useStreakStore((s) => s.current);
  const todayCount = useXpStore((s) => s.countToday());
  const toNextChest = useXpStore((s) => s.workoutsToNextChest());

  const runCompletion = useCallback(() => {
    autoCountedRef.current = true;
    const r = recordWorkout();
    if (r.isFirstToday) {
      // その日の1本目 → ストリーク加算 + 強めの祝福。
      completeToday();
      const newStreak = useStreakStore.getState().current;
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      if (MILESTONES.has(newStreak)) {
        setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy), 120);
      }
    } else {
      // 2本目以降 → ストリークは据え置き、XP は上乗せ + 軽い手応え。
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setResult(r);
  }, [completeToday, recordWorkout]);

  const onStateChange = useCallback(
    (state: string) => {
      if (state === 'ended') {
        setPlaying(false);
        // 手動で完了済みなら二重カウントしない。
        if (!autoCountedRef.current) runCompletion();
      }
    },
    [runCompletion],
  );

  const doneToday = useStreakStore.getState().isCompletedToday();

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

      {/* 1日1回のストリークは達成済みでも、追加のトレーニングで XP と宝箱は貯められる。 */}
      <Pressable
        style={({ pressed }) => [styles.cta, pressed && { opacity: 0.9 }]}
        onPress={runCompletion}
      >
        <Text style={styles.ctaText}>
          {doneToday ? '💪 もう1本 完了する(+XP)' : '✓ 完了にする'}
        </Text>
      </Pressable>

      <Text style={styles.note}>
        動画を最後まで見なくても、終わったら「完了」でOK
      </Text>
      <Text style={styles.note}>
        今日 {todayCount} 本 ・ 次の宝箱まであと {toNextChest} 本 🎁
      </Text>

      <Pressable style={styles.homeBtn} onPress={() => router.back()}>
        <Text style={styles.homeText}>ホームに戻る</Text>
      </Pressable>

      <CelebrationOverlay
        visible={result !== null}
        isFirstToday={result?.isFirstToday ?? false}
        streak={streak}
        xpGained={result?.xpGained ?? 0}
        boosted={result?.boosted ?? false}
        chestEarned={result?.chestEarned ?? false}
        todayCount={result?.todayCount ?? 0}
        onDismiss={() => {
          // 閉じてもプレーヤーに留まり、続けて「もう1本」できるようにする。
          setResult(null);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg, padding: spacing.md, gap: spacing.md },
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
  note: { color: colors.textMuted, fontSize: 13, textAlign: 'center' },
  homeBtn: { paddingVertical: spacing.sm, alignItems: 'center' },
  homeText: { color: colors.textMuted, fontSize: 14, fontWeight: '600' },
});
