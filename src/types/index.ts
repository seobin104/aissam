export type UserType = 'business' | 'student' | 'senior' | 'worker';

export type LessonCategory =
  | 'prompt_writing'
  | 'business_ai'
  | 'work_ai'
  | 'creative_ai'
  | 'ai_tools';

export interface User {
  id: string;
  name: string;
  userType: UserType;
  level: number;
  xp: number;
  xpToNextLevel: number;
  streak: number;
  lastStudiedAt: string | null;
  totalLessonsCompleted: number;
  badges: string[];
  createdAt: string;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  category: LessonCategory;
  userTypes: UserType[];
  level: number;
  xpReward: number;
  estimatedMinutes: number;
  problems: Problem[];
}

export interface Problem {
  id: string;
  type: 'practice';
  instruction: string;
  context: string;
  examplePrompt: string;
  targetKeywords: string[];
  hints: string[];
  xpReward: number;
}

export interface ProblemResult {
  problemId: string;
  userInput: string;
  score: number;
  feedback: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  emoji: string;
}

export const BADGES: Badge[] = [
  { id: 'first_lesson', name: '첫 걸음',     description: '첫 번째 레슨 완료',  emoji: '🌱' },
  { id: 'streak_3',    name: '3일 연속',     description: '3일 연속 학습',       emoji: '🔥' },
  { id: 'streak_7',    name: '일주일 전사',  description: '7일 연속 학습',       emoji: '⚡' },
  { id: 'streak_30',   name: '한 달 챔피언', description: '30일 연속 학습',      emoji: '👑' },
  { id: 'level_10',    name: '초급 졸업',    description: '레벨 10 달성',        emoji: '🎓' },
  { id: 'level_30',    name: '중급자',       description: '레벨 30 달성',        emoji: '🚀' },
  { id: 'level_50',    name: 'AI 마스터',    description: '레벨 50 달성',        emoji: '🏆' },
  { id: 'lessons_10',  name: '10번의 도전',  description: '레슨 10개 완료',      emoji: '💪' },
  { id: 'lessons_30',  name: '꾸준한 학습자',description: '레슨 30개 완료',      emoji: '📚' },
  { id: 'lessons_50',  name: '학습 고수',    description: '레슨 50개 완료',      emoji: '🦁' },
];

export const USER_TYPE_META: Record<UserType, { label: string; emoji: string; desc: string }> = {
  business: { label: '소상공인', emoji: '🏪', desc: '가게 운영·마케팅에 AI를 활용하고 싶어요' },
  worker:   { label: '직장인',   emoji: '💼', desc: '업무 효율을 높이는 데 AI를 쓰고 싶어요' },
  student:  { label: '학생',     emoji: '🎓', desc: '공부·자기계발에 AI를 활용하고 싶어요' },
  senior:   { label: '시니어',   emoji: '🌿', desc: '일상 생활에서 AI를 편하게 쓰고 싶어요' },
};

export const XP_PER_LEVEL = (level: number) => Math.floor(100 * Math.pow(1.15, level - 1));
export const DAILY_FREE_LESSONS = 3;
