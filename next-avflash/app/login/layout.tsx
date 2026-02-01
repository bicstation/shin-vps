// app/login/layout.tsx
import { Metadata } from 'next';

/**
 * 💡 ログイン画面専用のメタデータ
 * avflash などのサブディレクトリ運用時でも、このページ独自のタイトルが表示されます
 */
export const metadata: Metadata = {
  title: 'ログイン | BICSTATION / AV FLASH',
  description: 'アカウントにログインして、機能を利用しましょう。',
};

/**
 * 💡 ログイン画面専用のレイアウト
 * 共通の Header や Sidebar をあえて表示させないことで、
 * ユーザーをログイン作業に集中させる「クリーンなデザイン」にしています
 */
export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="min-h-screen bg-gray-950 flex flex-col justify-center">
      {/* ダークモード基調（bg-gray-950）に変更し、アダルトサイト（avflash）の
          デザインとも親和性を高めています 
      */}
      <div className="w-full max-w-md mx-auto px-4 py-8">
        {children}
      </div>
      
      {/* フッターにロゴや「戻る」リンクを後から追加する場合は、
          ここに shared/components/... からインポートして配置可能です
      */}
    </section>
  );
}