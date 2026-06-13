# SHIN CORE LINX Documentation

Version: 1.0

Status: Active

---

## Purpose

このドキュメント群は SHIN CORE LINX の開発者向け資料です。

新規参加者が 5 分以内に以下を把握できることを目的とします。

* SHIN CORE LINX の設計思想
* Frontend / Backend の責務
* 利用可能な API
* Discovery Group 一覧
* Finder Attribute 一覧

---

# Reading Order

## 1. Core Constitution

Location

```text
docs/architecture/core_constitution.md
```

内容

* SHIN CORE LINX の最上位原則
* Reality First
* Semantic Authority
* Backend Responsibility

---

## 2. Page Meaning Contract

Location

```text
docs/architecture/page_meaning_contract.md
```

内容

* 各ページの存在理由
* User Intent
* Meaning Definition

---

## 3. Frontend Contract

Location

```text
docs/architecture/frontend_contract.md
```

内容

* Frontend の責務
* Frontend の禁止事項
* Rendering Layer Definition

---

## 4. TypeScript Contract

Location

```text
docs/architecture/typescript_contract.md
```

内容

* API Contract
* Common Response
* Product Response
* Discovery Response
* Finder Response

---

## 5. API Reference

Location

```text
docs/api/api_reference_v1.md
```

内容

* Top API
* Discovery API
* Ranking API
* Finder API
* Product API
* Related API

---

## 6. Discovery Group Catalog

Location

```text
docs/api/discovery_group_catalog.md
```

内容

* Group Universe
* Group Name
* Product Count
* Visibility Policy

---

## 7. Finder Attribute Catalog

Location

```text
docs/api/finder_attribute_catalog.md
```

内容

* Finder Filters
* Attribute Definitions
* Attribute Groups

---

# Development Flow

Reality

↓

Semantic Authority

↓

API Runtime

↓

Frontend Rendering

---

# Important Rule

Frontend は Meaning を生成しない。

Frontend は SEO を生成しない。

Frontend は Semantic Authority を生成しない。

Backend Runtime を Authority とする。

---

# Current API Coverage

| API       | Status |
| --------- | ------ |
| Top       | Ready  |
| Discovery | Ready  |
| Ranking   | Ready  |
| Finder    | Ready  |
| Product   | Ready  |
| Related   | Ready  |

---

# Documentation Structure

```text
docs/

├── README.md

├── architecture/

│   ├── core_constitution.md
│   ├── page_meaning_contract.md
│   ├── frontend_contract.md
│   └── typescript_contract.md

├── api/

│   ├── api_reference_v1.md
│   ├── endpoint_catalog.md
│   ├── discovery_group_catalog.md
│   ├── finder_attribute_catalog.md
│   └── changelog.md

└── archive/
```

---

Status

Developer Ready
