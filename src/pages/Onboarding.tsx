import { useState } from 'react';
import { useUserStore } from '../store/userStore';
import { USER_TYPE_META } from '../types';
import type { UserType } from '../types';

const USER_TYPES = Object.entries(USER_TYPE_META) as [UserType, typeof USER_TYPE_META[UserType]][];

const TYPE_COLORS: Record<string, { bg: string; border: string; accent: string }> = {
  business: { bg: 'linear-gradient(135deg,#fff3eb,#ffe8d2)', border: '#fed7aa', accent: '#ea580c' },
  worker:   { bg: 'linear-gradient(135deg,#eff6ff,#dbeafe)', border: '#bfdbfe', accent: '#2563eb' },
  student:  { bg: 'linear-gradient(135deg,#f0fdf4,#d1fae5)', border: '#a7f3d0', accent: '#047857' },
  senior:   { bg: 'linear-gradient(135deg,#fdf4ff,#ede9fe)', border: '#d8b4fe', accent: '#7c3aed' },
};

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
        <div className="flex flex-col items-center justify-center flex-1 px-6 text-center animate-fade-in" style={{ background: 'linear-gradient(180deg,#eef4ff 0%,#ffffff 60%)' }}>
          <div style={{
            width: 112, height: 112,
            background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
            borderRadius: 36,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 58, marginBottom: 32,
            boxShadow: '0 12px 36px rgba(49,130,246,0.25)',
            border: '2px solid #93c5fd',
          }}>🤖</div>

          <h1 style={{ fontSize: 44, fontWeight: 900, color: '#0f172a', lineHeight: 1.1, marginBottom: 16, letterSpacing: '-1.5px' }}>
            AI쌤
          </h1>
          <p style={{ fontSize: 18, color: '#475569', lineHeight: 1.7, marginBottom: 10, fontWeight: 500 }}>
            소상공인·직장인·학생·시니어 모두를 위한<br />하루 10분 AI 학습 앱
          </p>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'linear-gradient(135deg, #3182f6, #1c6ee0)',
            color: 'white', padding: '8px 20px', borderRadius: 999,
            fontSize: 15, fontWeight: 800, marginBottom: 36,
            boxShadow: '0 4px 14px rgba(49,130,246,0.35)',
          }}>
            ✨ 하루 5문제 · 10분 · 무료
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, width: '100%', marginBottom: 36 }}>
            {[
              { emoji: '🏪', label: '소상공인', bg: 'linear-gradient(135deg,#fff3eb,#ffe8d2)', border: '#fed7aa' },
              { emoji: '💼', label: '직장인',   bg: 'linear-gradient(135deg,#eff6ff,#dbeafe)', border: '#bfdbfe' },
              { emoji: '🎓', label: '학생',     bg: 'linear-gradient(135deg,#f0fdf4,#d1fae5)', border: '#a7f3d0' },
              { emoji: '🌿', label: '시니어',   bg: 'linear-gradient(135deg,#fdf4ff,#ede9fe)', border: '#d8b4fe' },
            ].map(({ emoji, label, bg, border }) => (
              <div key={label} style={{
                background: bg, borderRadius: 22,
                padding: '22px 12px', textAlign: 'center',
                border: `1.5px solid ${border}`,
                boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
              }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>{emoji}</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#1e293b' }}>{label}</div>
              </div>
            ))}
          </div>

          <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => setStep('type')}>
            시작하기
          </button>
          <p style={{ fontSize: 14, color: '#94a3b8', marginTop: 14, fontWeight: 600 }}>
            무료로 시작 · 회원가입 불필요
          </p>
        </div>
      )}

      {step === 'type' && (
        <div className="flex flex-col flex-1 px-5 animate-slide-up" style={{ paddingTop: 56 }}>
          <button
            style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: 20, background: '#f1f5f9', borderRadius: 14, border: 'none', cursor: 'pointer', marginBottom: 30, fontWeight: 700 }}
            onClick={() => setStep('welcome')}
          >←</button>

          <div style={{ marginBottom: 30 }}>
            <div style={{ display: 'inline-block', background: 'linear-gradient(135deg,#3182f6,#1c6ee0)', color: 'white', padding: '5px 14px', borderRadius: 999, fontSize: 14, fontWeight: 800, marginBottom: 12 }}>STEP 1 / 2</div>
            <h2 style={{ fontSize: 30, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.7px', lineHeight: 1.2 }}>어떤 분이신가요?</h2>
            <p style={{ fontSize: 16, color: '#64748b', marginTop: 10, fontWeight: 500 }}>맞춤 학습 콘텐츠를 제공해드려요</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
            {USER_TYPES.map(([type, meta]) => {
              const colors = TYPE_COLORS[type] ?? TYPE_COLORS.office_worker;
              const isSelected = selectedType === type;
              return (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 18,
                    padding: '20px 22px', borderRadius: 22,
                    border: `2px solid ${isSelected ? colors.accent : '#e2e8f0'}`,
                    background: isSelected ? colors.bg : 'white',
                    cursor: 'pointer', textAlign: 'left', width: '100%',
                    fontFamily: 'inherit', transition: 'all 0.15s',
                    boxShadow: isSelected ? `0 4px 16px ${colors.accent}25` : '0 1px 4px rgba(0,0,0,0.05)',
                  }}
                >
                  <span style={{ fontSize: 36 }}>{meta.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: 18, color: '#0f172a' }}>{meta.label}</div>
                    <div style={{ fontSize: 15, color: '#64748b', marginTop: 4, fontWeight: 500 }}>{meta.desc}</div>
                  </div>
                  {isSelected && (
                    <div style={{
                      width: 28, height: 28, borderRadius: 999,
                      background: colors.accent, color: 'white',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 15, fontWeight: 900, flexShrink: 0,
                    }}>✓</div>
                  )}
                </button>
              );
            })}
          </div>

          <div style={{ paddingTop: 20, paddingBottom: 34 }}>
            <button
              className="btn btn-primary"
              disabled={!selectedType}
              onClick={() => setStep('name')}
            >다음</button>
          </div>
        </div>
      )}

      {step === 'name' && (
        <div className="flex flex-col flex-1 px-5 animate-slide-up" style={{ paddingTop: 56 }}>
          <button
            style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: 20, background: '#f1f5f9', borderRadius: 14, border: 'none', cursor: 'pointer', marginBottom: 30, fontWeight: 700 }}
            onClick={() => setStep('type')}
          >←</button>

          <div style={{ marginBottom: 30 }}>
            <div style={{ display: 'inline-block', background: 'linear-gradient(135deg,#3182f6,#1c6ee0)', color: 'white', padding: '5px 14px', borderRadius: 999, fontSize: 14, fontWeight: 800, marginBottom: 12 }}>STEP 2 / 2</div>
            <h2 style={{ fontSize: 30, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.7px', lineHeight: 1.2 }}>이름이 뭐예요?</h2>
            <p style={{ fontSize: 16, color: '#64748b', marginTop: 10, fontWeight: 500 }}>닉네임이나 본명, 편하게 써주세요</p>
          </div>

          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="예: 김사장님, 민준이, 박과장..."
            style={{
              width: '100%', padding: '18px 20px',
              borderRadius: 18, border: `2px solid ${name ? '#3182f6' : '#e2e8f0'}`,
              fontSize: 18, fontFamily: 'inherit', fontWeight: 600,
              color: '#0f172a', outline: 'none',
              transition: 'border-color 0.15s, box-shadow 0.15s',
              boxShadow: name ? '0 0 0 3px rgba(49,130,246,0.15)' : 'none',
            }}
            maxLength={20}
            autoFocus
          />
          <p style={{ fontSize: 14, color: '#94a3b8', marginTop: 8, marginLeft: 4, fontWeight: 600 }}>{name.length}/20</p>

          {selectedType && (
            <div style={{
              marginTop: 20, padding: '20px 22px',
              background: 'linear-gradient(135deg,#f0fdf4,#d1fae5)',
              borderRadius: 20, border: '1.5px solid #a7f3d0',
              boxShadow: '0 2px 10px rgba(4,120,87,0.1)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <span style={{ fontSize: 32 }}>{USER_TYPE_META[selectedType].emoji}</span>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 17, color: '#0f172a' }}>
                    {USER_TYPE_META[selectedType].label} 맞춤 학습
                  </div>
                  <div style={{ fontSize: 15, color: '#475569', marginTop: 4, fontWeight: 500 }}>
                    매일 5문제 · 10분 · 레벨 1~100
                  </div>
                </div>
              </div>
            </div>
          )}

          <div style={{ marginTop: 'auto', paddingTop: 20, paddingBottom: 34 }}>
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
