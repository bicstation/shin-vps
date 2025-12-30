import Link from 'next/link';

export default function Sidebar({ activeMenu }: { activeMenu?: string }) {
  const SITE_COLOR = '#007bff';
  return (
    <aside style={{ width: '240px', background: '#fff', padding: '30px 20px', borderRight: '1px solid #dee2e6' }}>
      <h3 style={{ fontSize: '0.8em', color: '#aaa', marginBottom: '15px', letterSpacing: '1px' }}>MENU</h3>
      <ul style={{ listStyle: 'none', padding: 0, lineHeight: '3' }}>
        <li>
          <Link href="/s\" style={{ 
            color: activeMenu === 'lenovo' ? SITE_COLOR : '#444', 
            textDecoration: 'none', 
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            💻 Lenovoカタログ
          </Link>
        </li>
        <li>
          <Link href="/" style={{ color: '#888', textDecoration: 'none' }}>🏠 ホームに戻る</Link>
        </li>
      </ul>
    </aside>
  );
}