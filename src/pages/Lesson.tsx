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
      <header style={{ padding: '50px 22px 16px', borderBottom: '1.5px solid #e2e8f0', background: 'white' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
          <button
            onClick={() => navigate('/')}
            style={{
              width: 42, height: 42, borderRadius: 14, border: 'none',
              background: '#f1f5f9', color: '#64748b',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20, cursor: 'pointer', flexShrink: 0,
              fontWeight: 700,
            }}
          >✕</button>
          <div style={{ flex: 1 }}>
            <div style={{ height: 10, background: '#e2e8f0', borderRadius: 999, overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                background: 'linear-gradient(90deg, #3182f6, #818cf8)',
                borderRadius: 999,
                width: `${pct}%`, transition: 'width 0.5s cubic-bezier(0.4,0,0.2,1)',
              }} />
            </div>
          </div>
          <span style={{ fontSize: 15, fontWeight: 800, color: '#334155', flexShrink: 0 }}>
            {currentIndex + 1}<span style={{ color: '#94a3b8', fontWeight: 600 }}>/{lesson.problems.length}</span>
          </span>
        </div>
        <div style={{ fontSize: 14, fontWeight: 800, color: '#2563eb', letterSpacing: 0.1 }}>
          {lesson.title}
        </div>
      </header>

      {/* XP float */}
      {xpFloats.map((f) => (
        <div key={f.id} className="animate-xp-float" style={{
          position: 'fixed', top: 96, right: 20,
          fontSize: 18, fontWeight: 800, color: 'var(--blue)',
          pointerEvents: 'none', zIndex: 50,
        }}>+{f.amount} XP</div>
      ))}

      {/* Main */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '24px 22px 0', overflowY: 'auto', background: '#f8fafc' }}>
        <h2 style={{
          fontSize: 26, fontWeight: 900, color: '#0f172a',
          lineHeight: 1.4, marginBottom: 16, letterSpacing: '-0.5px',
        }}>
          {problem.instruction}
        </h2>

        {/* Context */}
        <div style={{
          background: 'white', borderRadius: 18,
          padding: '16px 20px', marginBottom: 18,
          border: '1.5px solid #e2e8f0',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        }}>
          <p style={{ fontSize: 15, color: '#334155', lineHeight: 1.75, fontWeight: 500 }}>{problem.context}</p>
        </div>

        {/* Hint */}
        {showHint && (
          <div className="hint-box animate-slide-down" style={{ marginBottom: 14 }}>
            <p style={{ fontSize: 14, fontWeight: 800, color: '#2563eb', marginBottom: 10 }}>💡 힌트</p>
            {problem.hints.slice(0, hintIndex).map((h, i) => (
              <p key={i} style={{ fontSize: 15, color: '#1e3a5f', marginBottom: 7, lineHeight: 1.65, fontWeight: 500 }}>• {h}</p>
            ))}
            {hintIndex < problem.hints.length && (
              <button
                onClick={() => setHintIndex((n) => n + 1)}
                style={{ fontSize: 14, fontWeight: 800, color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginTop: 6 }}
              >
                힌트 더 보기 ({hintIndex}/{problem.hints.length}) →
              </button>
            )}
          </div>
        )}

        {/* Example */}
        {showExample && (
          <div className="example-box animate-slide-down" style={{ marginBottom: 14 }}>
            <p style={{ fontSize: 14, fontWeight: 800, color: '#047857', marginBottom: 10 }}>📌 예시 프롬프트</p>
            <p style={{ fontSize: 15, color: '#1e3a2f', lineHeight: 1.75, whiteSpace: 'pre-wrap', fontWeight: 500 }}>{problem.examplePrompt}</p>
          </div>
        )}

        {/* Input area */}
        {stage !== 'feedback' ? (
          <div>
            <textarea
              style={{
                width: '100%', minHeight: 160, padding: '18px 20px',
                borderRadius: 18,
                border: `2px solid ${userInput ? '#3182f6' : '#e2e8f0'}`,
                fontSize: 16, fontFamily: 'inherit', color: '#0f172a',
                lineHeight: 1.75, resize: 'none', outline: 'none',
                transition: 'border-color 0.15s, box-shadow 0.15s',
                background: stage === 'evaluating' ? '#f8fafc' : 'white',
                boxShadow: userInput ? '0 0 0 3px rgba(49,130,246,0.12)' : 'none',
              }}
              placeholder="여기에 AI에게 보낼 프롬프트를 써보세요..."
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              disabled={stage === 'evaluating'}
            />
            <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
              {!showHint && (
                <button
                  onClick={() => { setShowHint(true); setHintIndex(1); }}
                  style={{
                    flex: 1, padding: '14px 0', borderRadius: 16,
                    border: '2px solid #bfdbfe', background: '#eff6ff',
                    fontSize: 15, fontWeight: 700, color: '#2563eb',
                    cursor: 'pointer', fontFamily: 'inherit',
                  }}
                >💡 힌트</button>
              )}
              {!showExample && (
                <button
                  onClick={() => setShowExample(true)}
                  style={{
                    flex: 1, padding: '14px 0', borderRadius: 16,
                    border: '2px solid #a7f3d0', background: '#ecfdf5',
                    fontSize: 15, fontWeight: 700, color: '#047857',
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
                background: feedback.isGoodPrompt
                  ? 'linear-gradient(135deg, #eff6ff, #dbeafe)'
                  : 'linear-gradient(135deg, #fff7ed, #fed7aa)',
                borderRadius: 22, padding: '22px', marginBottom: 14,
                border: `1.5px solid ${feedback.isGoodPrompt ? '#bfdbfe' : '#fdba74'}`,
                boxShadow: feedback.isGoodPrompt
                  ? '0 4px 16px rgba(49,130,246,0.12)'
                  : '0 4px 16px rgba(249,115,22,0.12)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                  <span style={{ fontWeight: 900, fontSize: 20, color: '#0f172a' }}>
                    {feedback.isGoodPrompt ? '🎉 잘 썼어요!' : '💪 조금 더 발전해봐요'}
                  </span>
                  <div style={{
                    background: feedback.score >= 80 ? '#2563eb' : feedback.score >= 60 ? '#ea580c' : '#dc2626',
                    color: 'white', borderRadius: 14, padding: '6px 14px',
                    fontSize: 22, fontWeight: 900, lineHeight: 1,
                  }}>{feedback.score}점</div>
                </div>
                <p style={{ fontSize: 16, color: '#1e293b', marginBottom: 14, lineHeight: 1.7, fontWeight: 500 }}>
                  {feedback.feedback}
                </p>
                {feedback.improvements.length > 0 && (
                  <div style={{ marginBottom: 14 }}>
                    <p style={{ fontSize: 14, fontWeight: 800, color: '#475569', marginBottom: 8 }}>개선 포인트</p>
                    {feedback.improvements.map((imp, i) => (
                      <p key={i} style={{ fontSize: 14, color: '#334155', marginBottom: 6, lineHeight: 1.65, fontWeight: 500 }}>• {imp}</p>
                    ))}
                  </div>
                )}
                <p style={{ fontSize: 15, fontWeight: 800, color: feedback.isGoodPrompt ? '#1d4ed8' : '#c2410c' }}>
                  {feedback.encouragement}
                </p>
              </div>

              {/* My prompt */}
              <div style={{
                background: 'white', borderRadius: 18,
                padding: '18px 20px', border: '1.5px solid #e2e8f0',
              }}>
                <p style={{ fontSize: 13, fontWeight: 800, color: '#94a3b8', marginBottom: 10, letterSpacing: 0.5 }}>내가 쓴 프롬프트</p>
                <p style={{ fontSize: 15, color: '#334155', lineHeight: 1.75, fontWeight: 500 }}>{userInput}</p>
              </div>
            </div>
          )
        )}

        <div style={{ height: 110 }} />
      </main>

      {/* CTA */}
      <div style={{
        padding: '14px 22px 34px', background: 'white',
        borderTop: '1.5px solid #e2e8f0',
        boxShadow: '0 -4px 16px rgba(0,0,0,0.05)',
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
      <div style={{ fontSize: 90, marginBottom: 20 }} className="animate-pop-in">🎊</div>
      <h2 style={{ fontSize: 34, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.8px', marginBottom: 10 }}>
        레슨 완료!
      </h2>
      <p style={{ fontSize: 17, color: '#64748b', marginBottom: 32, fontWeight: 600 }}>{lesson?.title}</p>

      {/* XP */}
      <div style={{
        background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
        borderRadius: 24, padding: '26px', width: '100%', marginBottom: 14,
        border: '1.5px solid #bfdbfe',
        boxShadow: '0 4px 16px rgba(49,130,246,0.12)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 48 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 36, fontWeight: 900, color: '#1d4ed8' }}>+{xpTotal}</div>
            <div style={{ fontSize: 14, color: '#64748b', marginTop: 5, fontWeight: 700 }}>XP 획득</div>
          </div>
          <div style={{ width: 1.5, background: '#bfdbfe' }} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 36, fontWeight: 900, color: '#047857' }}>{lesson?.problems.length}</div>
            <div style={{ fontSize: 14, color: '#64748b', marginTop: 5, fontWeight: 700 }}>문제 완료</div>
          </div>
        </div>
      </div>

      {/* New badges */}
      {earned.length > 0 && (
        <div className="card" style={{ width: '100%', marginBottom: 14 }}>
          <p style={{ fontWeight: 900, fontSize: 19, color: '#0f172a', marginBottom: 18 }}>🏅 새 뱃지 획득!</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 28 }}>
            {earned.map((b) => (
              <div key={b.id} className="animate-pop-in" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 50, marginBottom: 8 }}>{b.emoji}</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#334155' }}>{b.name}</div>
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
