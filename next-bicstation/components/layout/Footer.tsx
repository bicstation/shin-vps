export default function Footer() {
  return (
    <footer style={{ background: '#222', color: '#777', padding: '40px 20px', textAlign: 'center', fontSize: '0.85em' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <p>&copy; {new Date().getFullYear()} BICSTATION - PC Specs Comparison Portal</p>
        <p style={{ marginTop: '10px', color: '#555' }}>
          当サイトに掲載されている製品情報は自動取得されたものです。最終的な購入決定は各メーカーの公式サイトをご確認ください。
        </p>
      </div>
    </footer>
  );
}