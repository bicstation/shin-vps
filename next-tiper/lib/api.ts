/**
 * 💡 ポイント: サーバーサイド(Next.js)からのアクセスか、ブラウザからのアクセスか判定
 * Docker内部ネットワーク名 (django-v2) を使うことで、外回りのネットワークトラブルを回避します
 */
const IS_SERVER = typeof window === 'undefined';
const API_BASE_URL = IS_SERVER 
  ? "http://django-v2:8000/api"  // Docker内部用URL
  : "https://stg.tiper.live/api"; // ブラウザ用URL

/**
 * アダルト商品一覧を取得 (ページング・フィルタ対応)
 */
export async function getAdultProducts(params?: { limit?: number; offset?: number; genre?: string }) {
  const query = new URLSearchParams();
  if (params?.limit) query.append('limit', params.limit.toString());
  if (params?.offset) query.append('offset', params.offset.toString());
  if (params?.genre) query.append('genres', params.genre);

  try {
    const res = await fetch(`${API_BASE_URL}/adults/?${query.toString()}`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(5000), // 5秒でタイムアウト
    });

    if (!res.ok) {
      throw new Error(`API error: ${res.status}`);
    }

    return await res.json();
  } catch (error: any) {
    console.error("Failed to fetch adult products:", error?.message || error);
    return { results: [], count: 0 }; 
  }
}

/**
 * 個別商品の詳細情報を取得
 * IDを指定して単一のオブジェクトを取得します
 */
export async function getAdultProductById(id: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/adults/${id}/`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) {
      if (res.status === 404) return null; // 見つからない場合はnullを返す
      throw new Error(`API error: ${res.status}`);
    }

    return await res.json();
  } catch (error: any) {
    console.error(`Failed to fetch product detail (ID: ${id}):`, error?.message || error);
    return null;
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
    
    // Djangoのページネーションがある場合は .results、ない場合はそのまま配列として処理
    const data = await res.json();
    return Array.isArray(data) ? data : (data.results || []);
  } catch (error: any) {
    console.error("Failed to fetch genres:", error?.message || error);
    return [];
  }
}


// lib/api.ts (既存のファイルに追記)
export async function getAdultProductsByMaker(makerId: string, limit: number = 4) {
  try {
    // Django側のフィルタリング機能を利用
    const res = await fetch(`${API_BASE_URL}/adults/?maker=${makerId}`, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return data.results.slice(0, limit); // 指定した件数だけ返す
  } catch (error) {
    console.error("Fetch error in getAdultProductsByMaker:", error);
    return [];
  }
}