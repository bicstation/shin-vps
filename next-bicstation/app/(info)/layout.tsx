import React, { Suspense } from 'react';

export default function InfoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="info-pages-wrapper">
      {/* 💡 ここで Suspense を配置することで、各ページの useSearchParams エラーを防ぎます */}
      <Suspense fallback={
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="animate-pulse text-gray-500">Loading info...</div>
        </div>
      }>
        {children}
      </Suspense>
    </div>
  );
}