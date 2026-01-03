/**
 * =====================================================================
 * 💡 SHIN-VPS API サービス層 (lib/api.ts) - tiper.live 職場開発環境版
 * =====================================================================
 */

const IS_SERVER = typeof window === 'undefined';

/**
 * 🔗 Django API ベースURL (アダルト商品用)
 */
const getDjangoBaseUrl = () => {
  if (IS_SERVER) return 'http://django-v2:8000';
  
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:8083'; // 職場ローカル外線
  }
  return 'https://tiper.live'; // 本番
};

/**
 * 🔗 WordPress API ベースURL
 * 💡 修正ポイント: tiper.liveではブログパスが /tiper となっている仕様を反映
 */
const getWpBaseUrl = () => {
  if (IS_SERVER) return 'http://nginx-wp-v2/tiper'; // 内線
  
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:8083/tiper'; // 外線
  }
  return 'https://tiper.live/tiper';
};

const API_BASE_URL = `${getDjangoBaseUrl()}/api`;
const WP_BASE_URL = `${getWpBaseUrl()}/wp-json/wp/v2`;

/**
 * =====================================================================
 * 🔞 [Django] アダルト商品 API
 * =====================================================================
 */

/**
 * 商品一覧取得
 */
export async function getAdultProducts(params?: { limit?: number; offset?: number; genre?: string }) {
  const query = new URLSearchParams();
  if (params?.limit) query.append('limit', params.limit.toString());
  if (params?.offset) query.append('offset', params.offset.toString());
  if (params?.genre) query.append('genres', params.genre);

  try {
    const res = await fetch(`${API_BASE_URL}/adults/?${query.toString()}`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(5000),
      headers: { 'Host': 'localhost' } // Traefik振り分け用
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return await res.json();
  } catch (error: any) {
    console.error("Failed to fetch adult products:", error?.message);
    return { results: [], count: 0 }; 
  }
}

/**
 * 詳細取得
 */
export async function getAdultProductById(id: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/adults/${id}/`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(5000),
      headers: { 'Host': 'localhost' }
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (error: any) {
    return null;
  }
}

/**
 * メーカー別取得
 */
export async function getAdultProductsByMaker(makerId: string, limit: number = 4) {
  try {
    const res = await fetch(`${API_BASE_URL}/adults/?maker=${makerId}`, {
      cache: 'no-store',
      headers: { 'Host': 'localhost' }
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.results ? data.results.slice(0, limit) : [];
  } catch (error) {
    return [];
  }
}

/**
 * ジャンル一覧取得
 */
export async function getGenres() {
  try {
    const res = await fetch(`${API_BASE_URL}/genres/`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(5000),
      headers: { 'Host': 'localhost' }
    });
    if (!res.ok) throw new Error('Failed to fetch genres');
    const data = await res.json();
    return Array.isArray(data) ? data : (data.results || []);
  } catch (error: any) {
    return [];
  }
}

/**
 * =====================================================================
 * 📝 [WordPress] 記事取得 API (tiper用)
 * =====================================================================
 */

/**
 * 記事一覧取得
 * ※ tiper側がカスタム投稿ではなく標準の 'posts' を使う場合の例
 */
export async function fetchPostList(perPage = 5) {
  try {
    const res = await fetch(`${WP_BASE_URL}/posts?_embed&per_page=${perPage}`, {
      headers: { 'Host': 'localhost' },
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(5000)
    });
    return res.ok ? await res.json() : [];
  } catch (error) {
    return [];
  }
}

export async function fetchPostData(slug: string) {
  try {
    const res = await fetch(`${WP_BASE_URL}/posts?slug=${slug}&_embed`, {
      headers: { 'Host': 'localhost' },
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(5000)
    });
    const posts = await res.json();
    return Array.isArray(posts) && posts.length > 0 ? posts[0] : null;
  } catch (error) {
    return null;
  }
}