import React from 'react';
import styles from './contact.module.css';

export default function ContactPage() {
    return (
        <div className={styles.container}>

            <header className={styles.header}>
                <h1 className={styles.title}>
                    お問い合わせ
                </h1>

                <p className={styles.description}>
                    BICSTATION AI LAB へのご意見・ご質問はこちらからお願いいたします。
                </p>
            </header>

            <div className={styles.card}>

                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>
                        メールでのお問い合わせ
                    </h2>

                    <p className={styles.text}>
                        広告掲載、製品レビューの依頼、その他技術的なご質問については、
                        以下のメールアドレスまで直接ご連絡ください。
                    </p>

                    <div className={styles.mailBox}>
                        📧 support@bicstation.com

                        <span className={styles.mailNote}>
                            (※ @を半角に変えて送信してください)
                        </span>
                    </div>
                </section>

                <hr className={styles.divider} />

                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>
                        運営情報
                    </h2>

                    <ul className={styles.infoList}>
                        <li>
                            <strong>運営組織:</strong>
                            BICSTATION プロジェクトチーム
                        </li>

                        <li>
                            <strong>対応時間:</strong>
                            平日 10:00 - 18:00
                            (土日祝除く)
                        </li>

                        <li>
                            <strong>プライバシーポリシー:</strong>

                            <a
                                href="/privacy-policy"
                                className={styles.link}
                            >
                                こちらをご確認ください
                            </a>
                        </li>
                    </ul>
                </section>

            </div>

            <footer className={styles.footer}>
                &copy; 2026 BICSTATION AI LAB.
                All rights reserved.
            </footer>

        </div>
    );
}