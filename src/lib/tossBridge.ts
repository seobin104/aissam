// 앱인토스 TossBridge SDK 래퍼
// Toss WebView에서 자동으로 window.TossBridge 가 주입됨
// 개발/웹 환경에서는 모두 fallback으로 처리

export type TossUserInfo = {
  id: string;
  name: string;
};

declare global {
  interface Window {
    TossBridge?: {
      getUserInfo(): Promise<TossUserInfo>;
      showRewardAd(param: { adUnitId: string }): Promise<{ rewarded: boolean }>;
      close(): void;
      openExternalBrowser(param: { url: string }): void;
    };
  }
}

export const isTossApp = (): boolean =>
  typeof window !== 'undefined' && typeof window.TossBridge !== 'undefined';

export async function getTossUserInfo(): Promise<TossUserInfo | null> {
  if (!isTossApp()) return null;
  try {
    return await window.TossBridge!.getUserInfo();
  } catch {
    return null;
  }
}

export async function showRewardedAd(adUnitId: string): Promise<boolean> {
  if (!isTossApp()) return false;
  try {
    const result = await window.TossBridge!.showRewardAd({ adUnitId });
    return result.rewarded;
  } catch {
    return false;
  }
}

export function closeMiniApp(): void {
  if (isTossApp()) window.TossBridge!.close();
}

export function openExternalLink(url: string): void {
  if (isTossApp()) {
    window.TossBridge!.openExternalBrowser({ url });
  } else {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}
