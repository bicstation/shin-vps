import Link from 'next/link';

export default function Header() {
  return (
    <header style={{ 
      background: '#222', 
      color: 'white', 
      padding: '15px 40px', 
      borderBottom: '4px solid #007bff',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/bicstation" style={{ textDecoration: 'none', color: 'white' }}>
          <h1 style={{ margin: 0, fontSize: '1.5em', fontWeight: 'bold' }}>BICSTATION</h1>
        </Link>
        <nav style={{ fontSize: '0.9em' }}>
          <Link href="/bicstation" style={{ color: '#ccc', textDecoration: 'none', marginLeft: '20px' }}>PCカタログ</Link>
        </nav>
      </div>
    </header>
  );
}