import * as Clipboard from 'expo-clipboard';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useVideosStore } from '@/features/videos/videosStore';
import { extractVideoId, fetchVideoMeta } from '@/features/videos/youtube';
import { colors, radius, spacing } from '@/shared/theme';

export default function AddVideoScreen() {
  const router = useRouter();
  const addVideo = useVideosStore((s) => s.addVideo);
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onPaste() {
    const text = await Clipboard.getStringAsync();
    if (text) {
      setUrl(text.trim());
      setError(null);
    }
  }

  async function onSave() {
    setError(null);
    const videoId = extractVideoId(url);
    if (!videoId) {
      setError('有効な YouTube の URL を貼り付けてください。');
      return;
    }
    setLoading(true);
    try {
      const meta = await fetchVideoMeta(videoId);
      addVideo(meta);
      router.back();
    } catch {
      setError('動画の取得に失敗しました。もう一度お試しください。');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.screen}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>YouTube の URL</Text>
        <Pressable onPress={onPaste} hitSlop={8}>
          <Text style={styles.paste}>📋 貼り付け</Text>
        </Pressable>
      </View>
      <TextInput
        style={styles.input}
        placeholder="https://www.youtube.com/watch?v=..."
        placeholderTextColor={colors.textMuted}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="url"
        value={url}
        onChangeText={setUrl}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable
        style={({ pressed }) => [styles.cta, pressed && { opacity: 0.9 }]}
        onPress={onSave}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.ctaText}>保存する</Text>
        )}
      </Pressable>

      <Text style={styles.note}>
        ※ 動画はダウンロードされません。リンクを保存し、公式プレーヤーで再生します。
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg, padding: spacing.md, gap: spacing.md },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { color: colors.text, fontSize: 15, fontWeight: '600' },
  paste: { color: colors.primary, fontSize: 15, fontWeight: '600' },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 15,
  },
  error: { color: '#FF6B6B', fontSize: 14 },
  cta: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  ctaText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  note: { color: colors.textMuted, fontSize: 13, lineHeight: 20 },
});
