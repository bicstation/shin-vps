// /home/maya/shin-vps/next-bicstation/app/series/10-bto-masters/creative/data.ts
// /home/maya/shin-vps/next-bicstation/app/series/10-bto-masters/creative/data.ts
import { Episode, BTO_SERIES_CONFIG } from '../data';

const CREATIVE_TITLES = {
  phase1: [
    "コア数という名の正義：並列処理の基礎",
    "メモリ32GBは最低人権：スワップを殺せ",
    "システムドライブの分離：OSと素材を混ぜるな",
    "プレビューの滑らかさ：プロキシ編集の魔術",
    "電源容量の計算：レンダリング時のフルパワーに備える",
    "モニターの演色性：sRGB100%から始まる世界",
    "バックアップの鉄則：3-2-1ルールの導入",
    "スクラッチディスク設定：アプリの作業領域を最適化",
    "静音性能：ノイズはクリエイティビティを削る",
    "守護者の誕生：20万円で始める制作環境"
  ],
  phase2: [
    "GPUアクセラレーション：ハードウェアエンコードの威力",
    "NVMe Gen4の世界：4K素材の瞬時読み込み",
    "メモリ64GBへの昇格：After EffectsのRAMプレビュー",
    "10bitカラーの世界：階調飛びを防ぐ接続法",
    "RAID 0の構築：編集用ドライブの速度限界突破",
    "外部コントロール：左手デバイスによる直感操作",
    "冷却の重要性：1時間以上の書き出しを耐え抜く",
    "フォント管理：OSを重くしないライブラリ構築",
    "キャリブレーション：色が『ズレていない』という自信",
    "執行者の進撃：40万円の処理能力"
  ],
  phase3: [
    "マルチGPU構成：3DCGレンダリングの最適解",
    "10GbE導入：NASとのシームレスな素材共有",
    "ECCメモリの検討：長時間作業の絶対的安定性",
    "Thunderbolt 4の活用：外付け高速ストレージの真価",
    "オーディオインターフェース：音の解像度を上げる",
    "UPS（無停電電源装置）：数時間の作業を雷から守る",
    "キャプチャカード：最高画質の配信環境構築",
    "マザーボードのVRM：多コアCPUをフル回転させる土台",
    "プロジェクトアーカイブ：納品データの長期保存術",
    "賢者の境地：70万円の映像制作ステーション"
  ],
  phase4: [
    "家具解禁：4Kトリプルモニターアームの構築",
    "ルームアコースティック：吸音材と音場補正",
    "200V電源工事：大出力ワークステーションの安定",
    "LTOテープドライブ：一生消さないための物理バックアップ",
    "スタジオ空調：PCの熱を人間から分離する",
    "予備マシンの常駐：トラブル即復帰の冗長化",
    "クリエイティブ要塞の照明：目の疲労を最小限に",
    "完全静音・水冷サーバーラックの導入",
    "環境の完成：表現の自由を手に入れる",
    "覇者の称号：150万円の創造神殿"
  ]
};

const CREATIVE_HINTS = {
  phase1: "CPUのコア数は多ければ良いわけではない。アプリが使う実効スレッド数を見極めろ。",
  phase2: "書き出し速度よりも、編集中の『プレビューの引っかかり』を消すことに予算を割け。",
  phase3: "ストレージは速度(NVMe)と容量(HDD/NAS)の階層管理を徹底し、ボトルネックを潰せ。",
  phase4: "最終的なアウトプットの質は、機材だけでなく『座り続けるための環境』に依存する。"
};

export const getCreativeEpisodes = (): Episode[] => {
  return Array.from({ length: 40 }, (_, i) => {
    const vol = i + 1;
    let phaseKey: keyof typeof CREATIVE_TITLES = 'phase1';
    let titleIdx = i;

    if (vol <= 10) { phaseKey = 'phase1'; titleIdx = i; }
    else if (vol <= 20) { phaseKey = 'phase2'; titleIdx = i - 10; }
    else if (vol <= 30) { phaseKey = 'phase3'; titleIdx = i - 20; }
    else { phaseKey = 'phase4'; titleIdx = i - 30; }

    return {
      volume: vol,
      title: `Vol.${vol}: ${CREATIVE_TITLES[phaseKey][titleIdx]}`,
      slug: `vol${vol}`,
      technicalHint: CREATIVE_HINTS[phaseKey],
      isFurnitureUnlocked: vol >= 31
    };
  });
};

export const CREATIVE_SERIES_DETAIL = {
  ...BTO_SERIES_CONFIG.creative,
  episodes: getCreativeEpisodes()
};