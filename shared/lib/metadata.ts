/**
 * =====================================================================
 * 🛠️ [SHARED-FINAL] 統合メタデータ生成ライブラリ (shared/lib/metadata.ts)
 * SEO最適化、SNSシェア（OGP）、インデックス制御を全サイトで共通化。
 * =====================================================================
 */

import { getSiteMetadata } from './siteConfig';
import type { Metadata } from 'next';

/**
 * 💡 各ページのメタデータを動的に生成する
 * Next.js の Metadata 型を戻り値に指定することで、型安全性を確保します。
 * * @param title ページタイトル (例: "商品一覧")
 * @param description ページの説明
 * @param image シェア用画像URL
 * @param path 現在のパス (例: "/search")
 * @param noIndex trueに設定すると検索エンジンから除外 (マイページ等に使用)
 */
export function constructMetadata(
  title?: string, 
  description?: string, 
  image?: string,
  path: string = "",
  noIndex: boolean = false
): Metadata {
  // 現在のサイト設定を取得
  const { site_name, origin_domain, site_prefix } = getSiteMetadata();

  // 💡 ベースパスの決定 (末尾のスラッシュを除去して正規化)
  const rawBasePath = site_prefix || process.env.NEXT_PUBLIC_BASE_PATH || "";
  const basePath = rawBasePath.endsWith('/') ? rawBasePath.slice(0, -1) : rawBasePath;

  // デフォルトの説明文
  const defaultDescription = description || `${site_name} - AI解析と最新データに基づく情報プラットフォーム`;
  
  // 🌐 ベースURLの構築 (Next.js 15 の metadataBase 用)
  // metadataBase は相対パスを解決するための基準。末尾スラッシュなしが推奨。
  const isLocal = origin_domain === 'localhost' || origin_domain === '127.0.0.1' || !origin_domain;
  const siteBaseUrl = isLocal
    ? 'http://localhost:8083' 
    : `https://${origin_domain}`;

  // サイト全体のフルタイトル
  const fullTitle = title ? `${title} | ${site_name}` : site_name;

  // 🔗 正規URL (canonical) の構築
  // 常に "/" から始まるように調整
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const canonicalPath = (path === "/" || path === "") ? `${basePath}/` : `${basePath}${cleanPath}`;

  // 🖼️ OGP画像パス (外部URLならそのまま、相対ならbasePathを付与)
  const ogImage = image?.startsWith('http') ? image : `${basePath}/og-image.png`;

  return {
    title: fullTitle,
    description: defaultDescription,
    
    // 💡 キーワード設定 (SEOの補助)
    keywords: [`${site_name}`, "AI比較", "最新ランキング", "仕様解析"],

    // 基本設定
    // ⚠️ Next.js 15では URL オブジェクトとして渡すことが推奨されます
    metadataBase: new URL(siteBaseUrl),
    alternates: {
      canonical: canonicalPath,
    },

    // 💡 インデックス制御
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

    // SNS (Facebook, LINE等)
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

    // Twitter (X)
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: defaultDescription,
      images: [ogImage],
      // creator: "@your_twitter_handle", // 必要に応じて
    },

    // アイコン設定
    icons: {
      icon: [
        { url: `${basePath}/favicon.ico` },
        { url: `${basePath}/icon.png`, type: 'image/png' },
      ],
      apple: [
        { url: `${basePath}/apple-touch-icon.png` },
      ],
    },

    // 💡 モバイル最適化とその他のメタ
    applicationName: site_name,
    authors: [{ name: "SHIN-VPS Team" }],
    generator: "Next.js",
    referrer: "origin-when-cross-origin",
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
  };
}