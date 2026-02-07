import React from "react";

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}

export default async function BrandLayout({ children }: LayoutProps) {
  // 💡 いったん装飾をすべて捨てて、Pageの内容（children）をそのまま表示させる
  return (
    <div style={{ width: '100%' }}>
      {children}
    </div>
  );
}