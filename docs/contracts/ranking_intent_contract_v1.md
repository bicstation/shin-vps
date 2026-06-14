# docs/contracts/ranking_intent_contract_v1.md

# SHIN CORE LINX

## Ranking Intent Contract v1

Status

PILOT

Authority

Page Meaning Contract

Ranking Page Meaning

---

# Purpose

本書は。

Ranking Page における。

```text
User Intent

↓

Frontend Intent

↓

Required Data
```

を定義する。

---

本契約は。

API Contract の上位層として機能する。

---

重要。

本書は。

```text
APIが何を返せるか
```

から作らない。

---

本書は。

```text
利用者は何をしたいのか
```

から作成する。

---

# Layer 01

User Intent

---

## User Question

利用者は。

Ranking Page に来た時。

何を知りたいのか。

---

誤。

```text
1位を知りたい
```

---

誤。

```text
最強PCを知りたい
```

---

正。

```text
その世界で

まず見るべき代表候補を知りたい
```

---

# User Intent Definition

利用者は。

```text
AI World

Creator World

Gaming World
```

など。

特定の世界を理解した後。

---

```text
その世界では

どの候補から見ればよいのか
```

を知りたい。

---

# User Intent Statement

```text
その世界の代表候補を知りたい
```

---

# Layer 02

Frontend Intent

---

## Mission

Frontend は。

順位を見せたいのではない。

---

Frontend は。

```text
世界の代表候補
```

を見せたい。

---

## Frontend Understanding

利用者に。

以下を理解させる。

---

```text
AI World なら

まずこの候補から見ればよい
```

---

また。

```text
この候補が

なぜ代表候補なのか
```

も理解させる。

---

## Frontend Intent Statement

```text
特定世界の

代表候補と

その理由を理解させる
```

---

# Layer 03

Required Inputs

---

Frontend が Adapter に渡す情報。

---

## Minimum Contract

```typescript
{
  world_slug: string
}
```

---

例。

```typescript
{
  world_slug: "ai-world"
}
```

---

## Optional Contract

```typescript
{
  world_slug: string

  limit?: number

  page?: number
}
```

---

重要。

Frontend は。

```text
ランキング種別
```

を要求しない。

---

Frontend が欲しいのは。

```text
特定世界の代表候補
```

だからである。

---

# Layer 04

Expected Outputs

---

Frontend が Adapter に期待する情報。

---

## Ranking World

```typescript
{
  world_name: string

  world_description: string
}
```

---

例。

```typescript
{
  world_name: "AI World",

  world_description:
    "生成AIやローカルLLM向けの世界"
}
```

---

## Representative Candidates

```typescript
{
  products: ProductCard[]
}
```

---

## Candidate Explanation

重要。

Frontend は。

候補一覧だけでは不足。

---

必要。

```typescript
{
  representative_reason: string
}
```

---

例。

```text
大規模モデル推論に適した
GPU構成を持つため
```

---

## Full Expected Output

```typescript
{
  world_name: string

  world_description: string

  products: ProductCard[]

  representative_reason?: string
}
```

---

# Layer 05

Adapter Responsibility

---

Adapter の責務。

---

```text
Frontend Intent
```

を。

```text
API Query
```

へ変換すること。

---

Adapter は。

API構造を隠蔽する。

---

例。

```text
world_slug
```

↓

```text
attribute_ids
```

↓

```text
ranking API
```

---

変換は Adapter の責務。

---

Frontend の責務ではない。

---

# Layer 06

API Responsibility

---

API の責務。

---

```text
代表候補生成に必要な Reality
```

を返すこと。

---

API は。

Frontend UI を知らない。

---

API は。

Intent を知らない。

---

API は。

Reality を返す。

---

# Success Condition

利用者が Ranking Page を離脱する時。

---

以下を理解していること。

---

```text
この世界では

まずこの候補から見ればよい
```

---

さらに。

```text
なぜその候補なのか
```

も理解していること。

---

# Contract Flow

```text
User Intent

その世界の代表候補を知りたい

↓

Frontend Intent

代表候補と理由を理解させたい

↓

Adapter Intent

world_slug を API Query に変換

↓

API

Reality Data を返す

↓

Frontend

代表候補体験を構築

↓

User Understanding

まず見るべき候補が分かった
```

---

# Pilot Evaluation Goal

本 Pilot の目的は。

Ranking Page を作ることではない。

---

目的は。

```text
Intent Contract
```

という層が。

---

```text
Page Meaning

↓

Frontend

↓

Adapter

↓

API
```

---

を接続できるかを検証することである。

---

Status

RANKING INTENT CONTRACT PILOT

SUBMITTED FOR COMMANDER REVIEW
