'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';

export default function RouteProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // ページ遷移が完了した（パスやクエリが変わった）らプログレスバーを終了
    NProgress.done();
  }, [pathname, searchParams]);

  useEffect(() => {
    // aタグのクリックイベントを監視してバーを開始
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');

      if (anchor && anchor.href && anchor.target !== '_blank') {
        const url = new URL(anchor.href);
        // 同一オリジンかつ、現在のURLと異なる場合のみ実行
        if (url.origin === window.location.origin && url.href !== window.location.href) {
          NProgress.start();
        }
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  return null; // 視覚的要素はCSSで制御するため、何も描画しない
}