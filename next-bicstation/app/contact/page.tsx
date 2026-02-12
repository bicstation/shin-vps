import { Metadata } from 'next';
import { Suspense } from 'react';
import ContactContent from './ContactContent'; // 元のコードをこちらに移動

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: 'コンシェルジュ相談窓口 | BICSTATION',
    description: 'AIコンシェルジュがあなたに最適なPC選びをサポートします。',
};

export default function ContactPage() {
    return (
        <Suspense fallback={
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#020617', color: '#64748b' }}>
                <p>Loading Concierge...</p>
            </div>
        }>
            <ContactContent />
        </Suspense>
    );
}