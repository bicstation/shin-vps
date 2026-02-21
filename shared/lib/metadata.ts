/**
 * =====================================================================
 * 🛠️ [SHARED-FINAL] 統合メタデータ生成ライブラリ (shared/lib/metadata.ts)
 * SEO最適化、SNSシェア（OGP）、インデックス制御を全サイトで共通化。
 * Next.js 15.x 完全対応版
 * =====================================================================
 */

import { getSiteMetadata } from './siteConfig';
import type { Metadata } from 'next';

/**
 * 💡 各ページのメタデータを動的に生成する
 * Next.js の Metadata 型を戻り値に指定することで、型安全性を確保します。
 * * @param title ページタイトル (例: "商品一覧")
 * @param description ページの説明
 * @param image シェア用画像URL (外部URLまたは相対パス)
 * @param path 現在のパス (例: "/search" または "adults/123")
 * @param noIndex trueに設定すると検索エンジンから除外 (マイページ等に使用)
 */
export function constructMetadata(
  title?: string, 
  description?: string, 
  image?: string,
  path: string = "",
  noIndex: boolean = false
): Metadata {
  // 1. 現在のサイト設定を取得
  const { site_name, origin_domain, site_prefix } = getSiteMetadata();

  // 2. ベースパスの決定 (サブディレクトリ運用のための prefix 処理)
  // 末尾のスラッシュを除去して正規化
  const rawBasePath = site_prefix || process.env.NEXT_PUBLIC_BASE_PATH || "";
  const basePath = rawBasePath.endsWith('/') ? rawBasePath.slice(0, -1) : rawBasePath;

  // 3. デフォルトの説明文
  const defaultDescription = description || `${site_name} - AI解析と最新データに基づく情報プラットフォーム`;
  
  // 4. ベースURLの構築 (Next.js 15 の metadataBase 用)
  // metadataBase は絶対URLの解決基準。末尾スラッシュなしが推奨。
  const isLocal = origin_domain === 'localhost' || origin_domain === '127.0.0.1' || !origin_domain;
  const siteBaseUrl = isLocal
    ? 'http://localhost:3000' 
    : `https://${origin_domain}`;

  // 5. サイト全体のフルタイトル
  const fullTitle = title ? `${title} | ${site_name}` : site_name;

  // 6. 正規URL (canonical) の構築
  // pathが "/" の場合は basePath/ に、それ以外は basePath/path に結合
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const canonicalPath = (path === "/" || path === "") 
    ? `${basePath}/` 
    : `${basePath}${cleanPath}`;

  // 7. OGP画像パスの解決
  // 外部URL(http)で始まる場合はそのまま、それ以外は basePath を付与
  const ogImage = image?.startsWith('http') 
    ? image 
    : `${basePath}/og-image.png`;

  // 8. メタデータオブジェクトの返却
  return {
    title: fullTitle,
    description: defaultDescription,
    
    // 💡 キーワード設定 (SEOの補助)
    keywords: [`${site_name}`, "AI比較", "最新ランキング", "仕様解析", "エンタメデータ"],

    // 🌐 Next.js 15 推奨の URL 基準設定
    metadataBase: new URL(siteBaseUrl),
    
    alternates: {
      canonical: canonicalPath,
    },

    // 💡 インデックス制御 (robots.txt 相当)
    robots: {
      index: !noIndex,
      follow: !noIndex,
      googleBot: {
        index: !noIndex,
        follow: !noIndex,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },

    // 💡 SNS (Facebook, LINE, Discord 等)
    openGraph: {
      title: fullTitle,
      description: defaultDescription,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: fullTitle,
        }
      ],
      type: "website",
      siteName: site_name,
      url: canonicalPath,
      locale: "ja_JP",
    },

    // 💡 Twitter (X)
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: defaultDescription,
      images: [ogImage],
      // creator: "@your_account", // 運用に合わせて追加可能
    },

    // 💡 アイコン・ファビコン設定
    icons: {
      icon: [
        { url: `${basePath}/favicon.ico` },
        { url: `${basePath}/icon.png`, type: 'image/png' },
      ],
      apple: [
        { url: `${basePath}/apple-touch-icon.png` },
      ],
    },

    // 💡 モバイル・アプリ連携およびその他の情報
    applicationName: site_name,
    authors: [{ name: "SHIN-VPS / TIPER Project" }],
    generator: "Next.js 15",
    referrer: "origin-when-cross-origin",
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },

    // その他、拡張が必要な場合はここに追加
  };
}