/**
 * 🛠️ [SHARED-FINAL] メタデータ生成ライブラリ
 * SEO設定、SNSシェア（OGP）設定を全サイトで共通化します。
 * 既存の siteConfig.tsx を利用するように修正済み。
 */

import { getSiteMetadata } from './siteConfig'; // 同じディレクトリにあるため ./ でOK

/**
 * 💡 各ページのメタデータを動的に生成する
 * @param title ページタイトル (例: "商品一覧")
 * @param description ページの説明
 * @param image シェア用画像URL
 * @param path 現在のパス (例: "/search")
 */
export function constructMetadata(
  title?: string, 
  description?: string, 
  image?: string,
  path: string = ""
) {
  // 現在のサイト設定（サイト名、ドメイン、グループ、プレフィックス）を取得
  const { site_name, origin_domain, site_prefix } = getSiteMetadata();

  // 💡 Next.jsの環境変数からベースパスを優先取得 (/saving, /tiper 等)
  // site_prefix が空の場合のフォールバックとして機能させます
  const basePath = site_prefix || process.env.NEXT_PUBLIC_BASE_PATH || "";

  // デフォルトの説明文
  const defaultDescription = description || `${site_name} - AI解析と最新データに基づく情報プラットフォーム`;
  
  // 🌐 ベースURLの構築
  // Traefik統合ポート 8083 を考慮し、localhost時はポートを含める
  const siteBaseUrl = (origin_domain === 'localhost' || origin_domain === '127.0.0.1')
    ? 'http://localhost:8083' 
    : `https://${origin_domain}`;

  // サイト全体のフルタイトル
  const fullTitle = title ? `${title} | ${site_name}` : site_name;

  // 🔗 正規URL (canonical) の構築
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const canonicalPath = path === "/" || path === "" ? `${basePath}/` : `${basePath}${cleanPath}`;

  // 🖼️ OGP画像パス
  const ogImage = image || `${basePath}/og-image.png`;

  return {
    title: fullTitle,
    description: defaultDescription,
    
    // ブラウザのメタタグ設定
    metadataBase: new URL(siteBaseUrl),
    alternates: {
      canonical: canonicalPath,
    },

    // SNS (Facebook, LINE等) での見え方
    openGraph: {
      title: fullTitle,
      description: defaultDescription,
      images: [{ url: ogImage }],
      type: "website",
      siteName: site_name,
      url: canonicalPath,
      locale: "ja_JP",
    },

    // Twitter (X) での見え方
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: defaultDescription,
      images: [ogImage],
    },

    // 💡 アイコン設定
    icons: {
      icon: `${basePath}/favicon.ico`,
      apple: `${basePath}/apple-touch-icon.png`,
    }
  };
}