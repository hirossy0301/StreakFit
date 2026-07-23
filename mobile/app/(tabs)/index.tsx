import { Link, useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStreakStore } from '@/features/streak/streakStore';
import { useXpStore } from '@/features/streak/xpStore';
import { useVideosStore } from '@/features/videos/videosStore';
import { VideoCard } from '@/shared/components/VideoCard';
import { StreakBadge } from '@/shared/components/StreakBadge';
import { colors, radius, spacing } from '@/shared/theme';

// 「今日の1本」は登録順ローテーション。日付をシードにして毎日変える。
function daySeed(): number {
  const d = new Date();
  return d.getFullYear() * 1000 + Math.floor(
    (d.getTime() - new Date(d.getFullYear(), 0, 0).getTime()) / 86_400_000,
  );
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const current = useStreakStore((s) => s.current);
  const isCompletedToday = useStreakStore((s) => s.isCompletedToday());

  const pickTodaysVideo = useVideosStore((s) => s.pickTodaysVideo);
  const videoCount = useVideosStore((s) => s.videos.length);
  const todaysVideo = pickTodaysVideo(daySeed());

  const totalXp = useXpStore((s) => s.totalXp);
  const todayCount = useXpStore((s) => s.countToday());
  const todayXp = useXpStore((s) => s.xpToday());

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.md }]}
    >
      <StreakBadge current={current} completedToday={isCompletedToday} />

      <View style={styles.statRow}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{todayCount}</Text>
          <Text style={styles.statLabel}>今日の本数</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>+{todayXp}</Text>
          <Text style={styles.statLabel}>今日の XP</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{totalXp}</Text>
          <Text style={styles.statLabel}>累計 XP</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>今日の1本</Text>

      {todaysVideo ? (
        <>
          <VideoCard
            video={todaysVideo}
            large
            onPress={() => router.push(`/player/${todaysVideo.videoId}`)}
          />
          <Pressable
            style={({ pressed }) => [styles.cta, pressed && { opacity: 0.9 }]}
            onPress={() => router.push(`/player/${todaysVideo.videoId}`)}
          >
            <Text style={styles.ctaText}>
              {isCompletedToday ? 'もう一度再生する' : '▶ 再生して今日を達成する'}
            </Text>
          </Pressable>
        </>
      ) : (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>
            {videoCount === 0
              ? 'まだ動画がありません。YouTube のトレーニング動画を追加しましょう。'
              : '今日の動画を準備中…'}
          </Text>
          <Link href="/add" asChild>
            <Pressable style={styles.cta}>
              <Text style={styles.ctaText}>＋ 動画を追加</Text>
            </Pressable>
          </Link>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.md, gap: spacing.lg, paddingBottom: spacing.xl },
  statRow: { flexDirection: 'row', gap: spacing.sm },
  stat: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  statValue: { color: colors.text, fontSize: 22, fontWeight: '800' },
  statLabel: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  sectionTitle: { color: colors.text, fontSize: 20, fontWeight: '700' },
  cta: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  ctaText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  empty: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyText: { color: colors.textMuted, fontSize: 15, lineHeight: 22 },
});
