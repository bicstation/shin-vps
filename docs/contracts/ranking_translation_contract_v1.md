# docs/contracts/ranking_translation_contract_v1.md

# Ranking Meaning Translation Contract v1

Status

DRAFT

Owner

Meaning Translation Team

(former Adapter Team)

---

# Purpose

Ranking Vertical Slice において。

```text
Frontend Language
```

と

```text
Backend Reality Language
```

の翻訳可能性を検証する。

---

# Translation Principle

Frontend は。

```text
Experience Language
```

を表現する。

---

Backend は。

```text
Reality Language
```

を表現する。

---

Meaning Translation Layer は。

```text
Experience Language

↓

Reality Language
```

を接続する。

---

# User Purpose

利用者。

```text
どれを選べば良いのか
```

を知りたい。

---

Page Meaning Contract

Ranking Page

```text
Representative Selection Guide
```

---

# Frontend Language

Input

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

Frontend Vocabulary

```text
AI World

Gaming World

Creator World

Business World

Mobile World
```

---

Frontend Output

```typescript
{
  world_name

  world_description

  products

  representative_reason
}
```

---

# Backend Reality Language

Current Evidence

```text
usage-ai

usage-gaming

usage-creator

usage-business

usage-mobile
```

---

Current Ranking Entry

```http
GET /api/pc/ranking/<group_slug>/
```

---

Backend Vocabulary

```text
usage-ai

usage-gaming

usage-creator

usage-business

usage-mobile
```

---

# Translation Rules

Candidate Mapping

```text
AI World
↓
usage-ai

Gaming World
↓
usage-gaming

Creator World
↓
usage-creator

Business World
↓
usage-business

Mobile World
↓
usage-mobile
```

---

Status

```text
NOT VERIFIED
```

Authority Source 未確認。

---

# Authority Sources

## world_slug

Expected Authority

```text
Traversal Runtime
```

---

Status

```text
NOT VERIFIED
```

---

## world_name

Expected Authority

```text
Traversal Runtime
```

---

Status

```text
NOT VERIFIED
```

---

## world_description

Expected Authority

```text
Traversal Runtime
```

---

Reason

Page Meaning Contract により。

利用者は。

```text
この世界とは何か
```

を理解する必要がある。

---

Status

```text
NOT VERIFIED
```

---

## products

Expected Authority

```text
Ranking Runtime
```

---

Status

```text
LIKELY AVAILABLE
```

---

## representative_reason

Expected Authority

```text
Ranking Runtime
```

または

```text
Traversal Runtime
```

---

Status

```text
NOT VERIFIED
```

---

# Translation Gaps

Current Known Gap

```text
world_slug Authority
```

未確認。

---

Current Known Gap

```text
world_description Authority
```

未確認。

---

Current Known Gap

```text
representative_reason Authority
```

未確認。

---

# Adapter Recommendation

実装禁止。

まず Authority を確認する。

---

監査対象。

```text
Traversal Runtime

Ranking Runtime
```

---

確認事項。

```text
world_slug

world_name

world_description

representative_reason
```

が Runtime Authority に存在するか。

---

# Meaning Translation Assessment

現時点で。

```text
Frontend Requirement
```

は。

Core Constitution および。

Page Meaning Contract と整合する。

---

確認すべき対象は。

```text
Ranking API
```

ではなく。

```text
Meaning

↓

Authority

↓

Runtime
```

である。

---

Status

MEANING TRANSLATION LAYER

AUDIT IN PROGRESS

```
```
