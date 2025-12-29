import Link from 'next/link';

export default function Header({ title }: { title: string }) {
  return (
    <header style={{
      background: '#1f1f3a', color: '#e94560', padding: '15px 20px',
      borderBottom: '3px solid #e94560', boxShadow: '0 2px 5px rgba(0,0,0,0.5)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ margin: 0, fontSize: '1.8em' }}>
          <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>{title}</Link>
        </h1>
        <nav>
          <Link href="/" style={{ color: '#99e0ff', margin: '0 10px', textDecoration: 'none' }}>TOP</Link>
          <Link href="/adults" style={{ color: '#99e0ff', margin: '0 10px', textDecoration: 'none' }}>商品一覧</Link>
        </nav>
      </div>
    </header>
  );
}