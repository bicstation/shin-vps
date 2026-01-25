/**
 * 💡 ユーザーログインを実行し、JWTトークンを取得する
 * * Django側の urls.py で定義された 'auth/login/' エンドポイントへ
 * ユーザー名とパスワードを送信し、JWT（アクセストークン・リフレッシュトークン）を取得します。
 */
export async function loginUser(username, password) {
  // 1. ベースとなるAPIのURLを決定
  // 💡 ポイント: process.env.NEXT_PUBLIC_API_URL が空の場合でも動作するように予備URLを設定
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://tiper.live/api';

  // 2. fetch で Django の仮想ルートへ POST リクエストを送信
  // 💡 urls.py の path('auth/login/', ...) と対応しています
  const response = await fetch(`${API_BASE}/auth/login/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ 
      username: username, 
      password: password 
    }),
  });

  // 3. レスポンスのステータスを確認
  if (!response.ok) {
    // 401 Unauthorized などのエラーが返ってきた場合
    const errorData = await response.json().catch(() => ({}));
    
    // Django REST Framework が返す 'detail' メッセージがあればそれを使い、なければデフォルトを表示
    throw new Error(
      errorData.detail || 'ログインに失敗しました。ユーザー名またはパスワードが正しくありません。'
    );
  }

  // 4. JSONレスポンスを解析（トークンが含まれる）
  const data = await response.json();
  
  /**
   * 成功時のレスポンス構造例:
   * {
   * "access": "eyJhbGci...", 
   * "refresh": "eyJhbGci..."
   * }
   */
  return data;
}