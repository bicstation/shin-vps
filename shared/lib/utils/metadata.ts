// @ts-nocheck
/**
 * =====================================================================
 * 🛠️ [SHARED-FINAL] 統合メタデータ生成ライブラリ (v2.3)
 * 🛡️ Maya's Logic: siteConfig v21.9 完全同期・引数バグ修正済み
 * =====================================================================
 */
import { getSiteMetadata } from './siteConfig';
import type { Metadata } from 'next';

interface MetadataProps {
  title?: string;
  description?: string;
  image?: string;
  path?: string;
  noIndex?: boolean;
  manualHost?: string; // 💡 SSR時に headers() から渡す用
}

export function constructMetadata({
  title,
  description,
  image,
  path = "",
  noIndex = false,
  manualHost
}: MetadataProps = {}): Metadata {
  
  // 1. 全ての真実（判定済みデータ）を siteConfig から取得
  const meta = getSiteMetadata(manualHost);
  const { site_name, django_host, is_local_env, site_group } = meta;

  // 2. 本番用公開ドメインの確定
  const publicDomain = django_host
    .replace(/^api-/, '')
    .replace(/-host$/, '')
    .replace(/^api\./, '');

  // 3. ベースURLの構築
  const siteBaseUrl = is_local_env 
    ? `http://localhost:3000` 
    : `https://${publicDomain}`;

  // 💡 ここで [object Object] になるのを防ぐ
  const fullTitle = title ? `${title} | ${site_name}` : site_name;
  
  const defaultDescription = description || (
    site_group === 'adult' 
      ? `${site_name} - AI解析による高精度デジタルアーカイブ`
      : `${site_name} - 最新テクノロジーとデータに基づく情報ステーション`
  );

  // 4. パスの正規化
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const canonicalUrl = new URL(cleanPath, siteBaseUrl).toString();

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