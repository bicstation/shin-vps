# docs/contracts/ranking_user_purpose_contract_v1.md

# SHIN CORE LINX

## Ranking User Purpose Contract v1

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
User Purpose

↓

Frontend Responsibility

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
APIが返せるもの
```

から作らない。

---

本書は。

```text
利用者は何を達成したいのか
```

から作成する。

---

# Layer 01

User Purpose

---

## User Goal

利用者は。

Ranking Page に来た時。

何を達成したいのか。

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

誤。

```text
スペック一覧を見たい
```

---

正。

```text
その世界で

まず見るべき候補を知りたい
```

---

## User Purpose Definition

利用者は。

Discovery により。

特定の世界を認識している。

---

例。

```text
AI World

Creator World

Gaming World

Business World

Mobile World
```

---

その後。

利用者は。

```text
その世界なら

どの候補から見ればよいのか
```

を知りたい。

---

## User Purpose Statement

```text
その世界で

まず見るべき代表候補を知りたい
```

---

# Layer 02

Frontend Responsibility

---

## Mission

Frontend は。

順位を見せたいのではない。

---

Frontend は。

利用者に。

```text
その世界の代表候補
```

を理解させたい。

---

さらに。

```text
なぜその候補なのか
```

も理解させたい。

---

## Frontend Responsibility Statement

```text
その世界の代表候補と

その理由を

わかりやすい日本語で

理解させる
```

---

## Frontend Translation Role

Frontend の責務は。

```text
スペックを表示すること
```

ではない。

---

Frontend の責務は。

```text
Reality を

利用者が理解できる言葉へ

翻訳すること
```

である。

---

例。

```text
RTX 5080
```

↓

```text
大規模AI画像生成にも
対応しやすい構成
```

---

例。

```text
32GB Memory
```

↓

```text
複数アプリを同時利用しても
快適に使いやすい
```

---

# Layer 03

Required Inputs

---

Frontend が必要とする条件。

---

## Minimum Requirement

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

## Meaning

Frontend は。

```text
世界
```

を指定する。

---

Frontend は。

```text
順位種別
```

を指定しない。

---

Frontend が求めているものは。

```text
その世界の代表候補
```

だからである。

---

# Layer 04

Required Outputs

---

Frontend が必要とする結果。

---

## World Description

利用者は。

まず。

```text
ここは何の世界なのか
```

を理解する必要がある。

---

必要情報。

```typescript
{
  world_name: string

  world_description: string
}
```

---

例。

```text
AI World

生成AIやローカルLLMに
適したPCの世界
```

---

## Representative Candidate

利用者は。

```text
まず見るべき候補
```

を知りたい。

---

必要情報。

```typescript
{
  products: ProductCard[]
}
```

---

## Representative Reason

利用者は。

```text
なぜその候補なのか
```

を理解したい。

---

必要情報。

```typescript
{
  representative_reason: string
}
```

---

例。

```text
AI用途で高い性能と
バランスを持つため
```

---

## Full Requirement

```typescript
{
  world_name: string

  world_description: string

  products: ProductCard[]

  representative_reason: string
}
```

---

重要。

以下は本契約に含めない。

---

```text
探索導線

継続導線

関連候補

Discovery導線
```

---

理由。

それらは。

Ranking の使命ではない。

---

Ranking の使命は。

```text
代表候補を理解させること
```

である。

---

# Layer 05

Success Condition

---

利用者が。

Ranking Page を離脱する時。

以下を理解していること。

---

## Understanding 01

```text
この世界が

どのような世界なのか
```

---

## Understanding 02

```text
この世界なら

まずこの候補から見ればよい
```

---

## Understanding 03

```text
なぜその候補なのか
```

---

## Final Success Condition

```text
この世界では

まずこの候補から見ればよい

そして

その理由も理解できた
```

---

# User Purpose Flow

```text
User Purpose

その世界で
まず見るべき候補を知りたい

↓

Frontend Responsibility

代表候補と理由を
わかりやすく伝える

↓

Required Inputs

world_slug

↓

Required Outputs

世界説明

代表候補

代表理由

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
User Purpose
```

という層が。

---

```text
User Purpose

↓

Frontend Responsibility

↓

Adapter Requirement

↓

API Requirement
```

---

を接続できるかを検証することである。

---

# Final Statement

Ranking Page は。

```text
順位ページ
```

ではない。

---

Ranking Page は。

```text
Representative Selection Guide
```

である。

---

Frontend は。

利用者に。

```text
その世界で

まず見るべき候補
```

を。

わかりやすく伝えるために存在する。

---

Status

RANKING USER PURPOSE CONTRACT V1

SUBMITTED FOR COMMANDER REVIEW
