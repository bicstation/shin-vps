import React from 'react';
import styles from './contact.module.css'; // 必要に応じて作成、またはインラインCSSで対応

export default function ContactPage() {
    return (
        <div style={{ maxWidth: '800px', margin: '60px auto', padding: '0 20px', fontFamily: 'sans-serif' }}>
            <header style={{ textAlign: 'center', marginBottom: '40px' }}>
                <h1 style={{ fontSize: '2rem', color: '#333', fontWeight: 'bold' }}>お問い合わせ</h1>
                <p style={{ color: '#666', marginTop: '10px' }}>
                    BICSTATION AI LAB へのご意見・ご質問はこちらからお願いいたします。
                </p>
            </header>

            <div style={{ background: '#f9f9f9', padding: '30px', borderRadius: '12px', border: '1px solid #eee' }}>
                <section style={{ marginBottom: '30px' }}>
                    <h2 style={{ fontSize: '1.2rem', color: '#444', marginBottom: '15px', borderLeft: '4px solid #0070f3', paddingLeft: '10px' }}>
                        メールでのお問い合わせ
                    </h2>
                    <p style={{ color: '#555', lineHeight: '1.6' }}>
                        広告掲載、製品レビューの依頼、その他技術的なご質問については、以下のメールアドレスまで直接ご連絡ください。
                    </p>
                    <div style={{ marginTop: '10px', fontWeight: 'bold', color: '#0070f3', fontSize: '1.1rem' }}>
                        📧 support@bicstation.com 
                        <span style={{ fontSize: '0.8rem', color: '#999', fontWeight: 'normal', marginLeft: '10px' }}>
                            (※ @を半角に変えて送信してください)
                        </span>
                    </div>
                </section>

                <hr style={{ border: '0', borderTop: '1px solid #ddd', margin: '30px 0' }} />

                <section>
                    <h2 style={{ fontSize: '1.2rem', color: '#444', marginBottom: '15px', borderLeft: '4px solid #0070f3', paddingLeft: '10px' }}>
                        運営情報
                    </h2>
                    <ul style={{ listStyle: 'none', padding: '0', color: '#666', lineHeight: '2' }}>
                        <li><strong>運営組織:</strong> BICSTATION プロジェクトチーム</li>
                        <li><strong>対応時間:</strong> 平日 10:00 - 18:00 (土日祝除く)</li>
                        <li><strong>プライバシーポリシー:</strong> <a href="/privacy" style={{ color: '#0070f3' }}>こちらをご確認ください</a></li>
                    </ul>
                </section>
            </div>

            <footer style={{ marginTop: '40px', textAlign: 'center', color: '#bbb', fontSize: '0.8rem' }}>
                &copy; 2026 BICSTATION AI LAB. All rights reserved.
            </footer>
        </div>
    );
}