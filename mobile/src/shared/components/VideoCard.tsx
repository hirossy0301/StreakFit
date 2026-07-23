import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '@/shared/theme';
import type { SavedVideo } from '@/features/videos/videosStore';

type Props = {
  video: SavedVideo;
  onPress?: () => void;
  large?: boolean;
};

export function VideoCard({ video, onPress, large }: Props) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        large && styles.cardLarge,
        pressed && { opacity: 0.85 },
      ]}
      onPress={onPress}
    >
      {video.thumbnailUrl ? (
        <Image
          source={{ uri: video.thumbnailUrl }}
          style={[styles.thumb, large && styles.thumbLarge]}
        />
      ) : (
        <View style={[styles.thumb, large && styles.thumbLarge, styles.thumbEmpty]} />
      )}
      <View style={styles.meta}>
        <Text style={styles.title} numberOfLines={2}>
          {video.title}
        </Text>
        {video.channelName ? (
          <Text style={styles.channel} numberOfLines={1}>
            {video.channelName}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardLarge: { flexDirection: 'column' },
  thumb: { width: 128, height: 72 },
  thumbLarge: { width: '100%', height: 200 },
  thumbEmpty: { backgroundColor: colors.surfaceAlt },
  meta: { flex: 1, padding: spacing.md, justifyContent: 'center', gap: 4 },
  title: { color: colors.text, fontSize: 15, fontWeight: '600' },
  channel: { color: colors.textMuted, fontSize: 13 },
});
