/**
 * 🛠️ [SHARED-FINAL] メタデータ生成ライブラリ
 * SEO設定、SNSシェア（OGP）設定を全サイトで共通化します。
 */

import { getSiteMetadata } from './siteConfig';

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

  // デフォルトの説明文
  const defaultDescription = description || `${site_name} - 最新のデータハブとコンテンツプラットフォーム`;
  
  // ベースURLの構築
  // 💡 site_prefix (/tiper 等) を含めることで canonical や OGP URL を正確にします
  const siteBaseUrl = origin_domain === 'localhost' || origin_domain === '127.0.0.1'
    ? 'http://localhost:8083' 
    : `https://${origin_domain}`;

  // サイト全体のフルタイトル
  const fullTitle = title ? `${title} | ${site_name}` : site_name;

  // 正規URL (canonical) の構築
  // プレフィックスとパスを結合
  const canonicalPath = `${site_prefix}${path}` || "/";

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
      images: [{ url: image || `${site_prefix}/og-image.png` }],
      type: "website",
      siteName: site_name,
      url: canonicalPath,
    },
    // Twitter (X) での見え方
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: defaultDescription,
      images: [image || `${site_prefix}/og-image.png`],
    },
    // 💡 アイコンもサイトプレフィックスに対応させる
    icons: {
      icon: `${site_prefix}/favicon.ico`,
    }
  };
}