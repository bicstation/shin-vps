/* eslint-disable @next/next/no-img-element */
// app/product/[unique_id]/page.tsx

import ProductCTA from './ProductCTA';
import FinalCta from './FinalCta';

import ReactMarkdown from 'react-markdown';

import ProductRadarChart from '@/shared/components/organisms/RadarChart';
import ProductCard from '@/shared/components/organisms/cards/ProductCard';

import {
  fetchPCProductDetail,
  fetchPCProductRanking
} from '@/shared/lib/api/django/pc/stats';

export default async function Page({ params }: any) {
  const unique_id = params.unique_id;

  const product = await fetchPCProductDetail(unique_id);

  if (!product) {
    return (
      <div style={{ padding: '16px', color: 'red' }}>
        ❌ 商品データが取得できていません
      </div>
    );
  }

  // -------------------------
  // 比較用データ（ランキングから取得）
  // -------------------------
  const ranking = await fetchPCProductRanking('score');

  const compareProducts = ranking
    .filter((p: any) => p.unique_id !== product.unique_id)
    .slice(0, 3);

  // -------------------------
  // AIデータ分解
  // -------------------------
  const summaryText = product.ai_summary || '';

  const get = (key: string) => {
    const match = summaryText.match(new RegExp(`${key}:(.*)`));
    return match ? match[1].trim() : '';
  };

  const summary = {
    p1: get('POINT1'),
    p2: get('POINT2'),
    p3: get('POINT3'),
    target: get('TARGET'),
  };

  const aiContent = product.ai_content || '';

  // -------------------------
  // 🔥 Markdown強化コンポーネント
  // -------------------------
  const MarkdownComponents = (product: any) => ({
    p: ({ children }: any) => {
      const text = String(children);

      // -------------------------
      // 🔥 ランキングリンク
      // -------------------------
      if (text.includes('RTX') || text.includes('GPU')) {
        return (
          <>
            <p>{children}</p>
            <div className="rankingLinkBox">
              👉 <a href="/ranking/gaming">同GPUランキングを見る</a>
            </div>
          </>
        );
      }

      // -------------------------
      // 🔥 CTA前誘導
      // -------------------------
      if (text.includes('詳細は')) {
        return (
          <div className="priceRecommend">
            💡 この価格帯で最もバランスが良い構成です
          </div>
        );
      }

      return <p>{children}</p>;
    },

      // -------------------------
      // 🔥 比較表（h2後に挿入）
      // -------------------------
      h2: ({ children }: any) => {
        const title = String(children);

        if (title.includes('競合') || title.includes('比較')) {
          return (
            <>
              <h2>{children}</h2>

              <table className="compareTable">
                <thead>
                  <tr>
                    <th>項目</th>
                    <th>このPC</th>
                    <th>平均</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>CPU</td>
                    <td>{product.score_cpu}</td>
                    <td>80</td>
                  </tr>
                  <tr>
                    <td>GPU</td>
                    <td>{product.score_gpu}</td>
                    <td>75</td>
                  </tr>
                  <tr>
                    <td>コスパ</td>
                    <td>{product.score_cost}</td>
                    <td>70</td>
                  </tr>
                </tbody>
              </table>
            </>
          );
        }

        return <h2>{children}</h2>;
      },
});


  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '16px' }}>

      {/* =========================
         🥇 HERO
      ========================= */}
      <section>
        <h1 style={{ fontSize: '20px', fontWeight: '700' }}>
          {product.name}
        </h1>

        <img
          src={product.image_url}
          alt={product.name}
          style={{
            width: '100%',
            borderRadius: '12px',
            marginTop: '10px'
          }}
        />

        <div style={{
          fontSize: '26px',
          fontWeight: '800',
          marginTop: '10px',
          color: '#f97316'
        }}>
          ¥{product.price?.toLocaleString()}
        </div>
      </section>
      <section style={{ marginTop: '12px' }}>
        <div style={{
          background: '#fff7ed',
          borderLeft: '4px solid #f97316',
          padding: '10px',
          fontWeight: '600'
        }}>
          👉 この価格帯で最もバランスが良い1台
        </div>
      </section>
      <section style={{ marginTop: '10px' }}>
        <a
          href="/ranking/score"
          style={{
            display: 'block',
            background: '#ecfeff',
            border: '1px solid #67e8f9',
            padding: '10px',
            borderRadius: '8px',
            fontSize: '13px',
            textAlign: 'center',
            textDecoration: 'none',
            color: '#0f172a',
            fontWeight: '600'
          }}
        >
          🏆 総合ランキングで上位の人気モデルを見る
        </a>
      </section>
      {/* =========================
         📊 レーダー
      ========================= */}
      <section style={{ marginTop: '24px' }}>
        <h2>性能バランス</h2>
        <ProductRadarChart data={product.radar_chart} />
      </section>

      {/* =========================
         📈 スコア
      ========================= */}
      <section style={{ marginTop: '20px' }}>
        <h3>性能スコア</h3>

        <ul>
          <li>CPU：{product.score_cpu}</li>
          <li>GPU：{product.score_gpu}</li>
          <li>コスパ：{product.score_cost}</li>
          <li>携帯性：{product.score_portable}</li>
          <li>AI：{product.score_ai}</li>
        </ul>
      </section>

      {/* =========================
         🏷 属性（リンク化）
      ========================= */}
      <section style={{ marginTop: '20px' }}>
        <h3>特徴</h3>

        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {product.attributes?.map((attr: any) => (
            <a
              key={attr.id}
              href={`/ranking/${attr.slug}`}
              style={{
                background: '#111827',
                color: '#fff',
                padding: '4px 8px',
                borderRadius: '6px',
                fontSize: '12px',
                textDecoration: 'none'
              }}
            >
              {attr.name}
            </a>
          ))}
        </div>
      </section>

      {/* =========================
         🧠 AI要約
      ========================= */}
      <section style={{ marginTop: '24px' }}>
        <h2>このPCの強み</h2>

        <ul>
          {summary.p1 && <li>{summary.p1}</li>}
          {summary.p2 && <li>{summary.p2}</li>}
          {summary.p3 && <li>{summary.p3}</li>}
        </ul>

        {summary.target && (
          <>
            <h3>こんな人におすすめ</h3>
            <p>{summary.target}</p>
          </>
        )}
      </section>

      {/* =========================
         ⚙️ スペック
      ========================= */}
      <section style={{ marginTop: '20px' }}>
        <h2>スペック</h2>

        <ul>
          <li>CPU: {product.cpu_model}</li>
          <li>GPU: {product.gpu_model}</li>
          <li>メモリ: {product.memory_gb}GB</li>
          <li>ストレージ: {product.storage_gb}GB</li>
        </ul>
      </section>

      {/* =========================
         🚀 CTA（中）
      ========================= */}
      <ProductCTA url={product.url} />

      <h2>迷うならこの3台でOK</h2>
      {/* =========================
         ⚔ 比較ゾーン（最重要）
      ========================= */}
      <section style={{ marginTop: '30px' }}>
        <h2>この構成とよく比較されるモデル</h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2,1fr)',
          gap: '10px'
        }}>
          {compareProducts.map((p: any) => (
            <ProductCard key={p.unique_id} product={p} />
          ))}
        </div>
      </section>
      <section style={{ marginTop: '10px', textAlign: 'center' }}>
        <a
          href="/ranking/score"
          style={{
            fontSize: '14px',
            color: '#f97316',
            fontWeight: '700',
            textDecoration: 'none'
          }}
        >
          → 他の人気モデルも見る
        </a>
      </section>
      {/* =========================
         📖 詳細レビュー
      ========================= */}
      <section style={{ marginTop: '24px' }}>
        <h2>詳細レビュー</h2>
          <div className="markdown">
            <ReactMarkdown components={MarkdownComponents(product)}>
              {aiContent}
            </ReactMarkdown>
          </div>
      </section>
      <div style={{
        textAlign: 'center',
        fontWeight: '700',
        margin: '20px 0'
      }}>
        👉 迷っている時間が一番もったいない
      </div>
      <section style={{ marginTop: '20px', textAlign: 'center' }}>
        <a
          href="/ranking/price-low"
          style={{
            display: 'inline-block',
            padding: '10px 14px',
            background: '#f1f5f9',
            borderRadius: '10px',
            fontSize: '13px',
            textDecoration: 'none',
            color: '#111827'
          }}
        >
          💰 コスパ重視のランキングを見る
        </a>
      </section>
      {/* =========================
         🔥 最終CTA
      ========================= */}
      <FinalCta
        product={product}
        summary={summary}
        finalUrl={product.url}
        isSoftware={false}
      />

    </div>
  );
}