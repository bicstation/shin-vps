// lib/metadata.ts
export const SITE_CONFIG = {
  title: "Tiper Live",
  description: "最新のアダルト商品データハブとコンテンツプラットフォーム",
  baseURL: "https://tiper.live/tiper",
};

export function constructMetadata(title?: string, description?: string, image?: string) {
  return {
    title: title ? `${title} | ${SITE_CONFIG.title}` : SITE_CONFIG.title,
    description: description || SITE_CONFIG.description,
    openGraph: {
      title: title || SITE_CONFIG.title,
      description: description || SITE_CONFIG.description,
      images: [{ url: image || "/og-image.png" }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: title || SITE_CONFIG.title,
      description: description || SITE_CONFIG.description,
      images: [image || "/og-image.png"],
    },
  };
}