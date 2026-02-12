import { Suspense } from 'react';
import NotFoundContent from './not-found-content'; // 下で作るファイルをインポート

export const metadata = {
  title: '404 - ページが見つかりませんでした | BICSTATION',
};

export default function NotFound() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[70vh]">
        <p className="text-gray-500 font-mono">LOADING_ERROR_PAGE...</p>
      </div>
    }>
      <NotFoundContent />
    </Suspense>
  );
}