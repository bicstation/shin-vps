import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../shared/globals.css"; // ✅ sharedの共通CSS
import styles from "./layout.module.css";

// ✅ 共通設定とsharedコンポーネントをインポート
import { getSiteMetadata, getSiteColor } from "../shared/siteConfig";
import Header from "../shared/layout/Header";
import Footer from "../shared/layout/Footer";
import Sidebar from "../shared/layout/Sidebar";

// ✅ libからSEO設定を取得（独自の実装に合わせる）
import { constructMetadata } from "../lib/metadata";

const inter = Inter({ subsets: ["latin"] });

// ✅ SEO共通設定
export const metadata: Metadata = constructMetadata();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // ✅ sharedからTiper用のカラー情報を取得
  const site = getSiteMetadata();
  const themeColor = getSiteColor(site.site_name); // Tiperはピンク系の想定

  return (
    <html lang="ja">
      <body className={`${inter.className} ${styles.bodyWrapper}`}>
        {/* 1. 共通ヘッダー */}
        <Header />

        {/* 2. ⚖️ 告知バー（アダルト系は特に年齢制限等の表記が重要） */}
        <div className={styles.adDisclosure}>
          【PR】本サイトは広告を利用しています。
          <span className={styles.ageLimit}>※18歳未満の閲覧は固く禁止されています。</span>
        </div>

        {/* 3. メインレイアウト（サイドバー + コンテンツ） */}
        <div className={styles.layoutContainer}>
          <div className={styles.layoutInner}>
            {/* 共通サイドバー */}
            <Sidebar />

            {/* メインページ内容 */}
            <main className={styles.mainContent}>
              {children}
            </main>
          </div>
        </div>

        {/* 4. 共通フッター */}
        <Footer />

        {/* 💡 動的カラーの注入 */}
        <style jsx global>{`
          :root {
            --site-theme-color: ${themeColor};
            --bg-deep: #111122;
          }
          body {
            background-color: var(--bg-deep);
            color: #ffffff;
          }
          a { color: ${themeColor}; }
          
          /* Tiper専用のスクロールバー（ピンクアクセント） */
          ::-webkit-scrollbar { width: 8px; }
          ::-webkit-scrollbar-track { background: #0a0a15; }
          ::-webkit-scrollbar-thumb { background: #333344; border-radius: 4px; }
          ::-webkit-scrollbar-thumb:hover { background: ${themeColor}; }
        `}</style>
      </body>
    </html>
  );
}