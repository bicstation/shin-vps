// /shared/lib/utils/matchReason.ts

export function formatMatchReason(reasons: string[] = []): string {

  const map: Record<string, string> = {
    price: '今のモデルとほぼ同価格帯で比較しやすい',
    gpu: '同等のGPU性能でゲームや制作にも対応',
    usage: '同じ用途に最適化されたモデル',
    balance: '性能と価格のバランスが近い構成',
  }

  // 最大2〜3個までに制限（重要）
  return reasons
    .slice(0, 3)
    .map(r => map[r] || '')
    .filter(Boolean)
    .join('・')
}