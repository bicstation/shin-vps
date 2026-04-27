// /home/maya/shin-vps/next-bicstation/app/guide/cou/page.tsx

export default function GuideCpu() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px' }}>

      {/* タイトル */}
      <h1 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '16px' }}>
        サクッと理解：CPUの違い（初心者向け）
      </h1>

      {/* 結論 */}
      <p style={{ fontSize: '14px', marginBottom: '16px' }}>
        難しく考えなくて大丈夫です。結論だけ言います。
      </p>

      <div style={{
        padding: '16px',
        border: '1px solid #1e293b',
        borderRadius: '10px',
        background: '#020617',
        marginBottom: '24px'
      }}>
        <p style={{ fontSize: '14px' }}>
          👉 普通に使うなら「Core i5」でOK<br />
          👉 迷ったら「Core i7」を選べば安心
        </p>
      </div>

      {/* CPUとは */}
      <h2 style={{ fontSize: '18px', marginBottom: '12px' }}>
        CPUって何？
      </h2>

      <p style={{ fontSize: '14px', marginBottom: '24px', lineHeight: '1.8' }}>
        CPUは「パソコンの頭脳」です。<br />
        数字が大きいほど速くて快適になります。
      </p>

      {/* 選び方 */}
      <h2 style={{ fontSize: '18px', marginBottom: '12px' }}>
        どれを選べばいい？
      </h2>

      <ul style={{ fontSize: '14px', lineHeight: '1.8', marginBottom: '24px' }}>
        <li>✔ ネット・動画 → Core i5でOK</li>
        <li>✔ 仕事・副業 → Core i5〜i7</li>
        <li>✔ ゲーム・AI → Core i7以上</li>
      </ul>

      {/* 不安解消 */}
      <h2 style={{ fontSize: '18px', marginBottom: '12px' }}>
        よくある不安
      </h2>

      <p style={{ fontSize: '14px', marginBottom: '24px', lineHeight: '1.8' }}>
        「どれを選んでも大丈夫？」と思うかもしれませんが、<br />
        今のPCは性能が高いので、普通に使うなら大きな失敗はしません。
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
          迷うなら、この中から選べば間違いありません
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