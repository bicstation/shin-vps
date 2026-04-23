/**
 * BICSTATION - BTO Masters Series: Global Architecture
 * Series 30: BTO VENDOR ANALYSIS (メーカー別徹底考察編)
 * 44年の知見で解剖する、メーカー各社の設計思想と要塞基盤としての適正
 */
// /home/maya/shin-dev/shin-vps/next-bicstation/content-data/category4_bto_makers.ts

export const BTO_MAKERS_CONFIG: Record<string, BtoSeries> = {
  // --- 初級編：国内BTOメーカー ---
  domestic: {
    id: "domestic",
    order: 1,
    title: "初級編：国内BTOメーカー10選（日本の礎）",
    concept: "緻密な品質管理と国内生産の信頼性。物理要塞の入門として最適な10の選択肢。",
    priorityDevice: "独自筐体・国内サポート・即納体制・産業用オプション",
    phases: [
      {
        budget: "¥150,000〜¥500,000",
        label: "Phase 01: 国内大手と老舗の設計思想",
        focus: "標準構成のバランスと、長期間の安定稼働への信頼",
        environment: "一般オフィス・個人執務室・小規模スタジオ",
        episodes: [
          { ep: 1, title: "ドスパラ (GALLERIA)：独自筐体のエアフロー構造と演算密度" },
          { ep: 2, title: "マウスコンピューター (G-Tune/DAIV)：国内生産がもたらす精度の正体" },
          { ep: 3, title: "パソコン工房 (LEVEL∞)：ユニットコムの巨大資本による高コスパ要塞" },
          { ep: 4, title: "サイコム (Sycom)：職人の『手による配線』がもたらす熱効率の極致" },
          { ep: 5, title: "ツクモ (G-GEAR)：老舗のパーツ選定眼が選ぶ、壊れないマザーボード" },
          { ep: 6, title: "フロンティア (FRONTIER)：究極のセール価格と、質実剛健な電源選定" },
          { ep: 7, title: "セブン (PC4U)：ハイエンドパーツの自由度が拓く、物理要塞の多様性" },
          { ep: 8, title: "ストーム (STORM)：背面コネクタと白い筐体。視覚的要塞の美学" },
          { ep: 9, title: "アーク (ark)：秋葉原の魂を宿した、サンフランシスコ的な尖った構成" },
          { ep: 10, title: "VSPEC：マザーボードから指定。フルカスタマイズの迷宮へようこそ" }
        ]
      }
    ]
  },

  // --- 中級編：海外BTOメーカー ---
  global: {
    id: "global",
    order: 2,
    title: "中級編：海外BTO・ブランド10選（世界の暴力）",
    concept: "圧倒的な資本力と過剰なデザイン、そして世界規模のフィードバックから生まれる『力』。",
    priorityDevice: "独自チップセット・冷却ソリューション・ブランドバリュー",
    phases: [
      {
        budget: "¥300,000〜¥1,000,000",
        label: "Phase 02: 世界を席巻するパワーと独自哲学",
        focus: "コンシューマーの限界を超えたスペックと、所有欲を満たす要塞性",
        environment: "グローバル開発拠点・プロゲーミングルーム・デザインラボ",
        episodes: [
          { ep: 11, title: "Alienware (Dell)：宇宙船に宿る独自冷却システムとコマンドセンター" },
          { ep: 12, title: "Razer (Blade)：黒のアルミ削り出し筐体。ミニマリズム演算要塞" },
          { ep: 13, title: "Origin PC (Corsair)：Corsairパーツを全投入した、アメリカンマッスル" },
          { ep: 14, title: "Falcon Northwest：米国BTOの伝説。カスタムペイントに宿る執念" },
          { ep: 15, title: "Digital Storm：水冷システムのパイプライン美。液冷要塞の完成形" },
          { ep: 16, title: "XMG (Schenker)：欧州の合理性が詰まった、質実剛健なモバイル演算器" },
          { ep: 17, title: "Maingear：一つ一つ手作業で組まれる、ブティック系BTOの最高峰" },
          { ep: 18, title: "CyberPowerPC：全米をカバーする物量。標準規格の集合体としての強み" },
          { ep: 19, title: "iBuyPower：透明パネルとLCD。情報の可視化を極めたショーケースPC" },
          { ep: 20, title: "Puget Systems：『検証済み構成』こそが信頼。科学的なパーツ選定術" }
        ]
      }
    ]
  },

  // --- 上級編：ワークステーション専門 ---
  workstation: {
    id: "workstation",
    order: 3,
    title: "上級編：ワークステーション専門10選（演算の聖域）",
    concept: "DELL/HP/Lenovo以外の選択肢。特定の目的のためにハードウェアを屈服させる狂信者の領域。",
    priorityDevice: "Xeon/EPYC・ECCメモリ・ラックマウント・24/7連続稼働設計",
    phases: [
      {
        budget: "¥500,000〜¥10,000,000",
        label: "Phase 03: 産業・学術・未来を担う深淵の機体",
        focus: "ダウンタイムゼロの追求。1円の誤差も許さない、真の物理要塞",
        environment: "データセンター・大学研究室・AI開発ラボ・工場制御室",
        episodes: [
          { ep: 21, title: "Supermicro：サーバー界の巨人が放つ、24/7稼働前提の『鉄の塊』" },
          { ep: 22, title: "BOXX Technologies：特定アプリを最速で動かす、OCワークステーションの衝撃" },
          { ep: 23, title: "ASUS (ProArt/Pro WS)：コンシューマーの利便性と産業用耐久性の融合" },
          { ep: 24, title: "Puget Systems (WS)：ハードウェア相性を『科学』した、クリエイターの救世主" },
          { ep: 25, title: "JCS (日本コンピューティングシステム)：国産。学術演算に特化した不沈艦" },
          { ep: 26, title: "Elsa (Japan)：GPUのプロが仕立てる、映像・解析特化のグラフィック要塞" },
          { ep: 27, title: "Scan 3XS (UK)：イギリスの誇り。オーディオ・映像制作の極静音設計" },
          { ep: 28, title: "Velocity Micro：数々の賞を総なめにする、エンスージアスト向けWSの真髄" },
          { ep: 29, title: "AVADirect：数万通りの組み合わせ。構成の自由度という名の軍事力" },
          { ep: 30, title: "Apple (Mac Pro)：M2/M3 Ultra。独自アーキテクチャが描く異形の未来" }
        ]
      }
    ]
  }
};