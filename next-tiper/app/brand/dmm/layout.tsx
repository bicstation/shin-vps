import React from 'react';

/**
 * BrandLayout
 * ブランドアーカイブ以下のページ専用レイアウト。
 * * 💡 ポイント:
 * ここで共通サイドバーを呼び出さないことで、ArchiveTemplate側が持つ
 * 「指令データ付きサイドバー」との衝突（二重表示）を防ぎます。
 */
export default function BrandLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // 💡 テンプレート側の .pageWrapper や .container が
    // 全幅を正しく使えるように、最小限の構成にします。
    <div className="min-h-screen w-full">
      {children}
    </div>
  );
}