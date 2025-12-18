// E:\shin-vps\next-tiper\lib\api.ts

/**
 * 💡 ポイント: サーバーサイド(Next.js)からのアクセスか、ブラウザからのアクセスか判定
 * Docker内部ネットワーク名 (api_django_v2) を使うことで、外回りのネットワークトラブルを回避します
 */
const IS_SERVER = typeof window === 'undefined';
const API_BASE_URL = IS_SERVER 
  ? "http://django-v2:8000/api"  // Docker内部用URL
  : "https://stg.tiper.live/api";    // ブラウザ用URL

/**
 * アダルト商品一覧を取得
 */
export async function getAdultProducts(params?: { limit?: number; offset?: number; genre?: string }) {
  const query = new URLSearchParams();
  if (params?.limit) query.append('limit', params.limit.toString());
  if (params?.offset) query.append('offset', params.offset.toString());
  if (params?.genre) query.append('genres', params.genre);

  try {
    // 💡 signal: AbortSignal.timeout(5000) を追加して、5秒以上待たせないように設定
    const res = await fetch(`${API_BASE_URL}/adults/?${query.toString()}`, {
      cache: 'no-store', // 💡 常に最新データを取得
      signal: AbortSignal.timeout(5000), // 5秒でタイムアウトさせてページ表示を優先
    });

    if (!res.ok) {
      throw new Error(`API error: ${res.status}`);
    }

    return await res.json();
  } catch (error: any) {
    // 💡 修正ポイント: TypeScriptのエラー回避のため error: any を指定
    // Djangoが Restarting の間は、ここを通って空の結果がすぐに返ります
    console.error("Failed to fetch adult products (Django may be down):", error?.message || error);
    return { results: [], count: 0 }; 
  }
}

/**
 * ジャンル一覧を取得 (マスターデータ)
 */
export async function getGenres() {
  try {
    const res = await fetch(`${API_BASE_URL}/genres/`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) throw new Error('Failed to fetch genres');
    return await res.json();
  } catch (error: any) {
    // 💡 修正ポイント: TypeScriptのエラー回避のため error: any を指定
    console.error("Failed to fetch genres:", error?.message || error);
    return [];
  }
}