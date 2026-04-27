// /shared/lib/transformProduct.ts

export function transformProduct(raw: any) {
  return {
    display_name: raw.name, // ← ここで吸収
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

    score_ai: raw.score_ai,
    price: raw.price,
    affiliate_url: raw.affiliate_url,
    unique_id: raw.id,
    image_url: raw.image_url,

    // cta_text: "👉 今すぐチェック",
    // cta_sub: "在庫あるうちに確認"
  };
}