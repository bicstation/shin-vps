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
 */
export function constructMetadata(
  title?: string, 
  description?: string, 
  image?: string
) {
  // 現在のサイト設定（サイト名、ドメインなど）を取得
  const { site_name, origin_domain } = getSiteMetadata();

  // デフォルトの説明文（サイトごとに変えたい場合はここを拡張）
  const defaultDescription = description || `${site_name} - 最新のデータハブとコンテンツプラットフォーム`;
  
  // ベースURLの構築 (本番環境ならドメイン、ローカルならlocalhost)
  const siteBaseUrl = origin_domain === 'localhost' 
    ? 'http://localhost:8083' 
    : `https://${origin_domain}`;

  const fullTitle = title ? `${title} | ${site_name}` : site_name;

  return {
    title: fullTitle,
    description: defaultDescription,
    // ブラウザのメタタグ設定
    metadataBase: new URL(siteBaseUrl),
    alternates: {
      canonical: "/",
    },
    // SNS (Facebook, LINE等) での見え方
    openGraph: {
      title: fullTitle,
      description: defaultDescription,
      images: [{ url: image || "/og-image.png" }],
      type: "website",
      siteName: site_name,
    },
    // Twitter (X) での見え方
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: defaultDescription,
      images: [image || "/og-image.png"],
    },
  };
}