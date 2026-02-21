/* VisualSection.tsx */
import AdultProductGallery from '@shared/cards/AdultProductGallery';
import RadarChart from '@shared/ui/RadarChart';

export default function VisualSection({ product, jacketImage, galleryImages, radarData, movieData, source }) {
  return (
    <section className="space-y-8">
      <div className="relative group overflow-hidden border border-white/10 rounded-sm">
        <img src={jacketImage} alt={product.title} className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105" />
        <div className="absolute top-0 left-0 bg-[#e94560] text-white text-[8px] font-black px-2 py-1 uppercase italic">Identified_Object</div>
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/60 to-transparent opacity-50"></div>
      </div>
      
      <div className="bg-black/40 p-2 border border-white/5">
        <AdultProductGallery images={galleryImages} title={product.title} apiSource={source} sampleMovieData={movieData} />
      </div>

      <div className="hidden md:flex flex-col items-center p-8 bg-black/60 border border-white/5 relative overflow-hidden rounded-xl">
        <span className="text-[9px] font-black text-[#00d1b2] mb-6 tracking-[0.5em] uppercase">Core_Attribute_Balance</span>
        <RadarChart data={radarData} />
      </div>
    </section>
  );
}