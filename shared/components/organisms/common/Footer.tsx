'use client';

export default function Footer() {
  return (
    <footer
      style={{
        marginTop: '40px',
        padding: '28px 16px',
        background: '#020617',
        color: '#94a3b8',
        textAlign: 'center',
        fontSize: '12px',
        lineHeight: 1.8,
      }}
    >

      {/* 🛡 信頼ブロック */}
      <div style={{ marginBottom: '18px' }}>
        <div style={{ color: '#fff', fontWeight: 'bold', marginBottom: '6px' }}>
          安心してご利用いただけます
        </div>

        <div>✔ 掲載商品はすべて公式ショップ</div>
        <div>✔ 安全な購入リンクのみ使用</div>
        <div>✔ 無理な販売は行いません</div>
      </div>

      {/* ⚠ 補足 */}
      <div style={{ fontSize: '11px', marginBottom: '14px' }}>
        ※在庫状況や価格は変動する場合があります
      </div>

      {/* 🧠 ブランド（ここに入れる） */}
      <div
        style={{
          fontSize: '11px',
          marginBottom: '14px',
          color: '#64748b',
          letterSpacing: '0.05em',
        }}
      >
        Powered by <span style={{ color: '#94a3b8' }}>SHIN CORE LINX</span>
      </div>

      {/* 🔗 最小リンク */}
      <div style={{ marginBottom: '16px' }}>
        <a href="/privacy" style={{ marginRight: '12px', textDecoration: 'underline' }}>
          プライバシーポリシー
        </a>
        <a href="/terms" style={{ textDecoration: 'underline' }}>
          利用規約
        </a>
      </div>

      {/* 🏁 コピーライト */}
      <div style={{ fontSize: '11px', color: '#64748b' }}>
        © {new Date().getFullYear()} SHIN CORE LINX
      </div>

    </footer>
  );
}