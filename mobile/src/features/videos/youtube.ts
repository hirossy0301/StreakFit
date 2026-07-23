// YouTube URL から videoId を抽出し、メタデータを取得するヘルパー。
//
// 規約メモ:
// - 動画のダウンロード/オフライン保存/バックグラウンド再生はしない。
// - 再生は公式 IFrame プレーヤー(react-native-youtube-iframe)で前面表示のみ。
// - メタデータは MVP では oEmbed(キー不要)。本番で詳細が要れば Data API の
//   videos.list を Edge Function 経由(APIキーはサーバー保持)で。

export function extractVideoId(url: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();

  // すでに 11 文字の ID っぽいものはそのまま
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;

  const patterns = [
    /[?&]v=([a-zA-Z0-9_-]{11})/, // watch?v=ID
    /youtu\.be\/([a-zA-Z0-9_-]{11})/, // youtu.be/ID
    /\/embed\/([a-zA-Z0-9_-]{11})/, // /embed/ID
    /\/shorts\/([a-zA-Z0-9_-]{11})/, // /shorts/ID
  ];
  for (const re of patterns) {
    const m = trimmed.match(re);
    if (m) return m[1];
  }
  return null;
}

export type YouTubeMeta = {
  videoId: string;
  title: string;
  thumbnailUrl: string | null;
  channelName: string | null;
};

type OEmbedResponse = {
  title?: string;
  author_name?: string;
  thumbnail_url?: string;
};

// oEmbed でタイトル・チャンネル名・サムネを取得(APIキー不要)。
export async function fetchVideoMeta(videoId: string): Promise<YouTubeMeta> {
  const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(
    watchUrl,
  )}&format=json`;

  const fallbackThumb = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

  try {
    const res = await fetch(oembedUrl);
    if (!res.ok) throw new Error(`oEmbed ${res.status}`);
    const data = (await res.json()) as OEmbedResponse;
    return {
      videoId,
      title: data.title ?? 'YouTube 動画',
      thumbnailUrl: data.thumbnail_url ?? fallbackThumb,
      channelName: data.author_name ?? null,
    };
  } catch {
    // 取得に失敗しても保存はできるようフォールバック。
    return {
      videoId,
      title: 'YouTube 動画',
      thumbnailUrl: fallbackThumb,
      channelName: null,
    };
  }
}
