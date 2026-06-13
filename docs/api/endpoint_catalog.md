# Endpoint Catalog

Version: 1.0

Purpose

SHIN CORE LINX API Quick Reference

---

# PC API Endpoints

| API       | Method | URL                                   | Purpose   |
| --------- | ------ | ------------------------------------- | --------- |
| Top       | GET    | /api/pc/top/                          | トップページ    |
| Discovery | GET    | /api/pc/discover/                     | カテゴリ探索    |
| Ranking   | GET    | /api/pc/ranking/{group_slug}/         | グループランキング |
| Finder    | POST   | /api/pc/finder/                       | 条件検索      |
| Product   | GET    | /api/pc/products/{unique_id}/         | 商品詳細      |
| Related   | GET    | /api/pc/products/{unique_id}/related/ | 関連商品      |

---

# Examples

## Top

```http
GET /api/pc/top/
```

---

## Discovery

```http
GET /api/pc/discover/
```

---

## Ranking

```http
GET /api/pc/ranking/usage-ai/
```

```http
GET /api/pc/ranking/usage-gaming/
```

```http
GET /api/pc/ranking/usage-business/
```

---

## Finder

```http
POST /api/pc/finder/
```

Example Request

```json
{
  "groups": [
    "usage-ai"
  ],
  "limit": 20
}
```

---

## Product

```http
GET /api/pc/products/ASUS_S3407AA-U7321GR/
```

---

## Related

```http
GET /api/pc/products/ASUS_S3407AA-U7321GR/related/
```

---

# Response Pattern

すべての API は以下の共通構造を持つ。

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

# Common Status Codes

| Code | Meaning               |
| ---- | --------------------- |
| 200  | Success               |
| 400  | Bad Request           |
| 404  | Not Found             |
| 405  | Method Not Allowed    |
| 500  | Internal Server Error |

---

# Frontend Entry Points

| Screen           | API       |
| ---------------- | --------- |
| Home             | Top       |
| Discovery        | Discovery |
| Ranking          | Ranking   |
| Finder           | Finder    |
| Product Detail   | Product   |
| Related Products | Related   |

---

# Current Status

| API       | Status |
| --------- | ------ |
| Top       | Active |
| Discovery | Active |
| Ranking   | Active |
| Finder    | Active |
| Product   | Active |
| Related   | Active |

---

Status

Production Ready
