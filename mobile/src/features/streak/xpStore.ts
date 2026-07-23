import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

// XP を実際に蓄積するストア。
// 1日の目標(1本目)を達成した後も、追加のトレーニングで XP は貯まり続ける。
// ストリーク(連続日数)は streakStore が別に1日1回だけ管理する。

const XP_FIRST = 10; // その日の1本目(ストリーク加算あり)
const XP_EXTRA = 5; // 2本目以降(上乗せ)

function todayKey(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export type WorkoutResult = {
  isFirstToday: boolean;
  xpGained: number;
  todayCount: number;
  todayXp: number;
  totalXp: number;
};

type XpState = {
  totalXp: number;
  todayDate: string | null;
  todayXp: number;
  todayCount: number;
  /** 今日の本数(その日の完了回数)。日付が変わっていれば 0 を返す。 */
  countToday: () => number;
  /** 今日の獲得 XP。日付が変わっていれば 0 を返す。 */
  xpToday: () => number;
  /** トレーニング完了を記録し、獲得 XP と本数を返す。 */
  recordWorkout: () => WorkoutResult;
};

export const useXpStore = create<XpState>()(
  persist(
    (set, get) => ({
      totalXp: 0,
      todayDate: null,
      todayXp: 0,
      todayCount: 0,

      countToday: () => (get().todayDate === todayKey() ? get().todayCount : 0),
      xpToday: () => (get().todayDate === todayKey() ? get().todayXp : 0),

      recordWorkout: () => {
        const today = todayKey();
        const s = get();
        // 日付が変わっていれば今日の集計をリセット。
        const base =
          s.todayDate === today
            ? { todayXp: s.todayXp, todayCount: s.todayCount }
            : { todayXp: 0, todayCount: 0 };

        const isFirstToday = base.todayCount === 0;
        const xpGained = isFirstToday ? XP_FIRST : XP_EXTRA;
        const todayCount = base.todayCount + 1;
        const todayXp = base.todayXp + xpGained;
        const totalXp = s.totalXp + xpGained;

        set({ totalXp, todayXp, todayCount, todayDate: today });
        return { isFirstToday, xpGained, todayCount, todayXp, totalXp };
      },
    }),
    {
      name: 'streakfit-xp',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
