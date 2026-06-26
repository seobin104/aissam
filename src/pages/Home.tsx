import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../store/userStore';
import { getLessonsByUserType } from '../data/lessons';
import ProgressBar from '../components/ui/ProgressBar';
import { BADGES, DAILY_FREE_LESSONS, USER_TYPE_META } from '../types';
import { isTossApp, showRewardedAd } from '../lib/tossBridge';

const LEVEL_COLORS = ['#3182f6', '#00b493', '#ff6b00', '#9b59b6', '#e74c3c'];
const LESSON_EMOJIS = ['🤖', '🎭', '📋', '✍️', '💼', '🎨', '🔧', '🌐', '⚡', '🎯'];

function getLevelColor(level: number) {
  return LEVEL_COLORS[Math.floor((level - 1) / 20) % LEVEL_COLORS.length];
}

export default function Home() {
  const navigate = useNavigate();
  const { user, dailyLessonsCompleted, bonusLessonsToday, canStudyFree, checkAndResetDaily, earnBonusLesson } = useUserStore();
  const [activeTab, setActiveTab] = useState<'home' | 'profile'>('home');
  const [showAdModal, setShowAdModal] = useState(false);
  const [adLoading, setAdLoading] = useState(false);

  if (!user) return null;
  checkAndResetDaily();

  const lessons = getLessonsByUserType(user.userType, user.level);
  const earnedBadges = BADGES.filter((b) => user.badges.includes(b.id));
  const levelColor = getLevelColor(user.level);

  const handleLessonClick = (lessonId: string) => {
    if (canStudyFree()) navigate(`/lesson/${lessonId}`);
    else setShowAdModal(true);
  };

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', background: 'var(--gray-50)' }}>

      {/* ── Header ─────────────────────────────── */}
      <header style={{
        background: 'var(--white)', padding: '48px 20px 16px',
        position: 'sticky', top: 0, zIndex: 10,
        borderBottom: '1px solid var(--gray-100)',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <span style={{
                fontSize: 11, fontWeight: 700, color: levelColor,
                background: `${levelColor}18`, padding: '3px 8px',
                borderRadius: 999, letterSpacing: 0.2,
              }}>
                {USER_TYPE_META[user.userType].emoji} {USER_TYPE_META[user.userType].label}
              </span>
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--gray-400)' }}>
                Lv.{user.level}
              </span>
            </div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--gray-900)', letterSpacing: '-0.4px' }}>
              {user.name}님, 안녕하세요 👋
            </h1>
          </div>
          {user.streak > 0 && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 5,
              background: '#fff3eb', padding: '7px 12px',
              borderRadius: 999, flexShrink: 0,
            }} className="animate-streak">
              <span style={{ fontSize: 16 }}>🔥</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--orange)' }}>{user.streak}</span>
            </div>
          )}
        </div>

        {/* XP bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 12,
            background: levelColor, color: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 800, flexShrink: 0,
            boxShadow: `0 4px 12px ${levelColor}40`,
          }}>{user.level}</div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: 'var(--gray-500)' }}>다음 레벨까지</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-900)' }}>
                {user.xp} <span style={{ color: 'var(--gray-400)', fontWeight: 400 }}>/ {user.xpToNextLevel} XP</span>
              </span>
            </div>
            <ProgressBar current={user.xp} total={user.xpToNextLevel} color={levelColor} />
          </div>
        </div>
      </header>

      {/* ── Content ────────────────────────────── */}
      {activeTab === 'home' ? (
        <main style={{ flex: 1, padding: '16px 16px 100px', overflowY: 'auto' }}>

          {/* Daily progress */}
          <div className="card" style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--gray-900)' }}>오늘의 학습</span>
              <span style={{
                fontSize: 12, fontWeight: 600,
                color: dailyLessonsCompleted >= DAILY_FREE_LESSONS ? 'var(--orange)' : 'var(--blue)',
              }}>
                {dailyLessonsCompleted} / {DAILY_FREE_LESSONS} 완료
              </span>
            </div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
              {Array.from({ length: DAILY_FREE_LESSONS }).map((_, i) => (
                <div key={i} style={{
                  flex: 1, height: 8, borderRadius: 999,
                  background: i < dailyLessonsCompleted ? 'var(--blue)' : 'var(--gray-100)',
                  transition: 'background 0.3s',
                }} />
              ))}
            </div>
            <p style={{ fontSize: 13, color: 'var(--gray-500)' }}>
              {dailyLessonsCompleted >= DAILY_FREE_LESSONS
                ? '오늘 무료 학습 완료! 🎉 광고를 보면 더 배울 수 있어요.'
                : `오늘 ${DAILY_FREE_LESSONS - dailyLessonsCompleted}개 레슨이 남아있어요!`}
            </p>
          </div>

          {/* Streak */}
          {user.streak > 0 && (
            <div style={{
              background: 'linear-gradient(135deg, #fff3eb 0%, #fff8f2 100%)',
              borderRadius: 20, padding: '14px 18px', marginBottom: 12,
              border: '1px solid #ffe0cc',
              display: 'flex', alignItems: 'center', gap: 14,
            }}>
              <span style={{ fontSize: 36 }}>🔥</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--gray-900)' }}>
                  {user.streak}일 연속 학습 중!
                </div>
                <div style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: 2 }}>
                  {user.streak >= 7 ? '한 주를 채웠어요! 정말 대단해요 🏆'
                   : user.streak >= 3 ? '3일 달성! 꾸준히 이어가요 ⚡'
                   : '좋은 시작이에요. 내일도 와요! 🌱'}
                </div>
              </div>
            </div>
          )}

          {/* Lessons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, marginTop: 4 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--gray-900)' }}>추천 레슨</h2>
            <span style={{ fontSize: 12, color: 'var(--gray-400)' }}>{lessons.length}개</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {lessons.map((lesson, index) => {
              const isLocked = lesson.level > user.level + 1;
              return (
                <button
                  key={lesson.id}
                  onClick={() => !isLocked && handleLessonClick(lesson.id)}
                  style={{
                    background: 'var(--white)', borderRadius: 18,
                    padding: '14px 16px',
                    border: `1px solid ${isLocked ? 'var(--gray-100)' : 'var(--gray-200)'}`,
                    display: 'flex', alignItems: 'center', gap: 14,
                    cursor: isLocked ? 'not-allowed' : 'pointer',
                    opacity: isLocked ? 0.5 : 1,
                    transition: 'all 0.15s',
                    textAlign: 'left', width: '100%',
                    fontFamily: 'inherit',
                    boxShadow: isLocked ? 'none' : 'var(--shadow-sm)',
                  }}
                >
                  <div style={{
                    width: 48, height: 48, borderRadius: 16, flexShrink: 0,
                    background: isLocked ? 'var(--gray-100)' : 'var(--blue-light)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 22,
                  }}>
                    {isLocked ? '🔒' : LESSON_EMOJIS[index % LESSON_EMOJIS.length]}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--gray-900)', marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {lesson.title}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--gray-500)', marginBottom: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {lesson.description}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 11, color: 'var(--gray-400)', background: 'var(--gray-100)', padding: '2px 7px', borderRadius: 999, fontWeight: 600 }}>
                        Lv.{lesson.level}
                      </span>
                      <span style={{ fontSize: 11, color: 'var(--gray-400)' }}>·</span>
                      <span style={{ fontSize: 11, color: 'var(--gray-400)' }}>{lesson.estimatedMinutes}분</span>
                      <span style={{ fontSize: 11, color: 'var(--gray-400)' }}>·</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--blue)' }}>+{lesson.xpReward} XP</span>
                    </div>
                  </div>
                  {!isLocked && (
                    <span style={{ color: 'var(--gray-300)', fontSize: 18, flexShrink: 0 }}>›</span>
                  )}
                </button>
              );
            })}
          </div>
        </main>
      ) : (
        <ProfileTab user={user} earnedBadges={earnedBadges} levelColor={levelColor} />
      )}

      {/* ── Bottom Nav ─────────────────────────── */}
      <nav style={{
        position: 'fixed', bottom: 0,
        left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: 430,
        background: 'var(--white)',
        borderTop: '1px solid var(--gray-100)',
        display: 'flex',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}>
        {[
          { id: 'home',    emoji: '🏠', label: '홈' },
          { id: 'profile', emoji: '👤', label: '내 정보' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as 'home' | 'profile')}
            style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', padding: '10px 0 8px',
              border: 'none', background: 'transparent', cursor: 'pointer',
              color: activeTab === tab.id ? 'var(--blue)' : 'var(--gray-400)',
              fontFamily: 'inherit', transition: 'color 0.15s',
            }}
          >
            <span style={{ fontSize: 20, marginBottom: 2 }}>{tab.emoji}</span>
            <span style={{ fontSize: 11, fontWeight: activeTab === tab.id ? 700 : 500 }}>{tab.label}</span>
          </button>
        ))}
      </nav>

      {/* ── Ad Modal ───────────────────────────── */}
      {showAdModal && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-end', zIndex: 50 }}
          className="animate-fade-in"
          onClick={() => !adLoading && setShowAdModal(false)}
        >
          <div
            style={{
              background: 'var(--white)', width: '100%', maxWidth: 430,
              margin: '0 auto', borderRadius: '28px 28px 0 0',
              padding: '20px 20px 40px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ width: 40, height: 4, background: 'var(--gray-200)', borderRadius: 999, margin: '0 auto 24px' }} />
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🎬</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--gray-900)', marginBottom: 6 }}>
                오늘 무료 학습을 모두 했어요!
              </h3>
              <p style={{ fontSize: 14, color: 'var(--gray-500)' }}>
                {isTossApp()
                  ? '광고를 보면 레슨 1개를 더 받을 수 있어요'
                  : '토스 앱에서 이용하면 광고 보고 추가 학습이 가능해요'}
              </p>
              {bonusLessonsToday > 0 && (
                <p style={{ fontSize: 13, color: 'var(--green)', fontWeight: 600, marginTop: 8 }}>
                  오늘 광고로 +{bonusLessonsToday}개 추가했어요 ✓
                </p>
              )}
            </div>
            {isTossApp() ? (
              <button
                className="btn btn-primary"
                style={{ marginBottom: 10, opacity: adLoading ? 0.7 : 1 }}
                disabled={adLoading}
                onClick={async () => {
                  setAdLoading(true);
                  const rewarded = await showRewardedAd('aissam_lesson_reward');
                  setAdLoading(false);
                  if (rewarded) {
                    earnBonusLesson();
                    setShowAdModal(false);
                  }
                }}
              >
                {adLoading ? '광고 로딩 중...' : '광고 보고 +1 레슨 받기'}
              </button>
            ) : (
              <div style={{
                background: 'var(--blue-light)', borderRadius: 16,
                padding: '14px 16px', marginBottom: 10, textAlign: 'center',
              }}>
                <p style={{ fontSize: 13, color: 'var(--blue)', fontWeight: 600, margin: 0 }}>
                  📱 토스 앱 → 앱인토스에서 이용하세요
                </p>
              </div>
            )}
            <button className="btn btn-secondary" onClick={() => setShowAdModal(false)}>
              내일 다시 오기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

import type { User } from '../types';

function ProfileTab({ user, earnedBadges, levelColor }: { user: User; earnedBadges: typeof BADGES; levelColor: string }) {
  return (
    <div style={{ flex: 1, padding: '16px 16px 100px', overflowY: 'auto' }}>
      {/* Profile card */}
      <div className="card" style={{ textAlign: 'center', marginBottom: 12, padding: '24px 20px' }}>
        <div style={{
          width: 72, height: 72, borderRadius: 22,
          background: `${levelColor}18`, margin: '0 auto 12px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 34,
        }}>
          {USER_TYPE_META[user.userType].emoji}
        </div>
        <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--gray-900)' }}>{user.name}</div>
        <div style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: 4 }}>
          {USER_TYPE_META[user.userType].label} · Lv.{user.level}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 12 }}>
        {[
          { label: '연속 학습', value: `${user.streak}일`, emoji: '🔥', color: '#fff3eb' },
          { label: '총 레슨',   value: `${user.totalLessonsCompleted}개`, emoji: '📚', color: 'var(--blue-light)' },
          { label: '레벨',      value: `${user.level}`,   emoji: '⭐', color: '#f0fdf4' },
        ].map((s) => (
          <div key={s.label} className="card" style={{ textAlign: 'center', padding: '14px 8px', background: s.color, border: 'none' }}>
            <div style={{ fontSize: 24, marginBottom: 4 }}>{s.emoji}</div>
            <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--gray-900)' }}>{s.value}</div>
            <div style={{ fontSize: 11, color: 'var(--gray-500)', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Badges */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--gray-900)' }}>획득한 뱃지</span>
          <span style={{ fontSize: 12, color: 'var(--gray-400)' }}>{earnedBadges.length} / {BADGES.length}</span>
        </div>
        {earnedBadges.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--gray-400)', fontSize: 14 }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>🎖</div>
            첫 레슨을 완료하면 뱃지를 받아요!
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12 }}>
            {earnedBadges.map((badge) => (
              <div key={badge.id} style={{ textAlign: 'center' }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 16,
                  background: 'var(--gray-50)', border: '1px solid var(--gray-200)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 26, margin: '0 auto 4px',
                }}>
                  {badge.emoji}
                </div>
                <div style={{ fontSize: 10, color: 'var(--gray-600)', fontWeight: 600, lineHeight: 1.3 }}>{badge.name}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
