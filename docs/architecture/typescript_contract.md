# SHIN CORE LINX

# TypeScript Contract v1

Version: 1.0

Status: DRAFT

Authority: Backend Authority Team

---

# Purpose

本書は SHIN CORE LINX API v3 の TypeScript 契約定義を定義する。

本書は以下の下位Authorityである。

```text
Core Constitution v1.0

↓

Page Meaning Contract v1.0

↓

API Specification v3

↓

TypeScript Contract v1
```

---

# Design Principle

TypeScript Contract は Framework Independent Contract である。

以下に依存しない。

```text
React

Next.js

Vue

Nuxt

Angular
```

---

TypeScript Contract は API Specification v3 から導出される。

---

# Core Blocks

## MeaningBlock

```typescript
interface MeaningBlock {

  identity: string;

  mission: string;

  user_intent: string;

  meaning_statement: string;

  existence_reason: string;
}
```

---

## SEOBlock

```typescript
interface SEOBlock {

  title: string;

  description: string;

  keywords: string[];

  canonical: string;

  schema_jsonld: Record<string, any>;
}
```

---

## AuthorityMetadata

```typescript
interface AuthorityMetadata {

  semantic_schema_version: string;

  authority_version: string;

  semantic_authority: string;

  ready: boolean;
}
```

---

## CommonResponse

```typescript
interface CommonResponse
  extends AuthorityMetadata {

  meaning: MeaningBlock;

  seo: SEOBlock;
}
```

---

# Domain Blocks

## ProductCard

```typescript
interface ProductCard {

  unique_id: string;

  product_id?: number;

  name?: string;

  maker?: string;

  image_url?: string;

  price?: number;

  semantic_runtime?: Record<string, any>;
}
```

---

## GroupCard

```typescript
interface GroupCard {

  group_slug: string;

  group_name: string;

  group_description?: string;

  product_count: number;
}
```

---

## RankingCard

```typescript
interface RankingCard {

  rank?: number;

  score?: number;

  product: ProductCard;
}
```

---

## RelatedCard

```typescript
interface RelatedCard {

  score: number;

  product: ProductCard;
}
```

---

# Response Contracts

## TopResponse

```typescript
interface TopResponse
  extends CommonResponse {

  data: {

    stats: {

      product_count: number;

      group_count: number;

      attribute_count: number;
    };

    featured_groups: GroupCard[];

    featured_products: ProductCard[];
  };
}
```

---

## DiscoveryResponse

```typescript
interface DiscoveryResponse
  extends CommonResponse {

  data: {

    product_count: number;

    group_count: number;

    attribute_count: number;

    shelf_count: number;

    shelves: GroupCard[];
  };
}
```

---

## RankingResponse

```typescript
interface RankingResponse
  extends CommonResponse {

  data: {

    group_slug?: string;

    group_name?: string;

    product_count: number;

    products: ProductCard[];
  };
}
```

---

## FinderResponse

```typescript
interface FinderResponse
  extends CommonResponse {

  data: {

    filters: string[];

    result_count: number;

    products: ProductCard[];
  };
}
```

---

## ProductResponse

```typescript
interface ProductResponse
  extends CommonResponse {

  data: {

    found: boolean;

    product: Record<string, any>;

    semantic_runtime: Record<string, any>;
  };
}
```

---

## RelatedResponse

```typescript
interface RelatedResponse
  extends CommonResponse {

  data: {

    found: boolean;

    source_product: Record<string, any>;

    source_runtime: Record<string, any>;

    related_count: number;

    related_products: RelatedCard[];
  };
}
```

---

# Authority Rules

Frontend は以下を生成しない。

```text
Meaning

SEO

Authority
```

---

Frontend は以下のみ担当する。

```text
Rendering

Interaction

Experience
```

---

# Backend Authority Rules

Backend は以下を提供する。

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

TypeScript Contract は実装ではない。

TypeScript Contract は API Specification v3 を型として表現した Authority Contract である。

Frontend は本 Contract に従って実装される。
