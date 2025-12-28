import { Inter } from "next/font/google"; 
import "./globals.css";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import { constructMetadata } from "../lib/metadata";

const inter = Inter({ subsets: ["latin"] });

// ✅ SEO共通設定を lib から取得
export const metadata = constructMetadata();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const title = process.env.NEXT_PUBLIC_APP_TITLE || "Tiper Live";

  return (
    <html lang="ja" style={{ backgroundColor: '#111122' }}> 
      <body className={inter.className} style={{ margin: 0, padding: 0 }}>
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          minHeight: '100vh',
          backgroundColor: '#111122'
        }}>
          
          <Header title={title} />

          <main style={{ flexGrow: 1, color: 'white' }}>
            {children} 
          </main>

          <Footer title={title} />
          
        </div>
      </body>
    </html>
  );
}