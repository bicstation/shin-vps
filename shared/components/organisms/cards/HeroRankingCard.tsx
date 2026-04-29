'use client';

type Product = {
  id: number;
  title?: string;
  image?: string | null;
  price?: number;
  url?: string | null;
  label?: string;
  tags?: string[];
};

const shorten = (text: string, max = 38) =>
  text.length > max ? text.slice(0, max) + '...' : text;

export default function HeroRankingCard({ product }: { product?: Product }) {
  if (!product) return null;

  const title = shorten(product.title || 'おすすめ商品');
  const image = product.image || '/no-image.png';
  const price = product.price ?? 0;
  const url = product.url || '';
  const mainTag = product.tags?.[0];

  return (
    <section className="bg-slate-950 p-4 md:p-6 rounded-2xl border-2 border-orange-500 shadow-xl">

      {/* 🔥 コピー（最上部・圧縮） */}
      <div className="mb-3 text-center">
        <h2 className="text-base md:text-lg font-bold leading-tight">
          迷ってる時間が一番ムダ
        </h2>

        <div className="mt-1 text-xs md:text-sm">
          <div className="font-bold text-orange-400">
            これ選べば失敗しない
          </div>
          <div className="text-gray-400">
            初心者が一番後悔するパターンを回避
          </div>
        </div>
      </div>

      {/* 🚀 CTA（最重要・常時表示） */}
      {url && (
        <div className="sticky top-3 z-10">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full bg-orange-500 text-white text-center py-3 rounded-xl font-bold text-sm md:text-base shadow-lg"
          >
            👉 今すぐ確認（在庫あり）
          </a>
        </div>
      )}

      {/* ⚠ 不安トリガー（小さく・即下） */}
      <div className="mt-1 text-[11px] text-red-400 text-center font-semibold">
        安いだけで選ぶと後悔します
      </div>

      {/* 🖼 画像（さらに縮小） */}
      <div className="mt-3 flex justify-center">
        <img
          src={image}
          alt={title}
          className="w-full max-w-[240px] md:max-w-[320px] rounded-xl"
          onError={(e) => (e.currentTarget.src = '/no-image.png')}
        />
      </div>

      {/* 🏷 タグ */}
      {mainTag && (
        <div className="text-center text-xs text-gray-400 mt-2">
          {mainTag}
        </div>
      )}

      {/* 💰 価格 */}
      <div className="text-center text-lg md:text-xl font-bold mt-1">
        ¥{price.toLocaleString()}
      </div>

      {/* ✅ 信頼（圧縮） */}
      <div className="mt-2 text-[11px] text-gray-400 text-center leading-tight">
        <div>今一番売れている構成</div>
        <div>在庫切れになることがあります</div>
      </div>

    </section>
  );
}
