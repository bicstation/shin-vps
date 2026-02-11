import { getUnifiedProducts, fetchMakers } from '@shared/lib/api/django';
import ArchiveTemplate from '../ArchiveTemplate'; 

export default async function DugaPage({ searchParams }: { searchParams: Promise<any> }) {
  const sParams = await searchParams; // Next 15の鉄則: searchParamsは必ずawait
  
  const offset = Number(sParams.offset) || 0;
  const ordering = sParams.ordering || '-release_date';

  const [data, makers] = await Promise.all([
    getUnifiedProducts({ api_source: 'duga', offset, ordering, limit: 24 }),
    fetchMakers()
  ]);

  return (
    <ArchiveTemplate 
      products={data.results}
      totalCount={data.count}
      platform="duga" // CSSでターコイズ色にするためのキー
      title="DUGA ARCHIVE"
      makers={makers}
      currentSort={ordering}
      currentOffset={offset}
      basePath="/duga"
    />
  );
}