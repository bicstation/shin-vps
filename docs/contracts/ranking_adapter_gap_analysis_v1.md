# docs/contracts/ranking_adapter_gap_analysis_v1.md

# Ranking Vertical Slice Validation

Status

DRAFT

Owner

Adapter Authority Team

---

# Objective

確認対象

```text
User Purpose
↓
Frontend Requirement
↓
Adapter Layer
↓
API Capability
```

---

# Frontend Input Contract

```typescript
{
  world_slug: string
}
```

Example

```typescript
{
  world_slug: "ai-world"
}
```

---

# Frontend Expected Output

```typescript
{
  world_name: string

  world_description: string

  products: ProductCard[]

  representative_reason: string
}
```

---

# Current Runtime Evidence

Adapter Team が確認済みの Runtime 関連構造

```text
pc/discover/
pc/finder/
pc/ranking/
pc/runtime/
```

---

確認済み概念

```text
grouped_attributes

workflow_tags

semantic_runtime

discover_runtime

finder_runtime
```

---

未確認

```text
world_slug
```

---

# Step 01

World Reality Audit

## Current Finding

現時点で確認済み Runtime 契約内に。

```text
world_slug
```

は確認できていない。

---

可能性

```text
world_slug
↓
group_slug
```

変換層が必要。

---

Example

```text
ai-world
↓
usage-ai
```

---

```text
gaming-world
↓
usage-gaming
```

---

Status

```text
NOT VERIFIED
```

---

# Step 02

Ranking API Audit

確認済み構造

```text
pc/ranking/
```

存在。

---

想定取得経路

```http
GET /api/pc/ranking/<group_slug>/
```

---

確認事項

Ranking API が返す情報。

```text
products
```

取得可否。

---

Status

```text
PARTIALLY VERIFIED
```

---

# Step 03

Output Contract Audit

Frontend Requirement

```typescript
{
  world_name
  world_description
  products
  representative_reason
}
```

---

Current Evidence

## products

取得可能性高い。

Status

```text
LIKELY AVAILABLE
```

---

## world_name

未確認。

Status

```text
NOT VERIFIED
```

---

## world_description

未確認。

Status

```text
NOT FOUND
```

---

## representative_reason

未確認。

Status

```text
NOT FOUND
```

---

# Gap Analysis

| Field                 | Frontend Requirement | Runtime Evidence | Gap            |
| --------------------- | -------------------- | ---------------- | -------------- |
| world_slug            | Required             | Not Verified     | Audit Required |
| world_name            | Required             | Unknown          | Gap            |
| world_description     | Required             | Not Found        | Gap            |
| products              | Required             | Available        | No Gap         |
| representative_reason | Required             | Not Found        | Gap            |

---

# Adapter Recommendation

現段階では実装禁止。

まず以下を確認する。

```text
1. Runtime 内に world_slug 概念が存在するか

2. group_slug と world_slug の対応関係

3. Ranking API が group_slug を受け付けるか

4. world_description の Authority がどこに存在するか

5. representative_reason の Authority がどこに存在するか
```

---

# Adapter Team Assessment

現時点では。

```text
Frontend Requirement
```

は定義済み。

---

しかし。

```text
world_name

world_description

representative_reason
```

について。

Authority Source が未確認。

---

Status

```text
RANKING VERTICAL SLICE

AUDIT REQUIRED
```

実装着手前に Runtime Evidence の確認を推奨する。
