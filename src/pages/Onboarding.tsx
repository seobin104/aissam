import { useState } from 'react';
import { useUserStore } from '../store/userStore';
import { USER_TYPE_META } from '../types';
import type { UserType } from '../types';

const USER_TYPES = Object.entries(USER_TYPE_META) as [UserType, typeof USER_TYPE_META[UserType]][];

export default function Onboarding() {
  const [step, setStep] = useState<'welcome' | 'type' | 'name'>('welcome');
  const [selectedType, setSelectedType] = useState<UserType | null>(null);
  const [name, setName] = useState('');
  const { initUser } = useUserStore();

  const handleStart = () => {
    if (!selectedType || !name.trim()) return;
    initUser(name.trim(), selectedType);
  };

  return (
    <div className="min-h-dvh flex flex-col bg-white">
      {step === 'welcome' && (
        <div className="flex flex-col items-center justify-center flex-1 px-6 text-center animate-fade-in">
          <div style={{
            width: 88, height: 88,
            background: 'linear-gradient(135deg, #e8f3ff 0%, #cde4ff 100%)',
            borderRadius: 28,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 44, marginBottom: 28,
            boxShadow: '0 8px 24px rgba(49,130,246,0.15)',
          }}>🤖</div>

          <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--gray-900)', lineHeight: 1.3, marginBottom: 12, letterSpacing: '-0.5px' }}>
            AI 배우기,<br />오늘부터 10분씩
          </h1>
          <p style={{ fontSize: 15, color: 'var(--gray-500)', lineHeight: 1.6, marginBottom: 6 }}>
            두오링고처럼 매일 조금씩,<br />누구나 쉽게 AI를 배울 수 있어요.
          </p>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--blue)', marginBottom: 36 }}>
            하루 5문제 · 10분 · 무료
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, width: '100%', marginBottom: 36 }}>
            {[
              { emoji: '🏪', label: '소상공인', color: '#fff3eb' },
              { emoji: '💼', label: '직장인',   color: '#eef2ff' },
              { emoji: '🎓', label: '학생',     color: '#f0fdf4' },
              { emoji: '🌿', label: '시니어',   color: '#fdf4ff' },
            ].map(({ emoji, label, color }) => (
              <div key={label} style={{
                background: color, borderRadius: 16,
                padding: '14px 10px', textAlign: 'center',
              }}>
                <div style={{ fontSize: 26, marginBottom: 4 }}>{emoji}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-700)' }}>{label}</div>
              </div>
            ))}
          </div>

          <button className="btn btn-primary" onClick={() => setStep('type')}>
            시작하기
          </button>
          <p style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 14 }}>
            무료로 시작 · 회원가입 불필요
          </p>
        </div>
      )}

      {step === 'type' && (
        <div className="flex flex-col flex-1 px-5 pt-14 animate-slide-up">
          <button
            style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gray-500)', fontSize: 20, background: 'var(--gray-100)', borderRadius: 12, border: 'none', cursor: 'pointer', marginBottom: 28 }}
            onClick={() => setStep('welcome')}
          >←</button>

          <div style={{ marginBottom: 28 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--blue)', marginBottom: 6 }}>STEP 1 / 2</p>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--gray-900)', letterSpacing: '-0.4px' }}>어떤 분이신가요?</h2>
            <p style={{ fontSize: 14, color: 'var(--gray-500)', marginTop: 6 }}>맞춤 학습 콘텐츠를 제공해드려요</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
            {USER_TYPES.map(([type, meta]) => (
              <button
                key={type}
                className={`select-card ${selectedType === type ? 'selected' : ''}`}
                onClick={() => setSelectedType(type)}
              >
                <span style={{ fontSize: 28 }}>{meta.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--gray-900)' }}>{meta.label}</div>
                  <div style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: 2 }}>{meta.desc}</div>
                </div>
                {selectedType === type && (
                  <span style={{ fontSize: 18, color: 'var(--blue)' }}>✓</span>
                )}
              </button>
            ))}
          </div>

          <div style={{ paddingTop: 20, paddingBottom: 32 }}>
            <button
              className="btn btn-primary"
              disabled={!selectedType}
              onClick={() => setStep('name')}
            >다음</button>
          </div>
        </div>
      )}

      {step === 'name' && (
        <div className="flex flex-col flex-1 px-5 pt-14 animate-slide-up">
          <button
            style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gray-500)', fontSize: 20, background: 'var(--gray-100)', borderRadius: 12, border: 'none', cursor: 'pointer', marginBottom: 28 }}
            onClick={() => setStep('type')}
          >←</button>

          <div style={{ marginBottom: 28 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--blue)', marginBottom: 6 }}>STEP 2 / 2</p>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--gray-900)', letterSpacing: '-0.4px' }}>이름이 뭐예요?</h2>
            <p style={{ fontSize: 14, color: 'var(--gray-500)', marginTop: 6 }}>닉네임이나 본명, 편하게 써주세요</p>
          </div>

          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="예: 김사장님, 민준이, 박과장..."
            style={{
              width: '100%', padding: '14px 16px',
              borderRadius: 14, border: `2px solid ${name ? 'var(--blue)' : 'var(--gray-200)'}`,
              fontSize: 16, fontFamily: 'inherit', fontWeight: 500,
              color: 'var(--gray-900)', outline: 'none',
              transition: 'border-color 0.15s',
            }}
            maxLength={20}
            autoFocus
          />
          <p style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 6, marginLeft: 4 }}>{name.length}/20</p>

          {selectedType && (
            <div style={{
              marginTop: 20, padding: '16px 18px',
              background: 'var(--gray-50)', borderRadius: 16,
              border: '1px solid var(--gray-200)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 24 }}>{USER_TYPE_META[selectedType].emoji}</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--gray-900)' }}>
                    {USER_TYPE_META[selectedType].label} 맞춤 학습
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: 2 }}>
                    매일 5문제 · 10분 · 레벨 1~100
                  </div>
                </div>
              </div>
            </div>
          )}

          <div style={{ marginTop: 'auto', paddingTop: 20, paddingBottom: 32 }}>
            <button
              className="btn btn-primary"
              disabled={!name.trim()}
              onClick={handleStart}
            >
              {name.trim() ? `${name.trim()}님의 AI 학습 시작! 🚀` : 'AI 학습 시작하기'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
