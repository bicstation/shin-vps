export const trackEvent = (event: string, payload: any = {}) => {
  try {
    const body = {
      event,
      ts: Date.now(),
      ...payload,
    };

    // 開発ログ
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 TRACK:', body);
    }

    // 最優先：高速送信
    if (navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(body)], {
        type: 'application/json'
      });
      navigator.sendBeacon('/api/track', blob);
      return;
    }

    // フォールバック
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      keepalive: true,
    }).catch(() => {});
  } catch {}
};