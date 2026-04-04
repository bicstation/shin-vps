// @ts-nocheck
import React from 'react';
import Link from 'next/link';
import SafeImage from '@/shared/components/atoms/SafeImage';
import { getSiteColor } from '@/shared/lib/utils/siteConfig';
import styles from './UnifiedCard.module.css';

interface UnifiedCardProps {
  data: any;         // 記事または商品データ
  siteConfig: any;   // getSiteMetadata の戻り値
}

const UnifiedProductCard = ({ data, siteConfig }: UnifiedCardProps) => {
  const { site_tag, site_name } = siteConfig;
  
  // 🎨 サイトごとのテーマカラーを取得
  const themeColor = getSiteColor(site_name);
  
  // 🔗 リンク先の自動判定 (ID または Slug)
  const identifier = data.slug || data.id;
  const detailUrl = `/${site_tag === 'tiper' ? 'post' : 'post'}/${identifier}`; // 共通なら /post/ でOK

  // 🖼️ 画像の確定
  const displayImage = data.image || data.main_image_url || '/img/no-image.png';

  return (
    <Link href={detailUrl} className={styles.cardContainer} style={{ '--theme-color': themeColor }}>
      <div className={styles.imageWrapper}>
        <SafeImage 
          src={displayImage} 
          alt={data.title} 
          className="object-cover w-full h-full"
        />
        {/* 🏷️ サイト名のバッジを動的に表示 */}
        <div className={styles.siteBadge} style={{ backgroundColor: themeColor }}>
          {site_name}
        </div>
      </div>
      
      <div className={styles.cardBody}>
        <h3 className={styles.title}>{data.title}</h3>
        <div className={styles.metaInfo}>
          <span className={styles.date}>
            {data.created_at ? new Date(data.created_at).toLocaleDateString('ja-JP') : 'NEW_ARCHIVE'}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default UnifiedProductCard;