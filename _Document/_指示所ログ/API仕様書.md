# SHIN CORE LINX｜PC Semantic Commerce API v1

Version: `semantic_schema_version = 1`
Base URL:

```txt
/api/general/
```

---

# 1. Ranking API

## Endpoint

```txt
GET /api/general/pc-products/ranking/
```

---

# Query Parameters

| Parameter | Type   | Description |
| --------- | ------ | ----------- |
| use       | string | ranking用途   |

---

# use Values

| Value    | Description |
| -------- | ----------- |
| score    | 総合ランキング     |
| gaming   | ゲーミング重視     |
| creator  | クリエイター向け    |
| business | 法人・事務向け     |
| ai       | AI/NPU重視    |

---

# Example

```txt
GET /api/general/pc-products/ranking/?use=gaming
```

---

# Response

```json
[
  {
    "unique_id": "2557_xxxxx",
    "name": "Gaming PC",
    "price": 198000,
    "spec_score": 92
  }
]
```

---

# 2. Product Detail API

## Endpoint

```txt
GET /api/general/pc-products/<unique_id>/
```

---

# Example

```txt
GET /api/general/pc-products/2557_per26020a/
```

---

# Response Fields

| Field                   | Description             |
| ----------------------- | ----------------------- |
| unique_id               | 商品ユニークID                |
| name                    | 商品名                     |
| maker                   | メーカー                    |
| price                   | 価格                      |
| image_url               | 商品画像                    |
| description             | 商品説明                    |
| cpu_model               | CPU                     |
| gpu_model               | GPU                     |
| memory_gb               | メモリ                     |
| storage_gb              | ストレージ                   |
| spec_score              | 総合性能                    |
| radar_chart             | レーダーチャート                |
| ai_summary              | AI要約                    |
| attributes              | semantic属性一覧            |
| grouped_attributes      | semantic分類済み属性          |
| semantic_schema_version | semantic schema version |

---

# grouped_attributes

## Example

```json
{
  "grouped_attributes": {
    "device": [],
    "usage": [],
    "maker": [],
    "gpu": [],
    "cpu": [],
    "memory": []
  }
}
```

---

# Semantic Attribute Structure

```json
{
  "id": 121,
  "type": "device",
  "slug": "device-server",
  "name": "サーバー",
  "semantic_role": "highlight",
  "semantic_weight": 0.98,
  "icon": "server",
  "color": "darkred"
}
```

---

# 3. Related Products API

## Endpoint

```txt
GET /api/general/pc-products/<unique_id>/related/
```

---

# Example

```txt
GET /api/general/pc-products/2557_per26020a/related/
```

---

# Features

* semantic recommendation
* device-aware recommendation
* explainable recommendation
* soft semantic fallback
* similarity scoring

---

# Response Additional Fields

| Field              | Description    |
| ------------------ | -------------- |
| similarity_score   | semantic類似度    |
| matched_attributes | 一致したsemantic属性 |

---

# Example

```json
{
  "similarity_score": 0.75,
  "matched_attributes": [
    "device-server",
    "usage-business",
    "maker-dell"
  ]
}
```

---

# Recommendation Logic

## Main Semantic Factors

| Semantic         | Weight |
| ---------------- | ------ |
| device           | 0.25   |
| usage            | 0.20   |
| gpu              | 0.20   |
| price similarity | 0.20   |
| maker            | 0.10   |
| spec similarity  | 0.10   |

---

# 4. Sidebar Stats API

## Endpoint

```txt
GET /api/general/pc-sidebar-stats/
```

---

# Response

```json
{
  "gpu": [],
  "maker_counts": []
}
```

---

# GPU Structure

```json
{
  "name": "RTX 4070",
  "slug": "gpu-rtx-4070",
  "count": 8
}
```

---

# Maker Structure

```json
{
  "name": "DELL",
  "maker": "DELL",
  "slug": "maker-dell",
  "count": 290
}
```

---

# 5. Semantic Attribute System

## Semantic Types

| Type         | Description |
| ------------ | ----------- |
| device       | 物理カテゴリ      |
| product_type | 商品カテゴリ      |
| usage        | 利用用途        |
| maker        | メーカー        |
| gpu          | GPU         |
| cpu          | CPU         |
| memory       | メモリ         |
| storage      | ストレージ       |
| pc_feature   | 特徴          |

---

# device Examples

| Slug               | Meaning   |
| ------------------ | --------- |
| device-laptop      | ノートPC     |
| device-desktop     | デスクトップ    |
| device-server      | サーバー      |
| device-workstation | ワークステーション |
| device-mini-pc     | ミニPC      |

---

# usage Examples

| Slug           | Meaning |
| -------------- | ------- |
| usage-gaming   | ゲーミング   |
| usage-business | 法人向け    |
| usage-creator  | クリエイター  |
| usage-ai       | AI用途    |

---

# 6. Semantic Metadata

## semantic_role

| Value     | Meaning |
| --------- | ------- |
| primary   | 主要属性    |
| secondary | 補助属性    |
| highlight | 強調属性    |

---

# semantic_weight

```txt
0.0 - 1.0
```

semantic importance score.

---

# icon

Frontend semantic icon identifier.

---

# color

Frontend semantic color identifier.

---

# 7. Semantic Architecture Contract

## Backend Responsibilities

Backend is the semantic authority.

Responsible for:

* semantic extraction
* grouping
* ordering
* metadata
* recommendation scoring
* semantic similarity
* semantic filtering

---

# Frontend Responsibilities

Frontend is the semantic rendering layer.

Responsible for:

* UI rendering
* layout
* cards
* filters
* badges
* semantic visualization

---

# 8. Planned APIs

## Finder API

```txt
GET /api/general/finder/
```

Example:

```txt
?usage=usage-gaming
&gpu=gpu-rtx-4070
&maker=maker-dell
```

---

# Compare API

```txt
POST /api/general/pc-products/compare/
```

---

# Attribute List API

```txt
GET /api/general/pc-attributes/
```

---

# 9. Semantic Schema Versioning

All semantic APIs include:

```json
{
  "semantic_schema_version": 1
}
```

Used for frontend compatibility management.
