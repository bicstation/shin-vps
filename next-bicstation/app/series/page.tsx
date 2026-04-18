import Link from 'next/link';
import { Cpu, ShieldCheck, Brain, Archive, ArrowRight } from 'lucide-react';

const seriesCategories = [
  {
    id: "01",
    title: "Physical Foundation",
    slug: "01-hardware",
    icon: <Cpu className="w-6 h-6" />,
    description: "BTO構成、10GbE、物理的防衛。10年戦える最強のインフラ構築術。",
    color: "from-blue-500 to-cyan-400"
  },
  {
    id: "02",
    title: "Environment & Security",
    slug: "02-software",
    icon: <ShieldCheck className="w-6 h-6" />,
    description: "セキュリティの要塞化、Docker、そして世界へのWEB公開実戦。",
    color: "from-emerald-500 to-teal-400"
  },
  {
    id: "03",
    title: "AI Logic & Development",
    slug: "03-ai-logic",
    icon: <Brain className="w-6 h-6" />,
    description: "Python × LLM。AIを「道具」から「相棒」へ変える知能の実装。",
    color: "from-purple-500 to-indigo-400"
  }
];

const archives = [
  { title: "AI Intelligence Engine", slug: "ai-intelligence-engine" },
  { title: "Modern Fullstack Roadmap", slug: "modern-fullstack-roadmap" },
  { title: "PHP MVC Legacy Project", slug: "php-mvc-legacy" }
];

export default function SeriesIndexPage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-12 bg-black text-white">
      {/* Header */}
      <div className="mb-16 border-l-4 border-emerald-500 pl-6">
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl mb-4">
          SERIES ARCHITECTURE
        </h1>
        <p className="text-gray-400 max-w-2xl">
          BICSTATIONの全知見を3つの階層に体系化。
          物理基盤からAIロジックまで、一貫した論理で構築する技術の要塞。
        </p>
      </div>

      {/* Main Layers (01-03) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
        {seriesCategories.map((cat) => (
          <Link key={cat.id} href={`/series/${cat.slug}`} className="group relative">
            <div className={`absolute -inset-0.5 bg-gradient-to-r ${cat.color} rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-500`}></div>
            <div className="relative bg-zinc-900 p-8 rounded-lg border border-zinc-800 leading-none flex flex-col h-full">
              <div className="flex items-center justify-between mb-6">
                <span className="text-zinc-500 font-mono text-sm">LAYER {cat.id}</span>
                <div className="text-emerald-400">{cat.icon}</div>
              </div>
              <h2 className="text-xl font-bold mb-4 group-hover:text-emerald-400 transition-colors">{cat.title}</h2>
              <p className="text-zinc-400 text-sm mb-8 flex-grow">{cat.description}</p>
              <div className="flex items-center text-xs font-bold text-emerald-500 uppercase tracking-widest">
                Explore Series <ArrowRight className="ml-2 w-4 h-4" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Archive Section */}
      <div className="pt-12 border-t border-zinc-800">
        <div className="flex items-center mb-8 text-zinc-500">
          <Archive className="mr-2 w-5 h-5" />
          <h2 className="text-lg font-mono uppercase tracking-widest">Knowledge Archives</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {archives.map((arc) => (
            <Link 
              key={arc.slug} 
              href={`/series/99-archive/${arc.slug}`} 
              className="p-4 bg-zinc-950 border border-zinc-900 rounded hover:border-zinc-700 hover:bg-zinc-900 transition-all group flex items-center justify-between"
            >
              <span className="text-zinc-400 group-hover:text-zinc-200 text-sm font-medium">{arc.title}</span>
              <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-emerald-500" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}