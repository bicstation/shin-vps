/**
 * =====================================================================
 * 🛠️ [SHARED] メタデータ生成ライブラリ (shared/lib/metadata.ts)
 * SEO設定、SNSシェア（OGP）設定を全サイトで共通化します。
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
 */
export function constructMetadata(
  title?: string, 
  description?: string, 
  image?: string,
  path: string = ""
): Metadata {
  // 現在のサイト設定を取得
  const { site_name, origin_domain, site_prefix } = getSiteMetadata();

  // 💡 ベースパスの決定
  // site_prefix がある場合はそれを優先、ない場合は環境変数から取得
  const basePath = site_prefix || process.env.NEXT_PUBLIC_BASE_PATH || "";

  // デフォルトの説明文
  const defaultDescription = description || `${site_name} - AI解析と最新データに基づく情報プラットフォーム`;
  
  // 🌐 ベースURLの構築 (URLオブジェクトの生成に使用)
  const isLocal = origin_domain === 'localhost' || origin_domain === '127.0.0.1';
  const siteBaseUrl = isLocal
    ? 'http://localhost:8083' 
    : `https://${origin_domain}`;

  // サイト全体のフルタイトル
  const fullTitle = title ? `${title} | ${site_name}` : site_name;

  // 🔗 正規URL (canonical) の構築
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  // ルートパスの場合は末尾スラッシュを考慮
  const canonicalPath = (path === "/" || path === "") ? `${basePath}/` : `${basePath}${cleanPath}`;

  // 🖼️ OGP画像パス
  const ogImage = image || `${basePath}/og-image.png`;

  return {
    title: fullTitle,
    description: defaultDescription,
    
    // 基本設定
    metadataBase: new URL(siteBaseUrl),
    alternates: {
      canonical: canonicalPath,
    },

    // SNS (Facebook, LINE等)
    openGraph: {
      title: fullTitle,
      description: defaultDescription,
      images: [{ url: ogImage }],
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
    },

    // アイコン設定
    icons: {
      icon: `${basePath}/favicon.ico`,
      apple: `${basePath}/apple-touch-icon.png`,
    }
  };
}