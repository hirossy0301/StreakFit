import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { YouTubeMeta } from './youtube';

// MVP はローカルにライブラリを保持し、オフライン/バックエンド未設定でも動くようにする。
// 将来は Supabase の videos テーブルへ同期(tech-stack.md 参照)。

export type SavedVideo = {
  id: string; // 端末内 ID
  videoId: string;
  title: string;
  thumbnailUrl: string | null;
  channelName: string | null;
  tags: string[];
  addedAt: string;
};

type VideosState = {
  videos: SavedVideo[];
  addVideo: (meta: YouTubeMeta, tags?: string[]) => void;
  removeVideo: (id: string) => void;
  /** 「今日の1本」を返す(登録順ローテーション)。 */
  pickTodaysVideo: (seed: number) => SavedVideo | null;
};

function makeId(): string {
  return `${Date.now().toString(36)}-${Math.floor(Math.random() * 1e6).toString(36)}`;
}

export const useVideosStore = create<VideosState>()(
  persist(
    (set, get) => ({
      videos: [],

      addVideo: (meta, tags = []) => {
        const { videos } = get();
        if (videos.some((v) => v.videoId === meta.videoId)) return; // 重複防止
        const item: SavedVideo = {
          id: makeId(),
          videoId: meta.videoId,
          title: meta.title,
          thumbnailUrl: meta.thumbnailUrl,
          channelName: meta.channelName,
          tags,
          addedAt: new Date().toISOString(),
        };
        set({ videos: [item, ...videos] });
      },

      removeVideo: (id) => set({ videos: get().videos.filter((v) => v.id !== id) }),

      pickTodaysVideo: (seed) => {
        const { videos } = get();
        if (videos.length === 0) return null;
        return videos[seed % videos.length];
      },
    }),
    {
      name: 'streakfit-videos',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
