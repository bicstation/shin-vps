# API Reference

Version: 1.0

Purpose

Frontend Development Primary Reference

---

# Top API

## Purpose

トップページ表示用 API

SHIN CORE LINX 全体の統計情報と注目カテゴリを取得する。

---

## URL

```http
GET /api/pc/top/
```

---

## Method

```http
GET
```

---

## Example Request

```http
GET /api/pc/top/
```

---

## Response Structure

```json
{
  "meaning": {},
  "seo": {},
  "data": {},
  "semantic_schema_version": 3,
  "authority_version": "2.0",
  "semantic_authority": "backend",
  "ready": true
}
```

---

## Important Fields

### meaning

ページの存在理由

---

### seo

SEOメタ情報

---

### data.stats

全体統計

例

```json
{
  "product_count": 1012,
  "group_count": 43,
  "attribute_count": 125
}
```

---

### data.featured_groups

注目カテゴリ

---

### data.featured_products

注目製品

---

## Frontend Usage

* Home Page
* Hero Area
* Statistics Area
* Featured Categories
* Featured Products

---

# Discovery API

## Purpose

カテゴリ探索ページ表示

利用可能な Group Universe を取得する。

---

## URL

```http
GET /api/pc/discover/
```

---

## Method

```http
GET
```

---

## Example Request

```http
GET /api/pc/discover/
```

---

## Actual Runtime Example

```json
{
  "data": {
    "product_count": 1012,
    "group_count": 43,
    "attribute_count": 125,
    "shelves": [
      {
        "group_slug": "usage-ai",
        "group_name": "AI用途",
        "product_count": 11
      },
      {
        "group_slug": "usage-business",
        "group_name": "ビジネス用途",
        "product_count": 18
      },
      {
        "group_slug": "usage-gaming",
        "group_name": "ゲーミング用途",
        "product_count": 19
      }
    ]
  }
}
```

---

## Important Fields

### shelves

カテゴリ一覧

---

### group_slug

システム内部識別子

例

```text
usage-ai
usage-business
usage-gaming
device-laptop
cpu-mainstream
```

---

### group_name

表示名

例

```text
AI用途
ビジネス用途
ゲーミング用途
```

---

### product_count

カテゴリ内商品数

---

## Frontend Usage

* Discovery Page
* Navigation Menu
* Ranking Links
* Finder Group Selector

---

# Discovery Visibility Rule

推奨表示ポリシー

| product_count | visibility |
| ------------- | ---------- |
| > 0           | visible    |
| = 0           | disabled   |

---

## Notes

group_slug は固定値として Frontend にハードコードしない。

Discovery Runtime を Authority とする。


# Ranking API

## Purpose

カテゴリ別ランキング表示

---

## URL

```http
GET /api/pc/ranking/{group_slug}/
```

---

## Examples

```http
GET /api/pc/ranking/usage-ai/
```

```http
GET /api/pc/ranking/usage-business/
```

```http
GET /api/pc/ranking/usage-gaming/
```

---

## Response Structure

```json
{
  "meaning": {},
  "seo": {},
  "data": {
    "group_slug": "usage-ai",
    "group_name": "AI用途",
    "product_count": 11,
    "products": []
  }
}
```

---

## Important Fields

### group_slug

対象グループ

---

### group_name

表示名称

---

### product_count

ランキング対象件数

---

### products

ランキング商品一覧

---

## Frontend Usage

* Ranking Page
* Category Detail
* Top Products
* Featured Rankings

---

# Finder API

## Purpose

条件検索

---

## URL

```http
POST /api/pc/finder/
```

---

## Example Request

```json
{
  "groups": [
    "usage-ai"
  ],
  "limit": 20
}
```

---

## Request Fields

| Field      | Required | Description      |
| ---------- | -------- | ---------------- |
| groups     | No       | Group Filter     |
| attributes | No       | Attribute Filter |
| limit      | No       | Max Result Count |

---

## Default Request

```json
{}
```

---

## Default Behavior

条件なしの場合。

上位100件を返却する。

---

## Response Structure

```json
{
  "data": {
    "filters": [
      "usage-ai"
    ],
    "result_count": 11,
    "products": []
  }
}
```

---

## Important Fields

### filters

適用中フィルター

---

### result_count

検索結果件数

---

### products

検索結果一覧

---

## Frontend Usage

* Finder Page
* Search UI
* Recommendation UI

---

# Product API

## Purpose

商品詳細ページ

---

## URL

```http
GET /api/pc/products/{unique_id}/
```

---

## Example

```http
GET /api/pc/products/ASUS_S3407AA-U7321GR/
```

---

## Actual Runtime Structure

```json
{
  "data": {
    "found": true,

    "product": {

      "unique_id":
        "ASUS_S3407AA-U7321GR",

      "name":
        "ASUS Vivobook S14",

      "maker":
        "asus",

      "price":
        169800,

      "image_url":
        "https://...",

      "workflow_tags": [
        "usage-gaming"
      ],

      "semantic_labels": [
        "ゲーミング用途"
      ],

      "semantic_runtime": {}
    }
  }
}
```

---

## Important Fields

### found

商品存在確認

---

### product

商品本体

---

### workflow_tags

用途分類

例

```text
usage-ai
usage-business
usage-gaming
usage-creator
```

---

### semantic_labels

人間向け表示ラベル

例

```text
AI用途
ゲーミング用途
```

---

### semantic_runtime

コンパイル済み Semantic Runtime

---

### image_url

商品画像URL

| Property     | Value |
| ------------ | ----- |
| Required     | YES   |
| Nullable     | NO    |
| Empty String | YES   |

---

## Frontend Usage

* Product Detail Page
* Product Card
* Product Comparison
* Recommendation Engine

---

# Related API

## Purpose

関連商品表示

---

## URL

```http
GET /api/pc/products/{unique_id}/related/
```

---

## Example

```http
GET /api/pc/products/ASUS_S3407AA-U7321GR/related/
```

---

## Actual Runtime Structure

```json
{
  "data": {

    "found": true,

    "source_product": {},

    "related_count": 20,

    "related_products": []
  }
}
```

---

## Important Fields

### source_product

比較元商品

---

### related_count

関連商品件数

実例

```text
20
```

---

### related_products

関連商品一覧

---

## Frontend Usage

* Related Carousel
* Similar Products
* Recommendation Section
* Product Comparison

---

# Common Error Responses

## 400

```json
{
  "error": "Invalid Request"
}
```

---

## 404

```json
{
  "found": false
}
```

---

## 405

```json
{
  "detail": "Method not allowed"
}
```

---

# Frontend Rules

Backend Runtime を Authority とする。

Frontend は。

* Meaning を生成しない
* SEO を生成しない
* Semantic Authority を生成しない

Frontend は Rendering Layer とする。

---

Status

API Reference Complete


