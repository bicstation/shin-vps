import Link from 'next/link';

export default function Footer({ title }: { title: string }) {
  const currentYear = new Date().getFullYear();
  return (
    <footer style={{ background: '#1f1f3a', color: '#e94560', padding: '40px 20px', borderTop: '3px solid #e94560' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px', marginBottom: '30px' }}>
          <a href="https://stg.tiper.live" target="_blank" rel="noopener" style={{ color: '#99e0ff', textDecoration: 'none' }}>Main Site</a>
          <a href="https://stg.avflash.xyz" target="_blank" rel="noopener" style={{ color: '#99e0ff', textDecoration: 'none' }}>Community</a>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '20px', fontSize: '0.8em' }}>
          <Link href="/sitemap.xml" style={{ color: '#555' }}>Sitemap</Link>
          <Link href="/rss.xml" style={{ color: '#555' }}>RSS Feed</Link>
        </div>
        <p style={{ margin: 0, fontSize: '0.8em', color: '#888' }}>&copy; {currentYear} {title} | All Rights Reserved.</p>
      </div>
    </footer>
  );
}