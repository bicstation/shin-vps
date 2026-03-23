import { getNewsList } from "@/shared/lib/api/django/news";

export default async function TestApiPage() {
  let data = null;
  let error = null;

  try {
    // 実際にAPIを叩いてみる
    data = await getNewsList();
  } catch (e: any) {
    error = e.message;
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>🛠 API Connection Test</h1>
      <hr />
      
      <h3>📡 1. Connection Status:</h3>
      {error ? (
        <p style={{ color: 'red' }}>❌ Failed: {error}</p>
      ) : (
        <p style={{ color: 'green' }}>✅ Success!</p>
      )}

      <h3>📦 2. Raw Data (JSON):</h3>
      <pre style={{ background: '#eee', padding: '10px' }}>
        {data ? JSON.stringify(data, null, 2) : "No data available"}
      </pre>

      <h3>🔍 3. Environment Variables (Internal):</h3>
      <ul>
        <li>INTERNAL_API_URL: {process.env.API_INTERNAL_URL || "Not Set"}</li>
        <li>NEXT_PUBLIC_API_URL: {process.env.NEXT_PUBLIC_API_URL || "Not Set"}</li>
      </ul>
    </div>
  );
}