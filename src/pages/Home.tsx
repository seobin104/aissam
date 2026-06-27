import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../store/userStore';
import { getLessonsByUserType } from '../data/lessons';
import ProgressBar from '../components/ui/ProgressBar';
import { BADGES, DAILY_FREE_LESSONS, USER_TYPE_META } from '../types';
import { isTossApp, showRewardedAd } from '../lib/tossBridge';

const LEVEL_COLORS = ['#3182f6', '#00b493', '#f97316', '#7c3aed', '#e74c3c'];
const LESSON_EMOJIS = ['🤖', '🎭', '📋', '✍️', '💼', '🎨', '🔧', '🌐', '⚡', '🎯'];

const CARD_PALETTES = [
  { iconBg: '#dbeafe', accent: '#2563eb', xpColor: '#1d4ed8' },
  { iconBg: '#d1fae5', accent: '#059669', xpColor: '#047857' },
  { iconBg: '#fed7aa', accent: '#ea580c', xpColor: '#c2410c' },
  { iconBg: '#ede9fe', accent: '#7c3aed', xpColor: '#6d28d9' },
  { iconBg: '#fce7f3', accent: '#db2777', xpColor: '#be185d' },
  { iconBg: '#fef3c7', accent: '#d97706', xpColor: '#92400e' },
];

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
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', background: '#f4f7ff' }}>

      {/* ── Header ─────────────────────────────── */}
      <header style={{
        background: 'linear-gradient(160deg, #e8f0fe 0%, #ffffff 80%)',
        padding: '52px 22px 20px',
        position: 'sticky', top: 0, zIndex: 10,
        borderBottom: '1.5px solid #dce8ff',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 18 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
              <span style={{
                fontSize: 13, fontWeight: 800, color: levelColor,
                background: `${levelColor}20`, padding: '5px 12px',
                borderRadius: 999,
              }}>
                {USER_TYPE_META[user.userType].emoji} {USER_TYPE_META[user.userType].label}
              </span>
              <span style={{
                fontSize: 13, fontWeight: 700,
                color: '#fff', background: levelColor,
                padding: '4px 10px', borderRadius: 999,
              }}>
                Lv.{user.level}
              </span>
            </div>
            <h1 style={{ fontSize: 28, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.7px', lineHeight: 1.2 }}>
              {user.name}님, 안녕하세요 👋
            </h1>
          </div>
          {user.streak > 0 && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 5,
              background: 'linear-gradient(135deg, #fff3eb, #ffe8d2)',
              padding: '10px 16px', borderRadius: 999, flexShrink: 0,
              border: '1.5px solid #fed7aa',
              boxShadow: '0 2px 8px rgba(249,115,22,0.2)',
            }} className="animate-streak">
              <span style={{ fontSize: 20 }}>🔥</span>
              <span style={{ fontSize: 17, fontWeight: 900, color: '#ea580c' }}>{user.streak}</span>
            </div>
          )}
        </div>

        {/* XP bar */}
        <div style={{
          background: 'white', borderRadius: 18, padding: '14px 16px',
          border: '1.5px solid #e0e8ff',
          boxShadow: '0 2px 8px rgba(49,130,246,0.08)',
          display: 'flex', alignItems: 'center', gap: 14,
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: 16,
            background: `linear-gradient(135deg, ${levelColor}dd, ${levelColor})`,
            color: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 17, fontWeight: 900, flexShrink: 0,
            boxShadow: `0 4px 14px ${levelColor}50`,
          }}>{user.level}</div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 14, color: '#64748b', fontWeight: 600 }}>다음 레벨까지</span>
              <span style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>
                {user.xp} <span style={{ color: '#94a3b8', fontWeight: 500 }}>/ {user.xpToNextLevel} XP</span>
              </span>
            </div>
            <ProgressBar current={user.xp} total={user.xpToNextLevel} color={levelColor} />
          </div>
        </div>
      </header>

      {/* ── Content ────────────────────────────── */}
      {activeTab === 'home' ? (
        <main style={{ flex: 1, padding: '18px 18px 110px', overflowY: 'auto' }}>

          {/* Daily progress */}
          <div style={{
            background: 'linear-gradient(135deg, #3182f6, #1c6ee0)',
            borderRadius: 24, padding: '22px', marginBottom: 14,
            boxShadow: '0 6px 20px rgba(49,130,246,0.3)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <span style={{ fontWeight: 800, fontSize: 19, color: 'white' }}>오늘의 학습</span>
              <span style={{
                fontSize: 15, fontWeight: 800,
                background: 'rgba(255,255,255,0.25)',
                color: 'white', padding: '4px 12px', borderRadius: 999,
              }}>
                {dailyLessonsCompleted} / {DAILY_FREE_LESSONS} 완료
              </span>
            </div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
              {Array.from({ length: DAILY_FREE_LESSONS }).map((_, i) => (
                <div key={i} style={{
                  flex: 1, height: 12, borderRadius: 999,
                  background: i < dailyLessonsCompleted
                    ? 'rgba(255,255,255,0.9)'
                    : 'rgba(255,255,255,0.25)',
                  transition: 'background 0.3s',
                  boxShadow: i < dailyLessonsCompleted ? '0 0 8px rgba(255,255,255,0.5)' : 'none',
                }} />
              ))}
            </div>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.9)', lineHeight: 1.5 }}>
              {dailyLessonsCompleted >= DAILY_FREE_LESSONS
                ? '오늘 무료 학습 완료! 🎉 광고를 보면 더 배울 수 있어요.'
                : `오늘 ${DAILY_FREE_LESSONS - dailyLessonsCompleted}개 레슨이 남아있어요!`}
            </p>
          </div>

          {/* Streak */}
          {user.streak > 0 && (
            <div style={{
              background: 'linear-gradient(135deg, #fff3eb 0%, #ffe8d2 100%)',
              borderRadius: 22, padding: '18px 22px', marginBottom: 14,
              border: '1.5px solid #fed7aa',
              display: 'flex', alignItems: 'center', gap: 18,
              boxShadow: '0 4px 14px rgba(249,115,22,0.15)',
            }}>
              <span style={{ fontSize: 44 }}>🔥</span>
              <div>
                <div style={{ fontWeight: 900, fontSize: 19, color: '#1e293b' }}>
                  {user.streak}일 연속 학습 중!
                </div>
                <div style={{ fontSize: 15, color: '#64748b', marginTop: 4, fontWeight: 600 }}>
                  {user.streak >= 7 ? '한 주를 채웠어요! 정말 대단해요 🏆'
                   : user.streak >= 3 ? '3일 달성! 꾸준히 이어가요 ⚡'
                   : '좋은 시작이에요. 내일도 와요! 🌱'}
                </div>
              </div>
            </div>
          )}

          {/* Lessons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, marginTop: 4 }}>
            <h2 style={{ fontSize: 22, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.5px' }}>추천 레슨</h2>
            <span style={{
              fontSize: 13, fontWeight: 700, color: '#3182f6',
              background: '#ebf3ff', padding: '4px 12px', borderRadius: 999,
            }}>{lessons.length}개</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {lessons.map((lesson, index) => {
              const isLocked = lesson.level > user.level + 1;
              const palette = CARD_PALETTES[index % CARD_PALETTES.length];
              return (
                <button
                  key={lesson.id}
                  onClick={() => !isLocked && handleLessonClick(lesson.id)}
                  style={{
                    background: 'var(--white)', borderRadius: 22,
                    padding: '18px 20px',
                    border: `1.5px solid ${isLocked ? '#e2e8f0' : '#e2e8f0'}`,
                    borderLeft: `5px solid ${isLocked ? '#cbd5e1' : palette.accent}`,
                    display: 'flex', alignItems: 'center', gap: 16,
                    cursor: isLocked ? 'not-allowed' : 'pointer',
                    opacity: isLocked ? 0.55 : 1,
                    transition: 'all 0.15s',
                    textAlign: 'left', width: '100%',
                    fontFamily: 'inherit',
                    boxShadow: isLocked ? 'none' : '0 3px 12px rgba(0,0,0,0.07)',
                  }}
                >
                  <div style={{
                    width: 58, height: 58, borderRadius: 18, flexShrink: 0,
                    background: isLocked ? '#f1f5f9' : palette.iconBg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 28,
                  }}>
                    {isLocked ? '🔒' : LESSON_EMOJIS[index % LESSON_EMOJIS.length]}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontWeight: 800, fontSize: 18, color: '#0f172a',
                      marginBottom: 5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {lesson.title}
                    </div>
                    <div style={{
                      fontSize: 14, color: '#475569', marginBottom: 10,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      fontWeight: 500,
                    }}>
                      {lesson.description}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <span style={{
                        fontSize: 13, color: '#64748b', background: '#f1f5f9',
                        padding: '4px 9px', borderRadius: 999, fontWeight: 700,
                      }}>
                        Lv.{lesson.level}
                      </span>
                      <span style={{ fontSize: 13, color: '#94a3b8' }}>·</span>
                      <span style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>{lesson.estimatedMinutes}분</span>
                      <span style={{ fontSize: 13, color: '#94a3b8' }}>·</span>
                      <span style={{
                        fontSize: 13, fontWeight: 800,
                        color: isLocked ? '#94a3b8' : palette.xpColor,
                      }}>+{lesson.xpReward} XP</span>
                    </div>
                  </div>
                  {!isLocked && (
                    <div style={{
                      width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                      background: palette.iconBg,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <span style={{ color: palette.accent, fontSize: 18, fontWeight: 900 }}>›</span>
                    </div>
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
        background: 'white',
        borderTop: '1.5px solid #e2e8f0',
        display: 'flex',
        paddingBottom: 'env(safe-area-inset-bottom)',
        boxShadow: '0 -4px 16px rgba(0,0,0,0.06)',
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
              alignItems: 'center', padding: '13px 0 11px',
              border: 'none', background: 'transparent', cursor: 'pointer',
              color: activeTab === tab.id ? '#2563eb' : '#94a3b8',
              fontFamily: 'inherit', transition: 'color 0.15s',
            }}
          >
            <span style={{ fontSize: 24, marginBottom: 3 }}>{tab.emoji}</span>
            <span style={{ fontSize: 12, fontWeight: activeTab === tab.id ? 800 : 600 }}>{tab.label}</span>
          </button>
        ))}
      </nav>

      {/* ── Ad Modal ───────────────────────────── */}
      {showAdModal && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'flex-end', zIndex: 50 }}
          className="animate-fade-in"
          onClick={() => !adLoading && setShowAdModal(false)}
        >
          <div
            style={{
              background: 'white', width: '100%', maxWidth: 430,
              margin: '0 auto', borderRadius: '28px 28px 0 0',
              padding: '20px 24px 44px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ width: 44, height: 5, background: '#e2e8f0', borderRadius: 999, margin: '0 auto 26px' }} />
            <div style={{ textAlign: 'center', marginBottom: 26 }}>
              <div style={{ fontSize: 56, marginBottom: 16 }}>🎬</div>
              <h3 style={{ fontSize: 22, fontWeight: 900, color: '#0f172a', marginBottom: 10 }}>
                오늘 무료 학습을 모두 했어요!
              </h3>
              <p style={{ fontSize: 16, color: '#64748b', lineHeight: 1.6 }}>
                {isTossApp()
                  ? '광고를 보면 레슨 1개를 더 받을 수 있어요'
                  : '토스 앱에서 이용하면 광고 보고 추가 학습이 가능해요'}
              </p>
              {bonusLessonsToday > 0 && (
                <p style={{ fontSize: 15, color: '#059669', fontWeight: 700, marginTop: 10 }}>
                  오늘 광고로 +{bonusLessonsToday}개 추가했어요 ✓
                </p>
              )}
            </div>
            {isTossApp() ? (
              <button
                className="btn btn-primary"
                style={{ marginBottom: 12, opacity: adLoading ? 0.7 : 1 }}
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
                background: '#eff6ff', borderRadius: 16,
                padding: '16px 18px', marginBottom: 12, textAlign: 'center',
                border: '1.5px solid #bfdbfe',
              }}>
                <p style={{ fontSize: 15, color: '#2563eb', fontWeight: 700, margin: 0 }}>
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
    <div style={{ flex: 1, padding: '18px 18px 110px', overflowY: 'auto' }}>
      {/* Profile card */}
      <div style={{
        background: `linear-gradient(135deg, ${levelColor}18, ${levelColor}08)`,
        borderRadius: 26, padding: '30px 24px', marginBottom: 14,
        border: `1.5px solid ${levelColor}30`,
        textAlign: 'center',
        boxShadow: `0 4px 20px ${levelColor}20`,
      }}>
        <div style={{
          width: 88, height: 88, borderRadius: 28,
          background: `${levelColor}20`, margin: '0 auto 16px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 44, boxShadow: `0 6px 20px ${levelColor}30`,
          border: `2px solid ${levelColor}40`,
        }}>
          {USER_TYPE_META[user.userType].emoji}
        </div>
        <div style={{ fontSize: 24, fontWeight: 900, color: '#0f172a' }}>{user.name}</div>
        <div style={{ fontSize: 15, color: '#475569', marginTop: 6, fontWeight: 600 }}>
          {USER_TYPE_META[user.userType].label} · Lv.{user.level}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 14 }}>
        {[
          { label: '연속 학습', value: `${user.streak}일`, emoji: '🔥', bg: 'linear-gradient(135deg,#fff3eb,#ffe8d2)', border: '#fed7aa', text: '#c2410c' },
          { label: '총 레슨',   value: `${user.totalLessonsCompleted}개`, emoji: '📚', bg: 'linear-gradient(135deg,#eff6ff,#dbeafe)', border: '#bfdbfe', text: '#1d4ed8' },
          { label: '레벨',      value: `${user.level}`,   emoji: '⭐', bg: 'linear-gradient(135deg,#f0fdf4,#d1fae5)', border: '#a7f3d0', text: '#047857' },
        ].map((s) => (
          <div key={s.label} style={{
            background: s.bg, borderRadius: 20, padding: '18px 8px',
            textAlign: 'center', border: `1.5px solid ${s.border}`,
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          }}>
            <div style={{ fontSize: 30, marginBottom: 7 }}>{s.emoji}</div>
            <div style={{ fontWeight: 900, fontSize: 20, color: s.text }}>{s.value}</div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 3, fontWeight: 600 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Badges */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <span style={{ fontWeight: 900, fontSize: 19, color: '#0f172a' }}>획득한 뱃지</span>
          <span style={{
            fontSize: 13, fontWeight: 700, color: '#3182f6',
            background: '#eff6ff', padding: '4px 10px', borderRadius: 999,
          }}>{earnedBadges.length} / {BADGES.length}</span>
        </div>
        {earnedBadges.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '28px 0', color: '#94a3b8', fontSize: 16, fontWeight: 600 }}>
            <div style={{ fontSize: 44, marginBottom: 12 }}>🎖</div>
            첫 레슨을 완료하면 뱃지를 받아요!
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 14 }}>
            {earnedBadges.map((badge) => (
              <div key={badge.id} style={{ textAlign: 'center' }}>
                <div style={{
                  width: 60, height: 60, borderRadius: 20,
                  background: '#f8fafc', border: '1.5px solid #e2e8f0',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 30, margin: '0 auto 7px',
                }}>
                  {badge.emoji}
                </div>
                <div style={{ fontSize: 11, color: '#475569', fontWeight: 700, lineHeight: 1.3 }}>{badge.name}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
