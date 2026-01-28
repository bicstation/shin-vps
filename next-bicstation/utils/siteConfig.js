// /home/maya/dev/shin-vps/next-bicstation/utils/siteConfig.js

/**
 * 現在のアクセスドメインに基づいてサイト設定を返す
 */
export const getSiteMetadata = () => {
  // サーバーサイドレンダリング(SSR)時はブラウザのwindowがないためデフォルト値を返す
  if (typeof window === "undefined") {
    return { site_group: 'general', origin_domain: 'localhost' };
  }

  const hostname = window.location.hostname; 

  // ドメイン判定ロジック
  // 自分の運用するアダルト系ドメインをここに追加していきます
  const isAdult = 
    hostname.includes("adult") || 
    hostname.includes("ero-station") || 
    hostname.includes("777"); // 例

  return {
    site_group: isAdult ? "adult" : "general",
    origin_domain: hostname,
  };
};