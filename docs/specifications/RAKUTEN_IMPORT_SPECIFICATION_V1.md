# RAKUTEN IMPORT SPECIFICATION V1.0

**Document Version:** 1.0  
**Project:** SHIN CORE LINX  
**Author:** Backend Commander  
**Status:** Draft (Architecture Approved)

---

# 1. Purpose

本仕様書は、楽天市場の商品データを既存のPCProduct Import Pipelineへ取り込むための正式仕様を定義する。

本仕様の目的は、新たなImport方式を作成することではなく、

**既存LinkShare Import Architectureへ楽天データを適合させること**

である。

---

# 2. Design Principles

楽天対応では、既存アーキテクチャを変更しない。

変更対象は楽天固有部分のみとする。

以下は既存資産を再利用する。

- PCFeedNormalizer
- PCProductBuilder
- AsusSemanticBuilder
- SemanticRuntimeBuilder
- PCProduct

---

# 3. Existing Import Pipeline

```
LinkshareProduct
        │
        ▼
LinkshareFeedParser
        │
        ▼
parsed
        │
        ▼
PCFeedNormalizer
        │
        ▼
normalized
        │
        ▼
PCProductBuilder
        │
        ▼
payload
        │
        ▼
AsusSemanticBuilder
        │
        ▼
SemanticRuntimeBuilder
        │
        ▼
PCProduct
```

楽天対応では、この構造を維持する。

---

# 4. Rakuten Import Pipeline

```
Rakuten Item
        │
        ▼
RakutenFeedParser
        │
        ▼
parsed
        │
        ▼
PCFeedNormalizer
        │
        ▼
normalized
        │
        ▼
PCProductBuilder
        │
        ▼
payload
        │
        ▼
AsusSemanticBuilder
        │
        ▼
SemanticRuntimeBuilder
        │
        ▼
PCProduct
```

---

# 5. RakutenFeedParser Specification

## Responsibility

楽天API固有のデータ構造を解析する。

Parserは楽天固有形式のみを扱う。

BuilderおよびSemantic処理には関与しない。

---

## Input

楽天API Item（商品1件）

例

- itemCode
- itemName
- itemPrice
- itemUrl
- itemCaption
- mediumImageUrls

---

## Output

Parserは以下の辞書を返す。

```python
{
    "sku",
    "name",
    "price",
    "url",
    "image_url",
    "description",

    "category",
    "keywords",

    "raw_data",
}
```

raw_dataには楽天Item全体を保持する。

---

# 6. PCFeedNormalizer Contract

NormalizerはParserの出力を受け取り、
Builderが扱える共通データ構造へ変換する。

入力

```
normalize(source, parsed)
```

出力

```python
{
    "sku",
    "name",
    "description",
    "price",
    "image_url",
    "url",
    "category",
    "keywords",
}
```

Builderが利用する必須キーは

- sku
- name
- description
- price
- image_url
- url

である。

---

# 7. PCProductBuilder Contract

Builderは以下を生成する。

```python
unique_id
site_prefix
maker

name
price

url
affiliate_url

image_url
description

raw_genre
unified_genre

stock_status
is_active
```

Builder仕様は変更しない。

---

# 8. Semantic Pipeline

Builder生成後、

以下を実行する。

```
AsusSemanticBuilder

↓

SemanticRuntimeBuilder
```

Semantic Runtime生成方式は変更しない。

---

# 9. Import Service

Import Serviceの責務

1. Parser実行
2. Normalizer実行
3. Builder実行
4. Semantic生成
5. Runtime生成
6. PCProduct保存

保存方式

```
PCProduct.objects.update_or_create(
    unique_id=payload["unique_id"],
    defaults=payload,
)
```

変更しない。

---

# 10. Responsibilities

## RakutenFeedParser

楽天JSON解析

---

## PCFeedNormalizer

共通データへ変換

---

## PCProductBuilder

PCProduct Payload生成

---

## SemanticBuilder

Semantic生成

---

## RuntimeBuilder

Runtime生成

---

## PCProduct

永続化

---

# 11. API Team Implementation Scope

新規実装対象

- RakutenFeedParser

必要に応じて

- RakutenImportService

既存利用

- PCFeedNormalizer
- PCProductBuilder
- AsusSemanticBuilder
- SemanticRuntimeBuilder

変更禁止

- PCProductBuilder
- SemanticBuilder
- RuntimeBuilder
- PCProduct Model

---

# 12. Architecture Policy

楽天対応は、

**既存PC Import Architectureへの適合**

を目的とする。

楽天専用Builderは作成しない。

Semantic処理は変更しない。

PCProductの保存方式は変更しない。

楽天固有の責務はParser（および必要に応じてImport Service）に限定する。

---

# 13. Future Expansion

本仕様は楽天専用ではなく、

将来的に

- Yahoo! Shopping
- Amazon
- メーカーAPI
- その他ECサイト

への展開を想定したImport Specificationの標準形とする。

各ECサイトは、

```
FeedParser
    ↓
PCFeedNormalizer
    ↓
PCProductBuilder
```

という共通Import Pipelineへ適合させるものとする。

---

# Revision History

| Version | Date | Description |
|----------|------|-------------|
| 1.0 | Initial Draft | Rakuten Import Architecture Specification |