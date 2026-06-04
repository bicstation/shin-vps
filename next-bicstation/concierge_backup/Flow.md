# SHIN CORE LINX｜Concierge AI 新規指示用まとめ

## 1. 基本方針

1. **バックエンドがセマンティック権威**

   * 全ての推論、推薦、ランキングは backend semantic authority が統制。
   * frontend は **レンダリングとルーティング** のみ。

2. **フロー単位で指示**

   * 指示はフローごとに区切ると追跡しやすい。
   * 例：Conversation Flow、Recommendation Flow、Semantic Flow。

3. **使用する既存資料**

   * `ARCHITECTURE.md` … 全体構造・フロー階層の確認
   * `CONTRACTS.md` … 推奨・入力/出力ペイロード、型情報
   * `RUNTIME.md` … 実行フローとメモリ管理の把握
   * `SEMANTIC_GRAPH.md` … 推薦やランキングで利用されるグラフ構造

---

## 2. 指示準備の手順

1. **目的の明確化**

   * 例：ユーザーに最適なゲーミングPCを提案したい
   * 例：AI用途のPCをランキング形式で表示したい

2. **入力情報の整理**

   * ユーザー属性：用途（usage）、予算（budget）、好みのメーカーなど
   * 現状セッションやチャット文脈があれば付加

3. **参照フローの選定**

   * 会話指示 → `ConciergeConversationFlow`
   * 推薦指示 → `RecommendationFlow` または `SemanticRecommendationFlow`
   * ランキング → `RankingFlow`
   * フィンダー検索 → `FinderFlow`

4. **ペイロード作成**

   * `CONTRACTS.md` を参照し、SemanticFinderQuery や RecommendationPayload 形式に沿って作成
   * 例：

     ```ts
     const query: SemanticFinderQuery = {
       usage: 'usage-gaming',
       gpu: 'gpu-rtx-4080',
       budget: 250000
     }
     ```

5. **実行 / トランスポート呼び出し**

   * 適切な transport 関数を選択

     * `finderTransport(query)`
     * `rankingTransport(slug)`
     * `productTransport(unique_id)`
     * `semanticTransport(query)`

6. **出力確認**

   * レスポンス形式は `RecommendationPayload[]` や `SemanticAttribute[]` に統一
   * フロントレンダリング用に変換済みか確認

---

## 3. 指示例（テキスト形式）

```txt
目的: ユーザーに最適なゲーミングPCを推薦したい
ユーザー条件: 
  - 用途: ゲーミング (usage-gaming)
  - 予算: 250,000円以内
  - GPU: RTX 4080以上
参照フロー: RecommendationSemanticFlow
Transport: finderTransport(query)
期待出力: RecommendationPayload[]
備考: レスポンスには grouped_attributes と semantic_score を含むこと
```

---

## 4. 推奨作業フロー

1. **ARCHITECTURE.md** を参照して、フロー全体の位置を確認
2. **CONTRACTS.md** を参照して、入力/出力形式を確認
3. **RUNTIME.md** を参照して、セッションやメモリ連携を確認
4. **SEMANTIC_GRAPH.md** を参照して、関連ノードやエッジの活用を検討
5. **Transport 関数を呼び出す**
6. **レスポンスを検証し、フロントレンダリングに渡す**

---

この手順に従うことで、**新しい指示・クエリも統一フォーマットで簡単に作成可能**です。

---
