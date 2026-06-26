// 키워드 기반 프롬프트 평가 — 서버 비용 없이 즉각 피드백

export interface AIFeedback {
  score: number;
  feedback: string;
  improvements: string[];
  encouragement: string;
  isGoodPrompt: boolean;
}

export async function evaluatePrompt(
  userInput: string,
  targetKeywords: string[],
  _context: string,
): Promise<AIFeedback> {
  // 짧은 딜레이로 "평가 중" 느낌
  await new Promise((r) => setTimeout(r, 700));

  const text = userInput.trim();
  const lower = text.toLowerCase();

  // ── 점수 계산 ──────────────────────────────────
  let score = 20;

  // 키워드 매칭
  const hits = targetKeywords.filter((kw) => lower.includes(kw.toLowerCase())).length;
  score += Math.min(hits * 12, 30);

  // 길이 (너무 짧으면 감점)
  const len = text.length;
  if (len < 20)       score -= 10;
  else if (len < 50)  score += 5;
  else if (len < 150) score += 12;
  else                score += 18;

  // 구체적 조건 포함
  if (/조건|요건|기준|이내|이상|개|가지|자|분|만원|원|명/.test(text)) score += 8;
  // 역할 부여
  if (/너는|당신은|전문가|선생님|작가|코치|상담사|담당자|강사/.test(text)) score += 8;
  // 형식 지정
  if (/표|목록|번호|문단|요약|형식|형태|단계|순서/.test(text)) score += 7;
  // 대상/맥락 명시
  if (/대상|타겟|독자|고객|직원|팀장|교수|친구|어르신/.test(text)) score += 5;
  // 분량 지정
  if (/\d+자|\d+줄|\d+페이지|\d+개|\d+가지|짧게|간결/.test(text)) score += 5;

  score = Math.max(30, Math.min(score, 100));

  // ── 피드백 메시지 ──────────────────────────────
  if (score >= 85) {
    return {
      score,
      feedback: '정말 잘 쓴 프롬프트예요! 구체적인 상황, 조건, 형식이 모두 잘 담겼어요.',
      improvements: ['이 수준이면 AI가 바로 원하는 결과를 줄 거예요!'],
      encouragement: '완벽에 가까운 프롬프트예요. 멋져요! 🎉',
      isGoodPrompt: true,
    };
  }
  if (score >= 70) {
    return {
      score,
      feedback: '좋은 프롬프트예요! 핵심 요청이 잘 담겼어요.',
      improvements: [
        '분량이나 형식을 조금 더 구체적으로 지정해보세요',
        '대상 독자나 용도를 추가하면 더 좋아져요',
      ],
      encouragement: '조금만 더 구체적으로 쓰면 완벽해져요! 💪',
      isGoodPrompt: true,
    };
  }
  if (score >= 55) {
    return {
      score,
      feedback: '기본은 잡혔어요. 조건을 더 추가하면 AI가 훨씬 정확하게 답해줘요.',
      improvements: [
        '어떤 형식으로 받고 싶은지 정해봐요 (표, 목록, 요약 등)',
        '상황이나 맥락을 더 설명해줘요',
        '분량이나 글자 수 조건을 넣어봐요',
      ],
      encouragement: '힌트를 참고해서 다시 써봐요. 금방 늘어요! 🌟',
      isGoodPrompt: false,
    };
  }
  return {
    score,
    feedback: '프롬프트가 조금 짧거나 막연해요. 더 구체적으로 써보면 확실히 달라져요!',
    improvements: [
      '무엇을 원하는지 더 자세히 설명해봐요',
      '조건이나 상황을 추가해봐요',
      '예시 프롬프트를 참고해서 구조를 따라해봐요',
    ],
    encouragement: '예시를 보면 감을 잡을 수 있어요. 도전해봐요! 🔥',
    isGoodPrompt: false,
  };
}
