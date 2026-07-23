import { Link, useRouter } from 'expo-router';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useVideosStore } from '@/features/videos/videosStore';
import { VideoCard } from '@/shared/components/VideoCard';
import { colors, radius, spacing } from '@/shared/theme';

export default function LibraryScreen() {
  const router = useRouter();
  const videos = useVideosStore((s) => s.videos);

  return (
    <View style={styles.screen}>
      <FlatList
        data={videos}
        keyExtractor={(v) => v.id}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
        ListEmptyComponent={
          <Text style={styles.empty}>
            まだ動画がありません。右下の＋から YouTube 動画を追加しましょう。
          </Text>
        }
        renderItem={({ item }) => (
          <VideoCard
            video={item}
            onPress={() => router.push(`/player/${item.videoId}`)}
          />
        )}
      />

      <Link href="/add" asChild>
        <Pressable style={styles.fab}>
          <Text style={styles.fabText}>＋</Text>
        </Pressable>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  list: { padding: spacing.md, flexGrow: 1 },
  empty: {
    color: colors.textMuted,
    fontSize: 15,
    textAlign: 'center',
    marginTop: spacing.xl,
    lineHeight: 22,
  },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabText: { color: '#fff', fontSize: 28, fontWeight: '700', marginTop: -2 },
});
