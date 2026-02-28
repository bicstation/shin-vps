/* eslint-disable @next/next/no-img-element */
// @ts-nocheck
// /home/maya/dev/shin-vps/shared/layout/Sidebar/SidebarWrapper.tsx
import AdultSidebar from './AdultSidebar';
import { 
  fetchGenres, 
  fetchMakers, 
  fetchActresses, 
  fetchSeries, 
  fetchDirectors, 
  fetchAuthors, 
  fetchLabels,
  fetchAdultAttributes 
} from '@/shared/lib/api/django/adult';
import { getSiteMainPosts } from '@/shared/lib/api/wordpress';

export default async function SidebarWrapper() {
  /**
   * 💡 並列で全データを一括取得 (High-Speed Fetching)
   * 1つでもコケても全体を止めないよう、個別に catch 処理を徹底。
   */
  const [
    aiAttributes, 
    genresData, 
    makersData, 
    actressesData, 
    seriesData, 
    directorsData, 
    authorsData, 
    labelsData, 
    wpData
  ] = await Promise.all([
    fetchAdultAttributes().catch(() => []), 
    fetchGenres({ limit: 15 }).catch(() => ({ results: [] })),
    fetchMakers({ limit: 15 }).catch(() => ({ results: [] })),
    fetchActresses({ limit: 15, ordering: '-profile__ai_power_score' }).catch(() => ({ results: [] })),
    fetchSeries({ limit: 15 }).catch(() => ({ results: [] })),
    fetchDirectors({ limit: 15 }).catch(() => ({ results: [] })),
    fetchAuthors({ limit: 15 }).catch(() => ({ results: [] })),
    fetchLabels({ limit: 15 }).catch(() => ({ results: [] })),
    getSiteMainPosts(0, 5).catch(() => ({ results: [] })),
  ]);

  /**
   * 💡 AdultSidebarに渡すPropsの整形
   * APIのレスポンス形式が { results: [...] } か [...] かを意識して展開します。
   */
  const sidebarProps = {
    // 🤖 AI解析特化属性 (熟女、巨乳、4K、VR等)
    aiAttributes: Array.isArray(aiAttributes) ? aiAttributes : [], 
    
    // 🏷️ 各種タクソノミー (上位15件)
    genres: genresData?.results || [],
    makers: makersData?.results || [],
    actresses: actressesData?.results || [],
    series: seriesData?.results || [],
    directors: directorsData?.results || [],
    authors: authorsData?.results || [],
    labels: labelsData?.results || [],

    // 📰 WordPressの最新記事
    recentPosts: (wpData?.results || []).map((p: any) => ({
      id: p.id.toString(),
      title: p.title?.rendered || 'No Title',
      slug: p.slug
    }))
  };

  // 🚀 クライアントコンポーネントまたは表示用コンポーネントへ流し込み
  return <AdultSidebar {...sidebarProps} />;
}