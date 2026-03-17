'use client';

import { useEffect, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';

/**
 * =====================================================================
 * ⚛️ [ATOM] RouteProgressBar
 * 🛡️ Maya's Logic: Suspense 境界を内包した安全なプログレスバー
 * =====================================================================
 */

// NProgress のグローバル設定
NProgress.configure({ 
  showSpinner: false, 
  speed: 400, 
  minimum: 0.2 
});

/**
 * 内部ロジックコンポーネント
 */
function ProgressBarHandler() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // 1. パスまたはクエリが変わった＝遷移完了とみなして終了
  useEffect(() => {
    NProgress.done();
  }, [pathname, searchParams]);

  // 2. リンククリック時にバーを開始するイベントリスナー
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');

      // 有効な内部リンククリック時のみ開始
      if (
        anchor && 
        anchor.href && 
        anchor.target !== '_blank' && 
        !anchor.hasAttribute('download')
      ) {
        const url = new URL(anchor.href);
        const currentUrl = new URL(window.location.href);

        // 同一オリジンかつ、URL（パスまたはクエリ）が異なる場合にバーを開始
        if (
          url.origin === window.location.origin && 
          url.href !== currentUrl.href
        ) {
          NProgress.start();
        }
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  return null;
}

/**
 * メインエクスポート (Suspense でラップして安全性を確保)
 */
export default function RouteProgressBar() {
  return (
    <Suspense fallback={null}>
      <ProgressBarHandler />
    </Suspense>
  );
}