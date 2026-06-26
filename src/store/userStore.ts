import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, UserType } from '../types';
import { XP_PER_LEVEL } from '../types';
import { format, isYesterday, isToday, parseISO } from 'date-fns';

interface UserStore {
  user: User | null;
  isOnboarded: boolean;
  dailyLessonsCompleted: number;
  lastResetDate: string;

  initUser: (name: string, userType: UserType) => void;
  addXP: (amount: number) => { leveledUp: boolean; newLevel: number };
  completeLesson: () => void;
  updateStreak: () => void;
  checkAndResetDaily: () => void;
  earnBadge: (badgeId: string) => void;
  checkBadges: () => string[];
  canStudyFree: () => boolean;
}

const createInitialUser = (name: string, userType: UserType): User => ({
  id: crypto.randomUUID(),
  name,
  userType,
  level: 1,
  xp: 0,
  xpToNextLevel: XP_PER_LEVEL(1),
  streak: 0,
  lastStudiedAt: null,
  totalLessonsCompleted: 0,
  badges: [],
  createdAt: new Date().toISOString(),
});

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      user: null,
      isOnboarded: false,
      dailyLessonsCompleted: 0,
      lastResetDate: format(new Date(), 'yyyy-MM-dd'),

      initUser: (name, userType) => {
        set({
          user: createInitialUser(name, userType),
          isOnboarded: true,
          dailyLessonsCompleted: 0,
          lastResetDate: format(new Date(), 'yyyy-MM-dd'),
        });
      },

      checkAndResetDaily: () => {
        const today = format(new Date(), 'yyyy-MM-dd');
        if (get().lastResetDate !== today) {
          set({ dailyLessonsCompleted: 0, lastResetDate: today });
        }
      },

      canStudyFree: () => {
        get().checkAndResetDaily();
        return get().dailyLessonsCompleted < 3;
      },

      updateStreak: () => {
        const { user } = get();
        if (!user) return;

        const today = format(new Date(), 'yyyy-MM-dd');
        if (user.lastStudiedAt) {
          const lastDate = parseISO(user.lastStudiedAt);
          if (isToday(lastDate)) return;
          if (isYesterday(lastDate)) {
            set((s) => ({ user: s.user ? { ...s.user, streak: s.user.streak + 1, lastStudiedAt: today } : null }));
          } else {
            set((s) => ({ user: s.user ? { ...s.user, streak: 1, lastStudiedAt: today } : null }));
          }
        } else {
          set((s) => ({ user: s.user ? { ...s.user, streak: 1, lastStudiedAt: today } : null }));
        }
      },

      addXP: (amount) => {
        const { user } = get();
        if (!user) return { leveledUp: false, newLevel: 1 };

        let newXP = user.xp + amount;
        let newLevel = user.level;
        let leveledUp = false;

        while (newXP >= XP_PER_LEVEL(newLevel) && newLevel < 100) {
          newXP -= XP_PER_LEVEL(newLevel);
          newLevel++;
          leveledUp = true;
        }

        set((s) => ({
          user: s.user
            ? { ...s.user, xp: newXP, level: newLevel, xpToNextLevel: XP_PER_LEVEL(newLevel) }
            : null,
        }));

        return { leveledUp, newLevel };
      },

      completeLesson: () => {
        set((s) => ({
          user: s.user ? { ...s.user, totalLessonsCompleted: s.user.totalLessonsCompleted + 1 } : null,
          dailyLessonsCompleted: s.dailyLessonsCompleted + 1,
        }));
        get().updateStreak();
      },

      earnBadge: (badgeId) => {
        const { user } = get();
        if (!user || user.badges.includes(badgeId)) return;
        set((s) => ({ user: s.user ? { ...s.user, badges: [...s.user.badges, badgeId] } : null }));
      },

      checkBadges: () => {
        const { user, earnBadge } = get();
        if (!user) return [];
        const newBadges: string[] = [];

        const checks: Array<[string, boolean]> = [
          ['first_lesson', user.totalLessonsCompleted >= 1],
          ['streak_3', user.streak >= 3],
          ['streak_7', user.streak >= 7],
          ['streak_30', user.streak >= 30],
          ['level_10', user.level >= 10],
          ['level_30', user.level >= 30],
          ['level_50', user.level >= 50],
          ['lessons_10', user.totalLessonsCompleted >= 10],
          ['lessons_50', user.totalLessonsCompleted >= 50],
        ];

        checks.forEach(([id, condition]) => {
          if (condition && !user.badges.includes(id)) {
            earnBadge(id);
            newBadges.push(id);
          }
        });

        return newBadges;
      },
    }),
    { name: 'ai-learn-user' }
  )
);
