# frontend_api_reference_v2.1.md

## Purpose

Frontend Team が Backend Team へ質問せず実装できること。

---

# Product API

## URL

GET /api/pc/products/{unique_id}/

### Example

GET /api/pc/products/ASUS_S3407AA-U7321GR/

---

## Purpose

製品詳細ページ表示

---

## Response Example

```json
{
  "meaning": {
    "identity": "Reality Product Detail"
  },

  "seo": {
    "title": "ASUS Vivobook S14"
  },

  "data": {

    "found": true,

    "product": {
      "unique_id": "ASUS_S3407AA-U7321GR",
      "name": "ASUS Vivobook S14",
      "maker": "asus",
      "price": 169800,
      "image_url": "",
      "workflow_tags": [
        "usage-gaming"
      ],
      "semantic_labels": [
        "ゲーミング用途"
      ]
    },

    "semantic_runtime": {
      "...": "..."
    }
  }
}
```

---

## Field Dictionary

### product

製品基本情報

---

### semantic_runtime

Semantic Compiler が生成した Reality Runtime

---

### workflow_tags

用途分類

例

* usage-ai
* usage-gaming
* usage-business
* usage-creator

---

### semantic_labels

人間向け表示ラベル

例

* AI用途
* ゲーミング用途

---

### image_url

製品画像URL

| Property     | Value |
| ------------ | ----- |
| Required     | YES   |
| Nullable     | NO    |
| Empty String | YES   |

---

# Related API

## URL

GET /api/pc/products/{unique_id}/related/

---

## Purpose

関連製品表示

---

## Response Example

```json
{
  "meaning": {
    "identity": "Reality Neighborhood Navigator"
  },

  "seo": {
    "title": "関連製品"
  },

  "data": {

    "found": true,

    "related_count": 12,

    "source_product": {
      "unique_id": "ASUS_S3407AA-U7321GR"
    },

    "related_products": [
      {
        "unique_id": "ASUS_H7606WW-AI9642R5080W",
        "name": "ProArt P16",
        "price": 848000
      }
    ]
  }
}
```

---

## Field Dictionary

### source_product

比較元製品

---

### related_count

関連製品件数

---

### related_products

関連製品一覧

---

## Frontend Usage

* 関連製品カルーセル
* あわせておすすめ
* 比較導線
* 類似製品一覧

```
```



