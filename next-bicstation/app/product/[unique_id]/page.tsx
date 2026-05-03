/* eslint-disable @next/next/no-img-element */
// app/product/[unique_id]/page.tsx

import ProductCTA from './ProductCTA';
import FinalCta from './FinalCta';

import ReactMarkdown from 'react-markdown';

import ProductRadarChart from '@/shared/components/organisms/RadarChart';
// import { fetchPCProductDetailByUid } from '@/shared/lib/api/django/pc/stats';
import { fetchPCProductDetail } from '@/shared/lib/api/django/pc/stats'



export default async function Page({ params }: any) {
  const unique_id = params.unique_id;

  // const product = await fetchPCProductDetailByUid(unique_id);
  const product = await fetchPCProductDetail(unique_id)
  if (!product) {
    return (
      <div style={{ padding: '16px', color: 'red' }}>
        ❌ 商品データが取得できていません
      </div>
    );
  }

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

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '16px' }}>

      {/* =========================
         🥇 HERO（即判断）
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

      {/* =========================
         📊 レーダー（最重要）
      ========================= */}
      <section style={{ marginTop: '24px' }}>
        <h2>性能バランス</h2>
        <ProductRadarChart data={product.radar_chart} />
      </section>

      {/* =========================
         📈 スコア（説得）
      ========================= */}
      <section style={{ marginTop: '20px' }}>
        <h3>性能スコア</h3>

        <ul style={{ fontSize: '14px', lineHeight: '1.6' }}>
          <li>CPU性能：{product.score_cpu}</li>
          <li>GPU性能：{product.score_gpu}</li>
          <li>コスパ：{product.score_cost}</li>
          <li>携帯性：{product.score_portable}</li>
          <li>AI性能：{product.score_ai}</li>
        </ul>
      </section>

      {/* =========================
         🏷 属性（直感理解）
      ========================= */}
      <section style={{ marginTop: '20px' }}>
        <h3>特徴</h3>

        <div style={{
          display: 'flex',
          gap: '6px',
          flexWrap: 'wrap'
        }}>
          {product.attributes?.map((attr: any) => (
            <span
              key={attr.id}
              style={{
                background: '#111827',
                color: '#fff',
                padding: '4px 8px',
                borderRadius: '6px',
                fontSize: '12px',
              }}
            >
              {attr.name}
            </span>
          ))}
        </div>
      </section>

      {/* =========================
         🧠 AI要約（刺す）
      ========================= */}
      <section style={{ marginTop: '24px' }}>
        <h2>このPCの強み</h2>

        <ul style={{ lineHeight: '1.6' }}>
          {summary.p1 && <li>{summary.p1}</li>}
          {summary.p2 && <li>{summary.p2}</li>}
          {summary.p3 && <li>{summary.p3}</li>}
        </ul>

        {summary.target && (
          <>
            <h3 style={{ marginTop: '10px' }}>
              こんな人におすすめ
            </h3>
            <p>{summary.target}</p>
          </>
        )}
      </section>

      {/* =========================
         ⚙️ スペック（裏付け）
      ========================= */}
      <section style={{ marginTop: '20px' }}>
        <h2>スペック</h2>

        <ul style={{ fontSize: '14px', lineHeight: '1.6' }}>
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

      {/* =========================
         📖 詳細レビュー（SEO）
      ========================= */}
      <section style={{ marginTop: '24px' }}>
        <h2>詳細レビュー</h2>

        <ReactMarkdown>
          {aiContent}
        </ReactMarkdown>
      </section>

      {/* =========================
         🔥 最終CTA（決断）
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