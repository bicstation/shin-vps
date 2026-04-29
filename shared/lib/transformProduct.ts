export function transformProduct(raw: any) {
  return {
    id: raw.id,

    // 👇 Heroが使う名前に合わせる
    title: raw.title || raw.name || '',
    image: raw.image || raw.image_url || '',
    price: raw.price ?? 0,
    url: raw.url || raw.affiliate_url || '',
    label: raw.label || (raw.score_ai >= 90 ? "🔥 迷ったらこれ" : ''),
    tags: raw.tags || [],

    // 👇 追加情報（必要なら）
    short_tag: raw.score_ai >= 90 ? "🔥 迷ったらこれ" : "",

    selling_points: [
      raw.score_cpu > 85 && "高性能CPUでサクサク",
      raw.score_ai > 85 && "AI・動画編集も余裕",
      raw.score_cost > 70 && "コスパ優秀"
    ].filter(Boolean),

    short_comment:
      raw.score_ai >= 90
        ? "初心者でも失敗しない構成"
        : "用途に応じてしっかり使える一台",
  };
}