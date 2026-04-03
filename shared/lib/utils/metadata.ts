// @ts-nocheck
/**
 * =====================================================================
 * 🛠️ [SHARED-FINAL] 統合メタデータ生成ライブラリ (v2.1)
 * 🛡️ Maya's Logic: 判定ロジックの排除・siteConfig完全同期型
 * =====================================================================
 */
import { getSiteMetadata } from './siteConfig';
import type { Metadata } from 'next';

export function constructMetadata(
  title?: string, 
  description?: string, 
  image?: string,
  path: string = "",
  noIndex: boolean = false,
  manualHost?: string // 💡 SSR時に headers() から渡す用
): Metadata {
  
  // 1. 全ての真実（判定済みデータ）を siteConfig から取得
  const meta = getSiteMetadata(manualHost);
  const { site_name, django_host, is_local_env } = meta;

  // 2. 本番用公開ドメインの確定
  // メタデータ（Canonical/OGP）には、ローカルであっても「本来のドメイン」を入れるのが正解です。
  // django_host が 'api-avflash-host' の場合は 'avflash.xyz' に読み替える等の処理を行います。
  const publicDomain = django_host.replace('api-', '').replace('-host', '').replace('api.', '');

  // 3. ベースURLの構築 (Next.js 15 用)
  // 💡 metadataBase は常に「外部から見える本番URL」であるべきです。
  const siteBaseUrl = is_local_env 
    ? `http://localhost:3000` 
    : `https://${publicDomain}`;

  const fullTitle = title ? `${title} | ${site_name}` : site_name;
  const defaultDescription = description || `${site_name} - 最新データに基づく情報プラットフォーム`;

  // 4. パスの正規化
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const canonicalUrl = `${siteBaseUrl}${cleanPath === '/' ? '' : cleanPath}`;

  // 5. OGP画像
  const ogImage = image?.startsWith('http') 
    ? image 
    : `${siteBaseUrl}/og-image.png`;

  return {
    title: fullTitle,
    description: defaultDescription,
    metadataBase: new URL(siteBaseUrl),
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: !noIndex,
      follow: !noIndex,
    },
    openGraph: {
      title: fullTitle,
      description: defaultDescription,
      images: [{ url: ogImage, width: 1200, height: 630, alt: fullTitle }],
      type: "website",
      siteName: site_name,
      url: canonicalUrl,
      locale: "ja_JP",
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: defaultDescription,
      images: [ogImage],
    },
    icons: {
      icon: [{ url: `/favicon.ico` }],
      apple: [{ url: `/apple-touch-icon.png` }],
    },
    applicationName: site_name,
    authors: [{ name: "SHIN-VPS Project" }],
    generator: "Next.js 15",
  };
}