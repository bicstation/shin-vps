'use client';

import styles from './Footer.module.css';
import { getSiteMetadata } from '@/shared/lib/utils/siteConfig';

export default function Footer() {

  const hostname =
    typeof window !== 'undefined'
      ? window.location.hostname
      : '';

  const site = getSiteMetadata(hostname);

  const networkLinks = (() => {

    switch (site.site_tag) {

      case 'tiper':
        return [
          { label: 'AVFLASH', href: 'https://avflash.xyz' },
          { label: 'BICSTATION', href: 'https://bicstation.com' },
          { label: 'BIC SAVING', href: 'https://bic-saving.com' },
        ];

      case 'avflash':
        return [
          { label: 'TIPER', href: 'https://tiper.live' },
          { label: 'BICSTATION', href: 'https://bicstation.com' },
          { label: 'BIC SAVING', href: 'https://bic-saving.com' },
        ];

      case 'bicstation':
        return [
          { label: 'BIC SAVING', href: 'https://bic-saving.com' },
        ];

      case 'saving':
        return [
          { label: 'BICSTATION', href: 'https://bicstation.com' },
        ];

      default:
        return [];
    }
  })();

  return (

    <footer className={styles.footer}>

      <div className={styles.footerGrid}>

        {/* ================================================
        ABOUT
        ================================================ */}
        <div>

          <h3>ABOUT</h3>

          <a href="/about">サイトについて</a>
          <a href="/guide">利用ガイド</a>

        </div>

        {/* ================================================
        NETWORK
        ================================================ */}
        <div>

          <h3>NETWORK</h3>

          {networkLinks.map(link => (
            <a
              key={link.label}
              href={link.href}
            >
              {link.label}
            </a>
          ))}

        </div>

        {/* ================================================
        SUPPORT
        ================================================ */}
        <div>

          <h3>SUPPORT</h3>

          <a href="/privacy">
            プライバシーポリシー
          </a>

          <a href="/terms">
            利用規約
          </a>

          <a href="/contact">
            お問い合わせ
          </a>

        </div>

      </div>

      <div className={styles.brand}>

        Powered by

        <span className={styles.brandStrong}>
          SHIN CORE LINX
        </span>

      </div>

      <div className={styles.copy}>
        © {new Date().getFullYear()} SHIN CORE LINX
      </div>

    </footer>
  );
}

