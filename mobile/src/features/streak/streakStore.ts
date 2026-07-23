import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

// MVP はローカルでストリークを管理(オフラインでも動く)。
// 本番ではサーバー権威(Supabase)へ移行し、クライアント時計の改ざんに備える。
// tech-stack.md の「サーバー権威(重要・不正防止)」を参照。

function todayKey(date = new Date()): string {
  // ローカルタイムゾーンの YYYY-MM-DD
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function daysBetween(a: string, b: string): number {
  const da = new Date(a + 'T00:00:00');
  const db = new Date(b + 'T00:00:00');
  return Math.round((db.getTime() - da.getTime()) / 86_400_000);
}

type StreakState = {
  current: number;
  longest: number;
  lastCompletedDate: string | null;
  freezeCount: number;
  /** 今日すでに完了しているか */
  isCompletedToday: () => boolean;
  /** 今日の達成を記録し、ストリークを更新する */
  completeToday: () => void;
  /** 日付跨ぎ時にフリーズを消費してストリークを守る(未達で1日空いた場合) */
  reconcile: () => void;
  /** ストリークフリーズを増やす(宝箱報酬など) */
  addFreeze: (n: number) => void;
};

export const useStreakStore = create<StreakState>()(
  persist(
    (set, get) => ({
      current: 0,
      longest: 0,
      lastCompletedDate: null,
      freezeCount: 2, // 初期付与

      isCompletedToday: () => get().lastCompletedDate === todayKey(),

      completeToday: () => {
        const today = todayKey();
        const { lastCompletedDate, current, longest } = get();
        if (lastCompletedDate === today) return; // 二重加算防止

        const gap = lastCompletedDate ? daysBetween(lastCompletedDate, today) : null;
        // 前回が昨日なら継続、初回 or 連続が途切れていれば 1 から。
        const nextCurrent = gap === 1 ? current + 1 : 1;

        set({
          current: nextCurrent,
          longest: Math.max(longest, nextCurrent),
          lastCompletedDate: today,
        });
      },

      reconcile: () => {
        const { lastCompletedDate, freezeCount, current } = get();
        if (!lastCompletedDate) return;
        const gap = daysBetween(lastCompletedDate, todayKey());
        // ちょうど1日空いた(昨日未達)→ フリーズがあれば消費して維持。
        if (gap === 2 && freezeCount > 0) {
          set({ freezeCount: freezeCount - 1, lastCompletedDate: yesterdayKey() });
        } else if (gap >= 2) {
          // 2日以上空きでフリーズ切れ → 途切れる。
          set({ current: 0 });
        }
        void current;
      },

      addFreeze: (n) => set({ freezeCount: get().freezeCount + n }),
    }),
    {
      name: 'streakfit-streak',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

function yesterdayKey(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return todayKey(d);
}
