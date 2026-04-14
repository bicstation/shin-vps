import Link from 'next/link'

const posts = [
  { 
    id: 1, 
    slug: 'vol-1', 
    title: '第1回：2008年、なべ塾開校とゆこゆこの500円', 
    description: '1件500円を数千回積み上げた「仕組み」の原点。リンクシェアのCSVと過ごした日々。' 
  },
  { 
    id: 2, 
    slug: 'vol-2', 
    title: '第2回：再構築ボタンとFTPの転送音', 
    description: 'Movable Typeの再構築が終わるのを待っていたあの夜。静的HTML量産が教えてくれた資産の概念。' 
  },
  { 
    id: 3, 
    slug: 'vol-3', 
    title: '第3回：月200万の絶頂と、忍び寄る「pbic.info」の終焉', 
    description: 'ネットの海に網を張り巡らせていた黄金期。しかしGoogleのアルゴリズムは静かに牙を剥いていた。' 
  },
  { 
    id: 4, 
    slug: 'vol-4', 
    title: '第4回：2016年、暗転。検索結果から「私」が消えた日', 
    description: '突然のアップデート被弾。昨日までの「正解」がゴミクズに変わる絶望と、ドメインを手放した日のこと。' 
  },
  { 
    id: 5, 
    slug: 'vol-5', 
    title: '第5回：10年間の沈黙と、捨てられなかった「nabejuku.com」', 
    description: '塾経営の傍ら、メールサーバーとしてだけ生き残った老舗ドメイン。なぜこれだけは守り抜いたのか。' 
  },
  { 
    id: 6, 
    slug: 'vol-6', 
    title: '第6回：Next.jsとの出会い：量産から「構築」へのパラダイムシフト', 
    description: '久しぶりにコードを叩いた元アフィリエイターが驚いた、App RouterやSSGという現代の武器。' 
  },
  { 
    id: 7, 
    slug: 'vol-7', 
    title: '第7回：節約は「負けないアフィリエイト」である', 
    description: '他人の予約を待つのではなく、自分の支出（ガソリン・決済）を確実にデバッグする快感。' 
  },
  { 
    id: 8, 
    slug: 'vol-8', 
    title: '第8回：エンジニアの眼で「リッター7円引き」を最適化する', 
    description: 'かつてCSVをこねくり回したその指で、今は三井住友カードとd払いの還元ルートを組んでいる。' 
  },
  { 
    id: 9, 
    slug: 'vol-9', 
    title: '第9回：AI時代に「愚痴」を武器にするE-E-A-T戦略', 
    description: 'きれいなAI文章には書けない「泥水をすすった経験」が、今のGoogleに評価される皮肉と真実。' 
  },
  { 
    id: 10, 
    slug: 'vol-10', 
    title: '第10回：再起のBic-Saving。これが私の「なべ塾 2.0」だ。', 
    description: '過去を供養し、技術と知恵で「新しい自由」を手に入れる。17年の時を経て辿り着いた結論。' 
  },
];
export default function RebuildLogsPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <h1 className="text-3xl font-bold mb-8 border-b pb-4">
        Googleにすべてを奪われた男の「再構築」ログ
      </h1>
      <p className="text-gray-600 mb-10">
        かつて月200万を稼ぎ出したアフィリエイターが、10年の時を経てNext.jsで再起するまでの軌跡。
      </p>
      
      <div className="space-y-6">
        {posts.map((post) => (
          <Link key={post.id} href={`/series/rebuild-logs/${post.slug}`} className="block p-6 border rounded-lg hover:bg-gray-50 transition">
            <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
            <p className="text-gray-500 text-sm">{post.description}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}