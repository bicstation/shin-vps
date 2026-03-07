/* VisualSection.tsx */
import AdultProductGallery from '@/shared/components/organisms/cards/AdultProductGallery';
import RadarChart from '@/shared/components/atoms/RadarChart';

/**
 * 💡 VisualSection
 * 親から渡されたデータを整理し、ジャケット、ギャラリー、
 * レーダーチャート、および詳細ステータス（棒グラフ）を表示します。
 */
export default function VisualSection({ 
  product, 
  jacketImage, 
  galleryImages, 
  radarData, 
  barChartData, // 👈 追加：親から渡された棒グラフ用データ
  movieData, 
  source 
}) {
  return (
    <section className="space-y-8">
      {/* 1. メインジャケット・ビジュアル */}
      <div className="relative group overflow-hidden border border-white/10 rounded-sm shadow-2xl">
        <img 
          src={jacketImage} 
          alt={product.title} 
          className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105" 
        />
        <div className="absolute top-0 left-0 bg-[#e94560] text-white text-[8px] font-black px-2 py-1 uppercase italic tracking-wider">
          Identified_Object
        </div>
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/60 to-transparent opacity-50"></div>
      </div>
      
      {/* 2. サンプルギャラリー・動画プレビュー */}
      <div className="bg-black/40 p-2 border border-white/5 backdrop-blur-sm">
        <AdultProductGallery 
          images={galleryImages} 
          title={product.title} 
          apiSource={source} 
          sampleMovieData={movieData} 
        />
      </div>

      {/* 3. 解析データ・セクション (レーダー & 棒グラフ) */}
      <div className="flex flex-col gap-6 p-6 bg-black/60 border border-white/10 relative overflow-hidden rounded-xl shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]">
        
        {/* A. レーダーチャート (PC表示のみ) */}
        <div className="hidden md:flex flex-col items-center border-b border-white/5 pb-8">
          <span className="text-[9px] font-black text-[#00d1b2] mb-6 tracking-[0.5em] uppercase opacity-70">
            Core_Attribute_Balance
          </span>
          <div className="w-full h-[200px] flex items-center justify-center">
            <RadarChart data={radarData} />
          </div>
        </div>

        {/* B. 詳細ステータス・棒グラフ (全デバイス表示) */}
        <div className="space-y-4">
          <span className="text-[9px] font-black text-gray-500 tracking-[0.4em] uppercase">
            Neural_Stat_Analysis
          </span>
          
          <div className="space-y-4">
            {barChartData && barChartData.map((stat, idx) => (
              <div key={idx} className="group">
                <div className="flex justify-between items-end mb-1 px-1">
                  <span className="text-[10px] font-mono font-bold text-gray-400 group-hover:text-white transition-colors">
                    {stat.label}
                  </span>
                  <span className="text-[10px] font-mono text-[#00d1b2] font-black italic">
                    {stat.value}<span className="text-[8px] opacity-50 ml-0.5">%</span>
                  </span>
                </div>
                
                {/* ゲージの外枠 */}
                <div className="h-[3px] w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                  {/* ゲージの本体 */}
                  <div 
                    className={`h-full ${stat.color} transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(0,0,0,0.5)]`}
                    style={{ 
                      width: `${stat.value}%`,
                      boxShadow: `0 0 12px ${stat.color.replace('bg-', '')}` // 色に応じたネオン効果
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 装飾用の走査線エフェクト */}
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,0,0.01),rgba(0,0,255,0.02))] bg-[length:100%_2px,3px_100%]"></div>
      </div>
    </section>
  );
}