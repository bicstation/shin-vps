// 共通のレイアウトとロジックを持つコンポーネント
export default function ArchiveTemplate({ 
  products, totalCount, platform, title, makers, currentSort, currentOffset, basePath, extraParams 
}: any) {
  return (
    <div className={styles.pageWrapper} data-platform={platform}>
      {/* 共通のヘッダー・サイドバー・グリッド・ページネーションをここに集約 */}
      {/* 前に作成した VideoArchive.module.css を適用 */}
    </div>
  );
}