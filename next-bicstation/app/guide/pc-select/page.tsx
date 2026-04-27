export default function GuidePcSelect() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px' }}>

      {/* タイトル */}
      <h1 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '16px' }}>
        3分でわかる：失敗しないPCの選び方
      </h1>

      {/* 結論（最重要） */}
      <p style={{ fontSize: '14px', marginBottom: '16px' }}>
        迷っている人へ。結論だけ先に言います。
      </p>

      <div style={{
        padding: '16px',
        border: '1px solid #1e293b',
        borderRadius: '10px',
        background: '#020617',
        marginBottom: '24px'
      }}>
        <p style={{ fontSize: '14px' }}>
          👉 普通に使うなら「バランス型PC」でOKです。<br />
          👉 ゲームやAIをやるなら「高性能モデル」を選びましょう。
        </p>
      </div>

      {/* 用途別 */}
      <h2 style={{ fontSize: '18px', marginBottom: '12px' }}>
        用途で選べば失敗しません
      </h2>

      <ul style={{ fontSize: '14px', lineHeight: '1.8', marginBottom: '24px' }}>
        <li>✔ ネット・動画 → どのPCでもOK</li>
        <li>✔ 仕事・副業 → バランス型がおすすめ</li>
        <li>✔ ゲーム・AI → 高性能モデル必須</li>
      </ul>

      {/* スペック最低限 */}
      <h2 style={{ fontSize: '18px', marginBottom: '12px' }}>
        最低限これだけ見ればOK
      </h2>

      <ul style={{ fontSize: '14px', lineHeight: '1.8', marginBottom: '24px' }}>
        <li>✔ CPU：Core i5以上</li>
        <li>✔ メモリ：16GB以上</li>
        <li>✔ ストレージ：SSD 500GB以上</li>
      </ul>

      {/* CTA */}
      <div style={{
        marginTop: '32px',
        padding: '20px',
        borderRadius: '12px',
        background: '#0f172a',
        textAlign: 'center'
      }}>
        <p style={{ marginBottom: '12px' }}>
          迷うなら、これを選べば間違いありません
        </p>

        <a
          href="/ranking"
          style={{
            display: 'inline-block',
            padding: '12px 20px',
            borderRadius: '8px',
            background: '#22c55e',
            color: '#000',
            fontWeight: 'bold'
          }}
        >
          👉 おすすめPCを見る
        </a>
      </div>

    </div>
  );
}