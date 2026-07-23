import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { useStreakStore } from './streakStore';

// XP・宝箱・XPブーストを管理するストア。
// - ストリーク(連続日数)は streakStore が1日1回だけ管理。
// - XP は1本ごとに貯まる(1本目 +10、追加 +5)。ブースト中は倍率がかかる。
// - 一定本数(CHEST_EVERY)ごとに宝箱を獲得。開けるとランダム報酬。

const XP_FIRST = 10; // その日の1本目(ストリーク加算あり)
const XP_EXTRA = 5; // 2本目以降(上乗せ)
export const CHEST_EVERY = 5; // 何本ごとに宝箱が出るか

function now(): number {
  return new Date().getTime();
}

function todayKey(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export type WorkoutResult = {
  isFirstToday: boolean;
  xpGained: number;
  boosted: boolean;
  todayCount: number;
  chestEarned: boolean;
};

export type ChestReward =
  | { kind: 'boost'; multiplier: number; durationSec: number; label: string }
  | { kind: 'bonusXp'; amount: number; label: string }
  | { kind: 'freeze'; amount: number; label: string };

type XpState = {
  totalXp: number;
  totalWorkouts: number;
  openedChests: number;
  todayDate: string | null;
  todayXp: number;
  todayCount: number;
  // XPブースト
  boostMultiplier: number;
  boostExpiresAt: number | null;

  countToday: () => number;
  xpToday: () => number;
  /** 未開封で開けられる宝箱の数 */
  chestsAvailable: () => number;
  /** 次の宝箱まであと何本か */
  workoutsToNextChest: () => number;
  /** 有効なブースト(なければ null) */
  activeBoost: () => { multiplier: number; remainingSec: number } | null;

  recordWorkout: () => WorkoutResult;
  /** 次の宝箱を開けて報酬を適用し、内容を返す。開けられなければ null。 */
  openNextChest: () => ChestReward | null;
  startBoost: (multiplier: number, durationSec: number) => void;
};

function pickReward(): ChestReward {
  // 変動報酬。並びと重みはあとで調整可能。
  const pool: ChestReward[] = [
    { kind: 'boost', multiplier: 5, durationSec: 900, label: '⚡ XP 5倍(15分)' },
    { kind: 'boost', multiplier: 3, durationSec: 1800, label: '⚡ XP 3倍(30分)' },
    { kind: 'bonusXp', amount: 50, label: '✨ ボーナス +50 XP' },
    { kind: 'bonusXp', amount: 20, label: '✨ ボーナス +20 XP' },
    { kind: 'freeze', amount: 1, label: '🧊 ストリークフリーズ +1' },
  ];
  // index はストア側で決めるため、ここでは均等ランダム。
  const i = Math.floor(Math.random() * pool.length);
  return pool[i];
}

export const useXpStore = create<XpState>()(
  persist(
    (set, get) => ({
      totalXp: 0,
      totalWorkouts: 0,
      openedChests: 0,
      todayDate: null,
      todayXp: 0,
      todayCount: 0,
      boostMultiplier: 1,
      boostExpiresAt: null,

      countToday: () => (get().todayDate === todayKey() ? get().todayCount : 0),
      xpToday: () => (get().todayDate === todayKey() ? get().todayXp : 0),

      chestsAvailable: () => {
        const s = get();
        return Math.max(0, Math.floor(s.totalWorkouts / CHEST_EVERY) - s.openedChests);
      },

      workoutsToNextChest: () => {
        const rem = get().totalWorkouts % CHEST_EVERY;
        return rem === 0 ? CHEST_EVERY : CHEST_EVERY - rem;
      },

      activeBoost: () => {
        const s = get();
        if (!s.boostExpiresAt || s.boostExpiresAt <= now()) return null;
        return {
          multiplier: s.boostMultiplier,
          remainingSec: Math.ceil((s.boostExpiresAt - now()) / 1000),
        };
      },

      recordWorkout: () => {
        const today = todayKey();
        const s = get();
        const base =
          s.todayDate === today
            ? { todayXp: s.todayXp, todayCount: s.todayCount }
            : { todayXp: 0, todayCount: 0 };

        const isFirstToday = base.todayCount === 0;
        const baseXp = isFirstToday ? XP_FIRST : XP_EXTRA;

        const boost = get().activeBoost();
        const multiplier = boost ? boost.multiplier : 1;
        const xpGained = baseXp * multiplier;

        const todayCount = base.todayCount + 1;
        const todayXp = base.todayXp + xpGained;
        const totalXp = s.totalXp + xpGained;
        const totalWorkouts = s.totalWorkouts + 1;
        const chestEarned = totalWorkouts % CHEST_EVERY === 0;

        set({ totalXp, todayXp, todayCount, todayDate: today, totalWorkouts });
        return { isFirstToday, xpGained, boosted: multiplier > 1, todayCount, chestEarned };
      },

      openNextChest: () => {
        if (get().chestsAvailable() <= 0) return null;
        const reward = pickReward();
        set({ openedChests: get().openedChests + 1 });

        if (reward.kind === 'boost') {
          get().startBoost(reward.multiplier, reward.durationSec);
        } else if (reward.kind === 'bonusXp') {
          const today = todayKey();
          const s = get();
          const sameDay = s.todayDate === today;
          set({
            totalXp: s.totalXp + reward.amount,
            todayXp: (sameDay ? s.todayXp : 0) + reward.amount,
            todayDate: today,
            todayCount: sameDay ? s.todayCount : 0,
          });
        } else if (reward.kind === 'freeze') {
          useStreakStore.getState().addFreeze(reward.amount);
        }
        return reward;
      },

      startBoost: (multiplier, durationSec) => {
        set({ boostMultiplier: multiplier, boostExpiresAt: now() + durationSec * 1000 });
      },
    }),
    {
      name: 'streakfit-xp',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
