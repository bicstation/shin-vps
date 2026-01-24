/**
 * 💡 ユーザーログインを実行し、JWTトークンを取得する
 */
export async function loginUser(username, password) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'ログインに失敗しました');
  }

  const data = await response.json();
  // data.access -> アクセストークン
  // data.refresh -> リフレッシュトークン
  return data;
}