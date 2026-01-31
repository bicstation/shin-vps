// app/login/layout.tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ログイン | BICSTATION',
  description: 'BICSTATION アカウントにログインして、PCの比較や保存機能を利用しましょう。',
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="min-h-screen bg-gray-50 flex flex-col justify-center">
      {/* ここにはヘッダー(Navbar)を入れないことで、
          ログイン画面だけスッキリしたデザインにできます 
      */}
      <div className="w-full max-w-md mx-auto px-4">
        {children}
      </div>
    </section>
  );
}