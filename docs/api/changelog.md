# API Changelog

Version: 1.0

Purpose

API Change Tracking

---

# 2026-06-14

## Documentation Consolidation Phase

Status

Completed

---

### Added

#### API Reference v1

作成。

収録。

```text
Top API

Discovery API

Ranking API

Finder API

Product API

Related API
```

---

#### Endpoint Catalog

作成。

収録。

```text
Method

URL

Purpose
```

---

#### Discovery Group Catalog

作成。

Runtime Source

```text
GET /api/pc/discover/
```

---

### Confirmed

#### Product API

確認。

```text
GET /api/pc/products/{unique_id}/
```

---

semantic_runtime の位置。

変更前想定。

```text
data.semantic_runtime
```

---

実際。

```text
data.product.semantic_runtime
```

---

Status

Confirmed

---

#### Product API

workflow_tags

確認。

例。

```json
[
  "usage-gaming"
]
```

---

#### Product API

semantic_labels

確認。

例。

```json
[
  "ゲーミング用途"
]
```

---

#### Product API

image_url

確認。

型。

```text
string
```

---

Rule

```text
nullable = false

empty string = allowed
```

---

#### Related API

確認。

```text
GET /api/pc/products/{unique_id}/related/
```

---

確認フィールド。

```text
data.source_product

data.related_count

data.related_products
```

---

実例。

```text
related_count = 20
```

---

#### Finder API

確認。

Method。

```http
POST
```

---

GET。

```http
405 Method Not Allowed
```

---

Request。

```json
{
  "groups": [
    "usage-ai"
  ],
  "limit": 20
}
```

---

### Discovery Runtime

確認。

主要グループ。

```text
usage-budget      353

maker-global      453

memory-standard   412

cpu-mainstream    336
```

---

### Frontend Handoff

Status

Approved

---

Deliverables

```text
Frontend Contract

TypeScript Contract

API Reference

Endpoint Catalog

Discovery Group Catalog
```

---

# Future Changes

ここには。

```text
API追加

レスポンス変更

フィールド移動

非推奨化
```

を記録する。

---

# Change Rules

Backend Team は。

レスポンス構造変更時。

必ず changelog を更新する。

---

Status

Active
