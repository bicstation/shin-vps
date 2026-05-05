/* eslint-disable @next/next/no-img-element */

import HeroRankingCard from '@/shared/components/organisms/cards/HeroRankingCard';
import ProductCard from '@/shared/components/organisms/cards/ProductCard';
import Link from 'next/link';
import { fetchPCProductRanking } from '@/shared/lib/api/django/pc/stats';

export const dynamic = 'force-dynamic';

// -------------------------
// セカンドカード（2〜4位）
// -------------------------
function SecondCard({ product, rank }) {
  if (!product) return null;

  const labelMap = {
    2: '人気No.2',
    3: 'バランス良',
    4: 'コスパ良',
  };

  const image = product.image_url || '/no-image.png';

  return (
    <Link
      href={`/product/${product.unique_id}`}
      className="
        block bg-[#020617]
        border border-gray-800
        rounded-xl overflow-hidden
        transition-all duration-200
        hover:scale-[1.02] hover:shadow-xl
      "
    >
      {/* 🖼 画像 */}
      <div className="relative w-full h-[120px] bg-black/20">
        <img
          src={image}
          alt={product.name}
          className="w-full h-full object-cover object-center"
        />

        {/* グラデーション */}
        <div className="absolute bottom-0 w-full h-12 bg-gradient-to-t from-black/60 to-transparent" />

        {/* ラベル */}
        <div className="absolute top-2 left-2 text-[10px] bg-orange-500 text-white px-2 py-0.5 rounded">
          {labelMap[rank]}
        </div>
      </div>

      {/* コンテンツ */}
      <div className="p-3">

        {/* 価格 */}
        <div className="text-base font-bold text-orange-300 mb-1">
          ¥{product.price?.toLocaleString()}
        </div>

        {/* タイトル */}
        <div className="text-xs text-gray-200 mb-2 line-clamp-2">
          {product.shortTitle || product.name}
        </div>

        {/* CTA（弱く） */}
        <div className="text-xs text-gray-400 font-semibold">
          最安を見る →
        </div>

      </div>
    </Link>
  );
}

// -------------------------
// メイン
// -------------------------
export default async function RankingPage() {

  let products: any[] = [];

  try {
    const data = await fetchPCProductRanking('score');

    const rawProducts = Array.isArray(data)
      ? data
      : Array.isArray(data?.results)
      ? data.results
      : [];

    console.log('[RANKING COUNT]', rawProducts.length);

    products = rawProducts;

  } catch (e) {
    console.error('[RANKING FETCH ERROR]', e);
  }

  if (!products.length) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <h2>⚠️ データが取得できません</h2>
        <p>API状態を確認してください</p>
      </div>
    );
  }

  const top1 = products[0];
  const second = products.slice(1, 4);
  const others = products.slice(4);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-12">

      {/* 🧠 ページタイトル（追加） */}
      <section className="text-center space-y-2">
        <h1 className="text-2xl font-bold">
          🏆 PCランキング（総合）
        </h1>
        <p className="text-sm text-gray-400">
          迷ったら1位でOK。価格と性能のバランスで選定
        </p>
      </section>

      {/* 🔥 ① HERO（1位） */}
      {top1 && (
        <section className="text-center">
          <HeroRankingCard product={top1} />
        </section>
      )}

      {/* ⚡ ② セカンドゾーン（2〜4位） */}
      {second.length > 0 && (
        <section>
          <h2 className="text-center text-sm text-gray-400 mb-4">
            他にも選択肢あり
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {second.map((p, i) => (
              <SecondCard
                key={p.unique_id}
                product={p}
                rank={i + 2}
              />
            ))}
          </div>
        </section>
      )}

      {/* 📦 ③ 一覧（5位以下） */}
      {others.length > 0 && (
        <section>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {others.map((p) => (
              <ProductCard
                key={p.unique_id}
                product={p}
              />
            ))}
          </div>
        </section>
      )}

      {/* 🔻 下部導線 */}
      <section className="text-center pt-6">
        <Link href="/ranking" className="text-sm text-gray-400 underline">
          → すべてのランキングを見る
        </Link>
      </section>

    </div>
  );
}