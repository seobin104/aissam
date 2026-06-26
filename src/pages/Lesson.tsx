import { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getLessonById } from '../data/lessons';
import { useUserStore } from '../store/userStore';
import { evaluatePrompt } from '../lib/ai';
import type { AIFeedback } from '../lib/ai';
import type { Problem } from '../types';
import { BADGES } from '../types';

type Stage = 'problem' | 'evaluating' | 'feedback' | 'complete';

export default function Lesson() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const lesson = getLessonById(id!);
  const { addXP, completeLesson, checkBadges } = useUserStore();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [stage, setStage] = useState<Stage>('problem');
  const [userInput, setUserInput] = useState('');
  const [feedback, setFeedback] = useState<AIFeedback | null>(null);
  const [hintIndex, setHintIndex] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [showExample, setShowExample] = useState(false);
  const [totalXP, setTotalXP] = useState(0);
  const [newBadges, setNewBadges] = useState<string[]>([]);
  const [xpFloats, setXpFloats] = useState<Array<{ id: number; amount: number }>>([]);
  const floatId = useRef(0);

  if (!lesson) {
    return <div style={{ padding: 40, textAlign: 'center', color: 'var(--gray-500)' }}>레슨을 찾을 수 없어요.</div>;
  }

  const problem: Problem = lesson.problems[currentIndex];
  const isLast = currentIndex === lesson.problems.length - 1;
  const pct = Math.min(((currentIndex + (stage === 'feedback' ? 1 : 0)) / lesson.problems.length) * 100, 100);

  const handleSubmit = async () => {
    if (!userInput.trim() || stage === 'evaluating') return;
    setStage('evaluating');
    const result = await evaluatePrompt(userInput, problem.targetKeywords, problem.context);
    setFeedback(result);
    setStage('feedback');
    const earned = Math.floor(problem.xpReward * (result.score / 100));
    setTotalXP((p) => p + earned);
    const fid = floatId.current++;
    setXpFloats((p) => [...p, { id: fid, amount: earned }]);
    setTimeout(() => setXpFloats((p) => p.filter((f) => f.id !== fid)), 1100);
  };

  const handleNext = () => {
    if (isLast) {
      addXP(totalXP + lesson.xpReward);
      completeLesson();
      setNewBadges(checkBadges());
      setStage('complete');
    } else {
      setCurrentIndex((i) => i + 1);
      setUserInput('');
      setFeedback(null);
      setHintIndex(0);
      setShowHint(false);
      setShowExample(false);
      setStage('problem');
    }
  };

  if (stage === 'complete') {
    return (
      <CompletionScreen
        lesson={lesson}
        totalXP={totalXP}
        newBadges={newBadges}
        onHome={() => navigate('/')}
      />
    );
  }

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', background: 'var(--white)' }}>

      {/* Top bar */}
      <header style={{ padding: '48px 20px 12px', borderBottom: '1px solid var(--gray-100)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <button
            onClick={() => navigate('/')}
            style={{
              width: 34, height: 34, borderRadius: 10, border: 'none',
              background: 'var(--gray-100)', color: 'var(--gray-500)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, cursor: 'pointer', flexShrink: 0,
            }}
          >✕</button>
          <div style={{ flex: 1 }}>
            <div style={{
              height: 6, background: 'var(--gray-100)', borderRadius: 999, overflow: 'hidden',
            }}>
              <div style={{
                height: '100%', background: 'var(--blue)', borderRadius: 999,
                width: `${pct}%`, transition: 'width 0.5s cubic-bezier(0.4,0,0.2,1)',
              }} />
            </div>
          </div>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-500)', flexShrink: 0 }}>
            {currentIndex + 1}<span style={{ color: 'var(--gray-300)' }}>/{lesson.problems.length}</span>
          </span>
        </div>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--blue)', letterSpacing: 0.2 }}>
          {lesson.title}
        </div>
      </header>

      {/* XP float */}
      {xpFloats.map((f) => (
        <div key={f.id} className="animate-xp-float" style={{
          position: 'fixed', top: 96, right: 20,
          fontSize: 16, fontWeight: 800, color: 'var(--blue)',
          pointerEvents: 'none', zIndex: 50,
        }}>+{f.amount} XP</div>
      ))}

      {/* Main */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '20px 20px 0', overflowY: 'auto' }}>
        <h2 style={{
          fontSize: 19, fontWeight: 700, color: 'var(--gray-900)',
          lineHeight: 1.4, marginBottom: 12, letterSpacing: '-0.3px',
        }}>
          {problem.instruction}
        </h2>

        {/* Context */}
        <div style={{
          background: 'var(--gray-50)', borderRadius: 16,
          padding: '12px 16px', marginBottom: 16,
          border: '1px solid var(--gray-200)',
        }}>
          <p style={{ fontSize: 13, color: 'var(--gray-600)', lineHeight: 1.65 }}>{problem.context}</p>
        </div>

        {/* Hint */}
        {showHint && (
          <div className="hint-box animate-slide-down" style={{ marginBottom: 12 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--blue)', marginBottom: 8 }}>💡 힌트</p>
            {problem.hints.slice(0, hintIndex).map((h, i) => (
              <p key={i} style={{ fontSize: 13, color: 'var(--gray-700)', marginBottom: 4 }}>• {h}</p>
            ))}
            {hintIndex < problem.hints.length && (
              <button
                onClick={() => setHintIndex((n) => n + 1)}
                style={{ fontSize: 12, fontWeight: 700, color: 'var(--blue)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginTop: 4 }}
              >
                힌트 더 보기 ({hintIndex}/{problem.hints.length}) →
              </button>
            )}
          </div>
        )}

        {/* Example */}
        {showExample && (
          <div className="example-box animate-slide-down" style={{ marginBottom: 12 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--green)', marginBottom: 8 }}>📌 예시 프롬프트</p>
            <p style={{ fontSize: 13, color: 'var(--gray-700)', lineHeight: 1.65, whiteSpace: 'pre-wrap' }}>{problem.examplePrompt}</p>
          </div>
        )}

        {/* Input area */}
        {stage !== 'feedback' ? (
          <div>
            <textarea
              style={{
                width: '100%', minHeight: 140, padding: '14px 16px',
                borderRadius: 16,
                border: `2px solid ${userInput ? 'var(--blue)' : 'var(--gray-200)'}`,
                fontSize: 14, fontFamily: 'inherit', color: 'var(--gray-900)',
                lineHeight: 1.65, resize: 'none', outline: 'none',
                transition: 'border-color 0.15s',
                background: stage === 'evaluating' ? 'var(--gray-50)' : 'white',
              }}
              placeholder="여기에 AI에게 보낼 프롬프트를 써보세요..."
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              disabled={stage === 'evaluating'}
            />
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              {!showHint && (
                <button
                  onClick={() => { setShowHint(true); setHintIndex(1); }}
                  style={{
                    flex: 1, padding: '11px 0', borderRadius: 12,
                    border: '1.5px solid var(--gray-200)', background: 'var(--white)',
                    fontSize: 13, fontWeight: 600, color: 'var(--gray-600)',
                    cursor: 'pointer', fontFamily: 'inherit',
                  }}
                >💡 힌트</button>
              )}
              {!showExample && (
                <button
                  onClick={() => setShowExample(true)}
                  style={{
                    flex: 1, padding: '11px 0', borderRadius: 12,
                    border: '1.5px solid var(--gray-200)', background: 'var(--white)',
                    fontSize: 13, fontWeight: 600, color: 'var(--gray-600)',
                    cursor: 'pointer', fontFamily: 'inherit',
                  }}
                >📌 예시 보기</button>
              )}
            </div>
          </div>
        ) : (
          feedback && (
            <div className="animate-pop-in">
              {/* Score */}
              <div style={{
                background: feedback.isGoodPrompt ? 'var(--blue-light)' : 'var(--orange-light)',
                borderRadius: 20, padding: '18px 20px', marginBottom: 12,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--gray-900)' }}>
                    {feedback.isGoodPrompt ? '🎉 잘 썼어요!' : '💪 조금 더 발전해봐요'}
                  </span>
                  <span style={{
                    fontSize: 26, fontWeight: 800,
                    color: feedback.score >= 80 ? 'var(--blue)' : feedback.score >= 60 ? 'var(--orange)' : 'var(--red)',
                  }}>{feedback.score}점</span>
                </div>
                <p style={{ fontSize: 14, color: 'var(--gray-700)', marginBottom: 10, lineHeight: 1.6 }}>
                  {feedback.feedback}
                </p>
                {feedback.improvements.length > 0 && (
                  <div style={{ marginBottom: 10 }}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-500)', marginBottom: 6 }}>개선 포인트</p>
                    {feedback.improvements.map((imp, i) => (
                      <p key={i} style={{ fontSize: 12, color: 'var(--gray-600)', marginBottom: 3 }}>• {imp}</p>
                    ))}
                  </div>
                )}
                <p style={{ fontSize: 13, fontWeight: 700, color: feedback.isGoodPrompt ? 'var(--blue)' : 'var(--orange)' }}>
                  {feedback.encouragement}
                </p>
              </div>

              {/* My prompt */}
              <div style={{
                background: 'var(--gray-50)', borderRadius: 16,
                padding: '14px 16px', border: '1px solid var(--gray-200)',
              }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-400)', marginBottom: 8 }}>내가 쓴 프롬프트</p>
                <p style={{ fontSize: 13, color: 'var(--gray-700)', lineHeight: 1.65 }}>{userInput}</p>
              </div>
            </div>
          )
        )}

        <div style={{ height: 100 }} />
      </main>

      {/* CTA */}
      <div style={{
        padding: '12px 20px 32px', background: 'var(--white)',
        borderTop: '1px solid var(--gray-100)',
      }}>
        {stage === 'problem' || stage === 'evaluating' ? (
          <button
            className="btn btn-primary"
            disabled={!userInput.trim() || stage === 'evaluating'}
            onClick={handleSubmit}
            style={{ opacity: stage === 'evaluating' ? 0.7 : undefined }}
          >
            {stage === 'evaluating' ? '⏳ 평가 중이에요...' : '제출하기'}
          </button>
        ) : (
          <button className="btn btn-primary" onClick={handleNext}>
            {isLast ? '레슨 완료! 🎉' : '다음 문제 →'}
          </button>
        )}
      </div>
    </div>
  );
}

function CompletionScreen({
  lesson, totalXP, newBadges, onHome,
}: {
  lesson: ReturnType<typeof getLessonById>;
  totalXP: number;
  newBadges: string[];
  onHome: () => void;
}) {
  const earned = BADGES.filter((b) => newBadges.includes(b.id));
  const xpTotal = totalXP + (lesson?.xpReward ?? 0);

  return (
    <div style={{
      minHeight: '100dvh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'var(--white)', padding: '40px 24px', textAlign: 'center',
    }} className="animate-fade-in">
      <div style={{ fontSize: 72, marginBottom: 16 }} className="animate-pop-in">🎊</div>
      <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--gray-900)', letterSpacing: '-0.5px', marginBottom: 6 }}>
        레슨 완료!
      </h2>
      <p style={{ fontSize: 15, color: 'var(--gray-500)', marginBottom: 28 }}>{lesson?.title}</p>

      {/* XP */}
      <div className="card" style={{ width: '100%', marginBottom: 12, padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 40 }}>
          <div>
            <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--blue)' }}>+{xpTotal}</div>
            <div style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 2 }}>XP 획득</div>
          </div>
          <div style={{ width: 1, background: 'var(--gray-100)' }} />
          <div>
            <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--green)' }}>{lesson?.problems.length}</div>
            <div style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 2 }}>문제 완료</div>
          </div>
        </div>
      </div>

      {/* New badges */}
      {earned.length > 0 && (
        <div className="card" style={{ width: '100%', marginBottom: 12 }}>
          <p style={{ fontWeight: 700, fontSize: 15, color: 'var(--gray-900)', marginBottom: 14 }}>🏅 새 뱃지 획득!</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 20 }}>
            {earned.map((b) => (
              <div key={b.id} className="animate-pop-in" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 40, marginBottom: 4 }}>{b.emoji}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-700)' }}>{b.name}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <button className="btn btn-primary" style={{ width: '100%' }} onClick={onHome}>
        홈으로 돌아가기
      </button>
    </div>
  );
}
