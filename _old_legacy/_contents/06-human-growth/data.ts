export interface CareerGuideItem {
  vol: number;
  title: string;
  description: string;
  category: "初級編" | "中級編" | "上級編";
  tags: string[];
}

export const CAREER_GUIDE_DATA: CareerGuideItem[] = [
  // --- 初級編: マインドセットと学習の継続 ---
  { vol: 151, title: "エンジニアという『生き方』の再定義", description: "一生勉強が続く世界へようこそ。変化を楽しみ、技術で課題を解決する悦びを語る。", category: "初級編", tags: ["Mindset", "Life"] },
  { vol: 152, title: "挫折しないための学習ログと習慣化術", description: "モチベーションに頼らない。記録（第2章）を武器に、歩みを止めないための仕組み作り。", category: "初級編", tags: ["Habit", "Study"] },
  { vol: 153, title: "英語ドキュメントへの恐怖心を克服する", description: "最新情報は常に英語。翻訳AI（第3章）を使いこなし、一次ソースに直接アクセスする。 ", category: "初級編", tags: ["English", "AI"] },
  { vol: 154, title: "エラー解決の技術：デバッグは推理だ", description: "詰まった時こそ成長のチャンス。論理的な仮説検証のステップと、質問力の極意。", category: "初級編", tags: ["Debugging", "SoftSkills"] },
  { vol: 155, title: "コンピュータサイエンスの『地図』を持つ", description: "流行に惑わされない。アルゴリズム、OS、ネットワーク。基礎があなたを支える。", category: "初級編", tags: ["CS", "Foundation"] },
  { vol: 156, title: "情報の取捨選択：何を学び、何を捨てるか", description: "技術の洪水に溺れない。自分軸に沿った『学習の優先順位』を決める論理的判断。", category: "初級編", tags: ["Strategy", "Learning"] },
  { vol: 157, title: "OSS（オープンソース）への貢献と参加", description: "使う側から作る側へ。世界中のコードに触れ、自分の名前を技術史に刻む第一歩。", category: "初級編", tags: ["OSS", "GitHub"] },
  { vol: 158, title: "コミュニティと勉強会：仲間の見つけ方", description: "独学の限界を超える。技術を分かち合えるライバルとメンターに出会うための社交術。", category: "初級編", tags: ["Community", "Meetup"] },
  { vol: 159, title: "アウトプットは最大のインプットである", description: "第2章の発信力をここで活かす。記事を書くことが、いかに理解を深めるかを実証。", category: "初級編", tags: ["Output", "Writing"] },
  { vol: 160, title: "初級編総括：『初心』という最強の武器", description: "技術がどれほど進化しても、学び続ける姿勢（ビギナーズ・マインド）の重要性。", category: "初級編", tags: ["Summary"] },

  // --- 中級編: 実戦投入とAIデバッグの技術 ---
  { vol: 161, title: "選ばれるポートフォリオの作り方（実戦版）", description: "「何ができるか」ではなく「何を解決したか」を。第5章で作ったサイトを昇華させる。", category: "中級編", tags: ["Portfolio", "Design"] },
  { vol: 162, title: "新職種：AIデバッグエンジニアの台頭", description: "AIが生成したコードの正当性を検証し、ハルシネーションを見抜く次世代エンジニアの役割。", category: "中級編", tags: ["AIDebug", "NewCareer"] },
  { vol: 163, title: "AIを部下にする：生成コードのディレクション術", description: "自分で書くより速く、正確にAIを操る。的確な修正プロンプトを投げるための論理思考。", category: "中級編", tags: ["Direction", "AI"] },
  { vol: 164, title: "フリーランスか正社員か：キャリアの二択", description: "自由と安定、それぞれのメリット・デメリットを現代のエンジニア市場から紐解く。", category: "中級編", tags: ["Career", "Work"] },
  { vol: 165, title: "エンジニアの単価交渉と営業のロジック", description: "技術を安売りしない。自分の市場価値を理解し、適切に交渉するためのビジネススキル。", category: "中級編", tags: ["Business", "Negotiation"] },
  { vol: 166, title: "チーム開発の作法：コードレビューの文化", description: "一人の限界を超える。プルリクエストの出し方、相手を尊重するレビューの技術。", category: "中級編", tags: ["Team", "Git"] },
  { vol: 167, title: "アジャイル開発とタスク管理のリアリティ", description: "納期と品質のバランスをどう取るか。現場で使われる開発手法の理想と現実。", category: "中級編", tags: ["Agile", "Management"] },
  { vol: 168, title: "UI/UXデザインへの越境：使う人を想う", description: "コードだけ書く人は淘汰される。第4章の空間設計を活かした、使いやすい体験の追求。", category: "中級編", tags: ["UX", "Design"] },
  { vol: 169, title: "技術試験（コーディングテスト）対策", description: "有名企業への登竜門。LeetCode等を活用したアルゴリズム・スキル突破法。", category: "中級編", tags: ["Interview", "Algorithm"] },
  { vol: 170, title: "中級編総括：プロとしての自覚と実力", description: "アマチュアを卒業し、対価を得て価値を提供する「プロ」としての立ち位置を確認。", category: "中級編", tags: ["Summary"] },

  // --- 上級編: キャリア戦略と未来の展望 ---
  { vol: 171, title: "フルスタック＋AIエンジニアの最強戦略", description: "インフラからフロント、AIまで。全章を制覇したあなただけの圧倒的市場優位性。", category: "上級編", tags: ["FullStack", "AI"] },
  { vol: 172, title: "CTO / テックリード：技術で組織を率いる", description: "コードから経営へ。技術選定の責任を負い、チームを成功に導くリーダー像。", category: "上級編", tags: ["Leadership", "CTO"] },
  { vol: 173, title: "起業とプロダクト開発：自分のサービスを世へ", description: "受託ではなく自社開発。世界の問題を解決するアプリケーションを立ち上げる論理。", category: "上級編", tags: ["Startup", "Product"] },
  { vol: 174, title: "AI時代の生存戦略：『人間による最終承認』の価値", description: "AIが書いたコードの責任は誰が取るのか？『責任を取れる人間』としての信頼構築。", category: "上級編", tags: ["Responsibility", "Trust"] },
  { vol: 175, title: "AIエージェントによる自動開発プロセスの構築", description: "開発そのものをAIに自動化させる。第5章の知識を使い、自分専用のAI開発チームを持つ。", category: "上級編", tags: ["Automation", "AI_Agent"] },
  { vol: 176, title: "生涯エンジニア：技術と寄り添う老後と健康", description: "第4章の健康管理を礎に。長く、楽しく技術の世界に居続けるための心身ケア。", category: "上級編", tags: ["Health", "LongTerm"] },
  { vol: 177, title: "海外リモートとデジタルノマドの現実", description: "日本の外へ。ドルで稼ぎ、好きな場所で暮らすための技術とネットワーク戦略。", category: "上級編", tags: ["Nomad", "Global"] },
  { vol: 178, title: "教育者としての道：次世代に知を繋ぐ", description: "このサイトのように、自らの知見を体系化し、後に続く者を育てる悦び。", category: "上級編", tags: ["Education", "Giving"] },
  { vol: 179, title: "180講の旅：あなたが手に入れた真の資産", description: "ハード・ソフト・AI・物理・開発・キャリア。統合された知性が生む「自由」。", category: "上級編", tags: ["Synthesis", "Freedom"] },
  { vol: 180, title: "グランドフィナーレ：そして伝説へ", description: "これは終わりではない。磨き抜かれた武器を手に、新しい世界へ踏み出す出発点。", category: "上級編", tags: ["Final", "TheBeginning"] }
];