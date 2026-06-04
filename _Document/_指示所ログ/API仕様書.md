# SHIN CORE LINX｜Semantic Runtime API Architecture

## 概要

SHIN CORE LINX は、
従来の「スペック比較サイト」ではなく、

```text
Semantic Exploration Platform
```

を目指す。

つまり：

* 単なる商品データ返却
* 単なる絞り込み
* 単なるカテゴリ分類

ではなく、

```text
「人間の目的・意図・体験」
```

を backend が意味理解し、
frontend が cinematic に描画する構造。

---

# アーキテクチャ思想

## Backend

```text
Semantic Authority
```

責務：

* 意味推論
* workflow inference
* semantic scoring
* exploration graph
* semantic grouping
* discovery runtime
* adaptive runtime generation

---

## Frontend

```text
Human Experience Renderer
```

責務：

* UI描画
* cinematic motion
* hover interaction
* rail continuity
* adaptive layout
* visual exploration

---

# Core API Structure

Base Endpoint:

```text
/api/general/
```

---

# 1. Ranking Runtime API

## Endpoint

```text
/api/general/pc-products/ranking/
```

---

## 役割

```text
探索入口（Discovery Entry Point）
```

ユーザーが最初に世界へ入る場所。

---

## Backend Responsibility

backend が：

* semantic ranking
* intent weighting
* workflow relevance
* exploration continuity

を判断する。

---

## Frontend Responsibility

frontend は：

* rail rendering
* hover runtime
* adaptive cards
* cinematic layout

のみを担当。

---

## Example Payload

```json
{
  "semantic_score": 92,
  "semantic_labels": [
    "動画編集",
    "高冷却",
    "長期運用向け"
  ],
  "workflow_tags": [
    "creator",
    "streaming"
  ],
  "grouped_attributes": {},
  "semantic_runtime": {}
}
```

---

# 2. Product Detail Runtime API

## Endpoint

```text
/api/general/pc-products/<unique_id>/
```

---

## 役割

```text
Semantic Hub
```

単なる商品詳細ではなく：

```text
「このPCは何者か」
```

を返す。

---

## Backend Responsibility

backend は：

* identity inference
* workflow suitability
* strengths / weaknesses
* semantic relationships
* adaptive runtime

を返す。

---

## Example Payload

```json
{
  "identity": {},
  "semantic_profile": {},
  "workflow_fit": {},
  "strengths": [],
  "weaknesses": [],
  "recommended_for": [],
  "semantic_related": []
}
```

---

# 3. Related Runtime API

## Endpoint

```text
/api/general/pc-products/<unique_id>/related/
```

---

## 従来ECとの違い

普通のEC：

```text
同カテゴリ商品
```

SHIN CORE LINX：

```text
Semantic Continuation
```

---

## Backend Responsibility

backend が返すべきもの：

```text
「次に見るべきPC」
```

。

---

## Semantic Graph Example

```text
配信向け
↓
動画編集向け
↓
AI生成向け
↓
3D制作向け
```

これは：

```text
Workflow Continuity Graph
```

。

---

# 4. Semantic Discovery Runtime API

## Endpoint

```text
/api/general/semantic/discovery/
```

---

## 役割

```text
Exploration Runtime
```

。

frontend の cinematic shelves を backend が意味生成する。

---

## Example Payload

```json
{
  "semantic_runtime": "v1",
  "semantic_authority": "backend",
  "semantic_shelves": []
}
```

---

# 5. Semantic Shelves API

## Endpoint

```text
/api/general/semantic/shelves/
```

---

## 役割

```text
Adaptive Exploration Rails
```

。

例えば：

* Gaming Shelf
* Creator Shelf
* AI Workstation Shelf
* Portable Work Shelf

などを backend が生成。

---

# 6. Semantic Finder API

## Endpoint

```text
/api/general/finder/
```

---

## 役割

```text
Human Intent Navigation
```

。

従来の：

```text
Spec Filtering
```

ではなく、

```text
「何をしたいか」
```

で探索する。

---

## Example Payload

```json
{
  "intent": "動画編集したい",
  "semantic_matches": [],
  "workflow_matches": [],
  "confidence": 0.92
}
```

---

# Semantic Backend Core

## services/semantic/

backend semantic authority の中核。

---

## extractors.py

役割：

```text
スペック抽出
```

。

例：

* CPU
* GPU
* Memory
* Refresh Rate
* Display Type

---

## normalizers.py

役割：

```text
意味の正規化
```

。

例：

```text
RTX5070
↓
high_gpu
```

。

---

## product_classifier.py

役割：

```text
製品種別判定
```

。

例：

* gaming_pc
* creator_pc
* monitor
* workstation

---

## workflow_inference.py

役割：

```text
用途推論
```

。

例：

* gaming
* creator
* streaming
* ai_generation

---

## semantic_labels.py

役割：

```text
人間向け意味ラベル生成
```

。

例：

* 動画編集向け
* FPS向け
* 持ち運び重視

---

## semantic_graph.py

役割：

```text
意味的関連グラフ
```

。

単なる類似商品ではなく：

```text
目的地ベース接続
```

。

---

## semantic_shelves.py

役割：

```text
探索レール生成
```

。

---

## runtime_builder.py

役割：

```text
semantic runtime persistence
```

。

DBへ semantic_runtime を構築・保存。

---

## semantic_api_service.py

役割：

```text
Frontend-ready semantic payload generation
```

。

frontend 用 payload authority。

---

# Semantic Contract Philosophy

## Backend

```text
Meaning Authority
```

。

---

## Frontend

```text
Rendering Authority
```

。

---

# SHIN CORE LINX の本質

従来：

```text
Spec Comparison Site
```

。

現在：

```text
Semantic Exploration Platform
```

。

最終的には：

```text
Human Intent Operating Layer
```

を目指す。
