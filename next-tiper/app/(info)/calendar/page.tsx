// サンプル発売日カレンダーのpage.tsxを作成てください。import React from 'react';
import StaticPageLayout from '@shared/static/StaticPageLayout';
import { Calendar as CalendarIcon, Clock, ChevronRight } from 'lucide-react';

export const metadata = {
  title: '発売スケジュール・カレンダー | tiper.live',
  description: '最新の新作動画・配信作品の発売スケジュールを網羅。期待の新作を逃さずチェックするためのカレンダーページです。',
};

// サンプルデータ（本来はDjango APIからfetchします）
const upcomingReleases = [
  { date: '2026-02-10', title: '期待の新作タイトル A', maker: 'ぎがdeれいん', id: 'jzt116' },
  { date: '2026-02-12', title: '注目の独占配信 B', maker: 'メーカー名B', id: 'abc200' },
  { date: '2026-02-15', title: 'シリーズ最新作 C', maker: 'メーカー名C', id: 'xyz789' },
  { date: '2026-03-01', title: '春の大型企画 D', maker: 'ぎがdeれいん', id: 'jzt120' },
];

export default function CalendarPage() {
  const toc = [
    { id: 'february', text: '2026年 2月の発売予定' },
    { id: 'march', text: '2026年 3月の発売予定' },
    { id: 'info', text: 'カレンダー情報の更新について' },
  ];

  return (
    <StaticPageLayout 
      title="Release Calendar"
      description="最新のエンターテインメントを、最速で。公開予定の作品を時系列で確認できます。"
      lastUpdated="2026年2月6日"
      toc={toc}
    >
      <section id="february">
        <div className="flex items-center gap-2 mb-6 border-b border-[#e83e8c]/30 pb-2">
          <CalendarIcon className="text-[#e83e8c]" size={24} />
          <h2 className="m-0">2026年 2月</h2>
        </div>
        
        <div className="space-y-4">
          {upcomingReleases.filter(r => r.date.startsWith('2026-02')).map((item) => (
            <div key={item.id} className="group bg-[#16162d] border border-white/5 p-4 rounded-xl hover:border-[#e83e8c]/50 transition-all flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="text-center min-w-[60px]">
                  <span className="block text-[10px] text-gray-500 uppercase font-black">FEB</span>
                  <span className="text-2xl font-black italic text-white">{item.date.split('-')[2]}</span>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-[#e83e8c] mb-1">{item.maker}</div>
                  <h3 className="text-sm font-bold text-gray-200 m-0 group-hover:text-white transition-colors">{item.title}</h3>
                </div>
              </div>
              <a href={`/adults/${item.id}`} className="p-2 bg-white/5 rounded-full group-hover:bg-[#e83e8c] transition-colors text-white">
                <ChevronRight size={18} />
              </a>
            </div>
          ))}
        </div>
      </section>

      <section id="march" className="mt-12">
        <div className="flex items-center gap-2 mb-6 border-b border-gray-700 pb-2">
          <CalendarIcon className="text-gray-500" size={24} />
          <h2 className="m-0 text-gray-400">2026年 3月</h2>
        </div>
        
        <div className="space-y-4 opacity-70">
          {upcomingReleases.filter(r => r.date.startsWith('2026-03')).map((item) => (
            <div key={item.id} className="bg-[#111122] border border-white/5 p-4 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="text-center min-w-[60px]">
                  <span className="block text-[10px] text-gray-500 uppercase font-black">MAR</span>
                  <span className="text-2xl font-black italic text-gray-500">{item.date.split('-')[2]}</span>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-gray-600 mb-1">{item.maker}</div>
                  <h3 className="text-sm font-bold text-gray-400 m-0">{item.title}</h3>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="info" className="mt-16 p-6 bg-blue-900/10 border border-blue-500/20 rounded-2xl">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="text-blue-400" size={20} />
          <h3 className="m-0 text-blue-400 text-sm font-black uppercase">Information</h3>
        </div>
        <p className="text-xs text-gray-400 leading-relaxed">
          掲載されている発売予定日は、各メーカーおよび配信プラットフォームのAPIから取得した一次情報に基づいています。制作上の都合や権利関係により、予告なく発売日が変更・延期される場合があります。
          正確な最新情報については、各作品詳細ページから遷移できる公式サイトにて、購入前に必ずご確認ください。
        </p>
      </section>
    </StaticPageLayout>
  );
}