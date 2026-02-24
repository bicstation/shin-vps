// /shared/layout/Sidebar/SidebarWrapper.tsx
import AdultSidebar from './AdultSidebar';
import { 
  fetchGenres, fetchMakers, fetchActresses, 
  fetchSeries, fetchDirectors, fetchAuthors, fetchLabels 
} from '@/shared/lib/api/django/adult';
import { getSiteMainPosts } from '@/shared/lib/api/wordpress';

export default async function SidebarWrapper() {
  // 並列で全データを取得
  const [
    genres, makers, actresses, series, 
    directors, authors, labels, wpData
  ] = await Promise.all([
    fetchGenres({ limit: 15 }).catch(() => ({ results: [] })),
    fetchMakers({ limit: 15 }).catch(() => ({ results: [] })),
    fetchActresses({ limit: 15 }).catch(() => ({ results: [] })),
    fetchSeries({ limit: 15 }).catch(() => ({ results: [] })),
    fetchDirectors({ limit: 15 }).catch(() => ({ results: [] })),
    fetchAuthors({ limit: 15 }).catch(() => ({ results: [] })),
    fetchLabels({ limit: 15 }).catch(() => ({ results: [] })),
    getSiteMainPosts(0, 5).catch(() => ({ results: [] })),
  ]);

  const sidebarProps = {
    genres: genres.results,
    makers: makers.results,
    actresses: actresses.results,
    series: series.results,
    directors: directors.results,
    authors: authors.results,
    labels: labels.results,
    recentPosts: wpData.results?.map((p: any) => ({
      id: p.id.toString(),
      title: p.title?.rendered,
      slug: p.slug
    }))
  };

  return <AdultSidebar {...sidebarProps} />;
}