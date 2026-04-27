// /home/maya/shin-vps/next-bicstation/app/guide/laptop-vs-desktop/page.tsx

export default function GuideLaptopVsDesktop() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px' }}>

      {/* タイトル */}
      <h1 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '16px' }}>
        迷った人へ：ノートとデスクトップどっち？
      </h1>

      {/* 結論 */}
      <p style={{ fontSize: '14px', marginBottom: '16px' }}>
        迷っているなら、まずこれで判断してください。
      </p>

      <div style={{
        padding: '16px',
        border: '1px solid #1e293b',
        borderRadius: '10px',
        background: '#020617',
        marginBottom: '24px'
      }}>
        <p style={{ fontSize: '14px' }}>
          👉 外で使うなら「ノートPC」<br />
          👉 家で使うなら「デスクトップPC」
        </p>
      </div>

      {/* 特徴 */}
      <h2 style={{ fontSize: '18px', marginBottom: '12px' }}>
        それぞれの特徴
      </h2>

      <ul style={{ fontSize: '14px', lineHeight: '1.8', marginBottom: '24px' }}>
        <li>✔ ノートPC：持ち運びできる・省スペース</li>
        <li>✔ デスクトップPC：性能が高い・コスパ良い</li>
      </ul>

      {/* どっちがいい？ */}
      <h2 style={{ fontSize: '18px', marginBottom: '12px' }}>
        どっちを選べばいい？
      </h2>

      <ul style={{ fontSize: '14px', lineHeight: '1.8', marginBottom: '24px' }}>
        <li>✔ カフェ・外出先で使う → ノート</li>
        <li>✔ 自宅メイン → デスクトップ</li>
        <li>✔ ゲーム・重い作業 → デスクトップがおすすめ</li>
      </ul>

      {/* 不安解消 */}
      <h2 style={{ fontSize: '18px', marginBottom: '12px' }}>
        よくある迷い
      </h2>

      <p style={{ fontSize: '14px', marginBottom: '24px', lineHeight: '1.8' }}>
        「どっちが正解？」と思うかもしれませんが、<br />
        使い方に合っていればどちらでも問題ありません。<br />
        無理に高性能を選ぶ必要もありません。
      </p>

      {/* CTA */}
      <div style={{
        marginTop: '32px',
        padding: '20px',
        borderRadius: '12px',
        background: '#0f172a',
        textAlign: 'center'
      }}>
        <p style={{ marginBottom: '12px' }}>
          迷うなら、用途に合ったPCを選べばOKです
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