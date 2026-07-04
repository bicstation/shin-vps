これは**contracts**に置くのが一番自然だと思います。

理由は、この文書はUI仕様ではなく、

> **Experience Layer の設計契約（Architecture Contract）**

だからです。

今ある

```text
docs/contracts/

experience_runtime_contract_v1.md
ranking_intent_contract_v1.md
ranking_translation_contract_v1.md
ranking_user_purpose_contract_v1.md
```

と同じレイヤーになります。

---

# おすすめファイル名

私はこれをおすすめします。

```text
docs/contracts/ranking_experience_architecture_v1.md
```

理由

* Ranking専用
* Experience層
* Architecture文書
* V1として今後育てられる

非常に分かりやすい命名です。

---

# ドキュメント構成案

```markdown
# SHIN CORE LINX

# Ranking Experience Architecture V1

---

## Purpose

Defines the constitutional architecture of the Ranking Experience.

This document explains how Ranking expresses the Semantic Universe.

It does not define Runtime implementation details.

---

# Constitutional Principle

Ranking does not create Reality.

Ranking translates Semantic Reality into a comparison experience.

```

```
Semantic Dictionary (TSV)

↓

Semantic Universe

↓

Ranking Meaning

↓

Ranking Experience

↓

Customer Decision
```

---

# Position inside SHIN CORE LINX

```
Semantic Dictionary

↓

Semantic Universe

├── Discover
│      Understand
│
├── Ranking
│      Compare
│
├── Finder
│      Choose
│
└── Guide
       Learn
```

Every Experience shares one Reality.

---

# Canonical Authority

The Backend Semantic Dictionary remains the only Semantic Authority.

Frontend shall not introduce an independent semantic model.

```
Backend

↓

Semantic Universe

↓

Frontend Experience
```

---

# Canonical Unit

Ranking is slug-centric.

Each Ranking represents exactly one Semantic Slug.

Examples

```
usage-ai

usage-gaming

device-laptop

cpu-ai

gpu-highend
```

The Semantic Slug remains the canonical destination.

---

# Experience Flow

```
Ranking Portal

↓

Featured Overall Ranking

↓

Semantic Universe Navigation

↓

Semantic Group

↓

Individual Ranking

↓

Product Comparison

↓

Customer Decision
```

The purpose of each stage is to reduce customer uncertainty.

---

# Experience Responsibilities

## Hero

Explain the Ranking Experience.

---

## Featured Overall Ranking

Provide an immediate recommendation.

---

## Semantic Navigation

Present the Semantic Universe.

Examples

```
Usage

Device

CPU

GPU

Memory

Storage

Monitor
```

These categories originate from the Semantic Universe.

---

## Ranking Group

Present Ranking destinations belonging to one Semantic Group.

Example

```
Usage

↓

AI

Gaming

Business

Creator
```

---

## Individual Ranking

Present representative products for one Semantic Slug.

Example

```
usage-ai

↓

Top AI PCs
```

---

## Product Comparison

Support customer decision-making.

---

# Frontend Responsibility

Frontend transforms Reality into Experience.

It does not redefine Reality.

```
Reality

↓

Meaning

↓

Experience

↓

Decision
```

---

# Future Experiences

Future Experiences should derive from the same Semantic Universe.

Illustrative examples

```
Discover

Ranking

Finder

Guide

Collections

Recommendations
```

Different Experiences.

One Reality.

---

# Commander Conclusion

The Ranking Experience exists to express the Semantic Universe through comparison.

Discover helps customers understand Reality.

Ranking helps customers compare Reality.

Finder helps customers choose from Reality.

Guide helps customers learn Reality.

The Reality remains singular.

Only the customer journey changes.

---

## Constitutional Summary

Reality First.

Meaning Second.

Experience Third.

````

---

# この文書の位置付け

私は、この文書は **`ranking_intent_contract_v1.md` より一段上位** に位置付けるのがよいと考えます。

整理すると、

```text
constitution/
    core_constitution.md
    page_meaning_contract.md

contracts/
    ranking_experience_architecture_v1.md   ← ★追加
    experience_runtime_contract_v1.md
    ranking_intent_contract_v1.md
    ranking_translation_contract_v1.md
    ranking_user_purpose_contract_v1.md
````

この構成だと、

1. **Constitution（憲法）**：「Reality → Meaning → Experience」の基本原則
2. **Experience Architecture**：「Ranking Experience の存在理由と責務」
3. **Contracts**：「Runtime や Intent の実装契約」

という階層が明確になります。

そして今回の Commander Directive で確立した **「Different Experiences. One Reality.」** は、この `ranking_experience_architecture_v1.md` の中核となる設計原則として記録する価値があると思います。
