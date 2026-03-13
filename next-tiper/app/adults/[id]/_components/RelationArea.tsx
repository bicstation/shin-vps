/* RelationArea.tsx */
import AdultProductCard from '@/shared/components/organisms/cards/AdultProductCard';

const RelationSection = ({ title, subTitle, products }) => {
  if (!products || products.length === 0) return null;
  return (
    <section>
      <div className="mb-10 border-l-2 border-[#e94560] pl-6">
        <h2 className="text-2xl md:text-4xl font-black italic text-white uppercase tracking-tighter">{title}</h2>
        <p className="text-[10px] text-[#e94560] font-black mt-2 tracking-[0.3em] uppercase opacity-60">{subTitle}</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-8">
        {products.map((p) => <AdultProductCard key={p.id} product={p} />)}
      </div>
    </section>
  );
};

export default function RelationArea({ actressRelated, genreRelated, makerRelated, product }) {
  return (
    <div className="space-y-32 mt-32">
      <RelationSection title="Cast_Network_Sync" subTitle={`From ${product.actresses?.[0]?.name}`} products={actressRelated} />
      <RelationSection title="Genre_Logic_Stream" subTitle={`Related #${product.genres?.[0]?.name}`} products={genreRelated} />
      <RelationSection title="Production_Archive" subTitle={`Sector output: ${product.maker?.name}`} products={makerRelated} />
    </div>
  );
}