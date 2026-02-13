export const dynamic = "force-dynamic";

import { Suspense } from 'react';
import RegisterFormInner from './RegisterFormInner';

export const metadata = {
  title: '新規会員登録 | BICSTATION',
};

export default function RegisterPage() {
  return (
    <Suspense fallback={<div>読み込み中...</div>}>
      <RegisterFormInner />
    </Suspense>
  );
}