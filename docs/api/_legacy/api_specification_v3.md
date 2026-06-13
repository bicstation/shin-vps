# SHIN CORE LINX

# API Specification v3

Version: 3.0

Status: DRAFT

Authority: Backend Authority Team

---

# 01. Architecture Overview

## Purpose

本仕様書は SHIN CORE LINX API v3 の正式仕様を定義する。

本仕様書は以下の下位Authorityである。

```text
Core Constitution v1.0

↓

Page Meaning Contract v1.0

↓

API Specification v3
```

---

## Authority Chain

```text
Reality

↓

Meaning

↓

Authority

↓

SEO

↓

API

↓

Frontend

↓

Experience
```

---

## Design Principle

SHIN CORE LINX は Data First を採用しない。

SHIN CORE LINX は Meaning Driven Architecture を採用する。

```text
Meaning

↓

Runtime

↓

SEO

↓

API

↓

Frontend
```

---

# 02. Common Response Contract

## Standard Response

全 API は以下構造を返却する。

```json
{
  "meaning": {},
  "seo": {},
  "data": {},

  "semantic_schema_version": "",
  "authority_version": "",
  "semantic_authority": "",

  "ready": true
}
```

---

## Field Definitions

### meaning

ページの Identity を表す Static Authority。

Authority Source

```text
Page Meaning Contract
```

---

### seo

Meaning Runtime と Reality Runtime から生成される SEO Authority。

Authority Source

```text
Meaning Runtime

×

Reality Runtime
```

---

### data

Reality を公開する Payload。

Authority Source

```text
Authority Runtime
Traversal Runtime
Product Runtime
Discovery Runtime
Ranking Runtime
Finder Runtime
Related Runtime
```

---

### semantic_schema_version

Semantic Schema Version。

---

### authority_version

Authority Runtime Version。

---

### semantic_authority

Semantic Authority Source。

---

### ready

Runtime Ready Status。

---

# 03. Page Meaning Definitions

## Top Page

### Identity

SHIN CORE LINX Reality Gateway

### Mission

Semantic Reality への入口を提供する

### User Intent

このサイトで何ができるのか理解したい

### Meaning Statement

SHIN CORE LINX 全体への総合入口

### Existence Reason

Semantic Reality System の価値を理解してもらうため

---

## Discovery Page

### Identity

Semantic Universe Gateway

### Mission

Semantic Universe への入口を提供する

### User Intent

どのような世界が存在するのか知りたい

### Meaning Statement

Semantic Universe 全体へ接続する入口

### Existence Reason

利用者が自分に適した世界を発見するため

---

## Ranking Page

### Identity

Representative Selection Guide

### Mission

特定世界の代表候補を提示する

### User Intent

どれを選べばよいか知りたい

### Meaning Statement

特定世界における代表的選択肢を提示するページ

### Existence Reason

代表的な候補から選択を開始するため

---

## Finder Page

### Identity

Personal Reality Navigator

### Mission

利用者条件と Reality を接続する

### User Intent

自分に最適な PC を見つけたい

### Meaning Statement

利用者条件から Semantic Reality を横断探索する

### Existence Reason

Reality 全体から最適解へ到達するため

---

## Product Page

### Identity

Product Reality Authority

### Mission

単一製品の Reality を公開する

### User Intent

この製品の実態を知りたい

### Meaning Statement

単一製品の Reality を公開するページ

### Existence Reason

比較・推薦の根拠となる一次 Reality を公開するため

---

## Related Page

### Identity

Reality Neighborhood Navigator

### Mission

対象製品に近い Reality を提示する

### User Intent

似た製品を知りたい

### Meaning Statement

対象製品の近傍 Reality を探索する

### Existence Reason

Reality 上で比較対象を発見するため

---

# 04. Endpoint Specification

## Top API

### URL

```text
/api/general/top/
```

### Method

```text
GET
```

### Authority Source

```text
Authority Runtime
Discovery Runtime
Traversal Runtime
Top Runtime
```

### Response

```json
{
  "meaning": {},
  "seo": {},
  "data": {
    "stats": {},
    "featured_groups": [],
    "featured_products": []
  }
}
```

---

## Discovery API

### URL

```text
/api/general/discovery/
```

### Method

```text
GET
```

### Authority Source

```text
Authority Runtime
Traversal Runtime
Discovery Runtime
```

---

## Ranking API

### URL

```text
/api/general/ranking/<group_slug>/
```

### Method

```text
GET
```

### Authority Source

```text
Traversal Runtime
Ranking Runtime
```

---

## Finder API

### URL

```text
/api/general/finder/
```

### Method

```text
GET
```

### Authority Source

```text
Authority Runtime
Traversal Runtime
Finder Runtime
```

---

## Product API

### URL

```text
/api/general/pc-products/<unique_id>/
```

### Method

```text
GET
```

### Authority Source

```text
PCProduct
Semantic Runtime
Authority Runtime
```

---

## Related API

### URL

```text
/api/general/pc-products/<unique_id>/related/
```

### Method

```text
GET
```

### Authority Source

```text
Product Runtime
Traversal Runtime
Related Runtime
```

---

# 05. SEO Contract

## Definition

```text
Meaning Runtime

×

Reality Runtime

↓

SEO Runtime
```

---

## Backend Authority

以下は Backend Authority とする。

```text
title

description

keywords

canonical

schema_jsonld
```

---

## Frontend Restriction

Frontend は以下を生成しない。

```text
Title

Description

Keywords

Canonical

JSON-LD
```

---

# 06. Frontend Responsibility

Frontend は Meaning を生成しない。

Frontend は SEO を生成しない。

Frontend は Authority を生成しない。

Frontend は Rendering Layer のみ担当する。

---

# 07. Backend Responsibility

Backend は以下を Authority として提供する。

```text
Meaning Runtime

SEO Runtime

Authority Runtime

Traversal Runtime

Discovery Runtime

Ranking Runtime

Finder Runtime

Related Runtime

Top Runtime

API Runtime
```

---

# Final Statement

SHIN CORE LINX は Product Search System ではない。

SHIN CORE LINX は Semantic Reality Platform である。

Backend は Meaning を Authority として公開し、

Frontend は Meaning を Experience として表現する。
