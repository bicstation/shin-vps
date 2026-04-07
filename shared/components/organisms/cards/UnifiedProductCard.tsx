// @ts-nocheck
import React from 'react';
import Link from 'next/link';
import SafeImage from '@/shared/components/atoms/SafeImage';
import { getSiteColor } from '@/shared/lib/utils/siteConfig';
import styles from './UnifiedCard.module.css';

interface UnifiedCardProps {
  data: any;     // 記事または商品データ
  siteConfig: any;   // getSiteMetadata の戻り値
}

const UnifiedProductCard = ({ data, siteConfig }: UnifiedCardProps) => {
  const { site_tag, site_name } = siteConfig;
  
  // 🎨 サイトごとのテーマカラーを取得
  const themeColor = getSiteColor(site_name);
  
  // 🔗 リンク先の自動判定
  const identifier = data.slug || data.id;
  const detailUrl = `/post/${identifier}`;

  // 🖼️ 画像の確定
  const displayImage = data.image || data.main_image_url || '/img/no-image.png';

  // 🔞 アダルト判定 (is_adult フラグ または site_tag からの判定)
  const isAdult = data.is_adult === true || ['tiper', 'avflash'].includes(data.site);

  return (
    <Link href={detailUrl} className={styles.cardContainer} style={{ '--theme-color': themeColor }}>
      <div className={styles.imageWrapper}>
        <SafeImage 
          src={displayImage} 
          alt={data.title} 
          className="object-cover w-full h-full"
        />
        {/* 🏷️ サイト名のバッジ */}
        <div className={styles.siteBadge} style={{ backgroundColor: themeColor }}>
          {site_name}
        </div>
        
        {/* 🔞 画像左上に18禁オーバーレイ (任意) */}
        {isAdult && (
          <div className={styles.adultOverlay}>18+</div>
        )}
      </div>
      
      <div className={styles.cardBody}>
        <h3 className={styles.title}>
          {/* 🚨 アダルトタイトルの先頭にアイコンを追加 */}
          {isAdult && (
            <span className={styles.adultIcon} title="18禁コンテンツ">
              🔞
            </span>
          )}
          {data.title}
        </h3>
        <div className={styles.metaInfo}>
          <span className={styles.date}>
            {data.created_at ? new Date(data.created_at).toLocaleDateString('ja-JP') : 'NEW_ARCHIVE'}
          </span>
          {/* 🏷️ タグとしての18禁表示 */}
          {isAdult && <span className={styles.adultTag}>R18</span>}
        </div>
      </div>
    </Link>
  );
};

export default UnifiedProductCard;