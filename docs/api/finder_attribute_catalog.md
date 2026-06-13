# Finder Attribute Catalog

Version: 0.9

Status

Preliminary

Authority Audit Pending

---

# Purpose

Finder UI Construction

Frontend Filter UI Construction

---

# Important Notice

このドキュメントは。

```text
Phase 1
Frontend Enablement
```

用の暫定版である。

---

Attribute Authority Audit は。

```text
Phase 2
```

で実施予定。

---

従って。

```text
最終 Authority
```

ではない。

---

# Finder Request

```http
POST /api/pc/finder/
```

---

Example

```json
{
  "groups": [
    "usage-ai"
  ],
  "limit": 20
}
```

---

# Supported Groups

Discovery Runtime より取得。

---

## Usage

| group_slug     | display_name |
| -------------- | ------------ |
| usage-ai       | AI用途         |
| usage-business | ビジネス用途       |
| usage-gaming   | ゲーミング用途      |
| usage-budget   | コスパ用途        |
| usage-creator  | クリエイター用途     |
| usage-mobile   | モバイル用途       |

---

## Device

| group_slug         | display_name |
| ------------------ | ------------ |
| device-laptop      | ノートPC        |
| device-desktop     | デスクトップPC     |
| device-mini        | ミニPC         |
| device-workstation | ワークステーション    |
| device-mobile      | モバイルPC       |
| device-server      | サーバー         |

---

## CPU

| group_slug      | display_name |
| --------------- | ------------ |
| cpu-mainstream  | 主流CPU        |
| cpu-ai          | AI向けCPU      |
| cpu-entry       | エントリーCPU     |
| cpu-highend     | ハイエンドCPU     |
| cpu-workstation | ワークステーションCPU |
| cpu-arm         | ARM系CPU      |

---

## GPU

| group_slug       | display_name |
| ---------------- | ------------ |
| gpu-integrated   | 内蔵GPU        |
| gpu-mainstream   | 主流GPU        |
| gpu-entry        | エントリーGPU     |
| gpu-highend      | ハイエンドGPU     |
| gpu-professional | 業務向けGPU      |

---

## Memory

| group_slug      | display_name |
| --------------- | ------------ |
| memory-entry    | 最低限メモリ       |
| memory-standard | 標準メモリ        |
| memory-highend  | 大容量メモリ       |

---

## Storage

| group_slug       | display_name |
| ---------------- | ------------ |
| storage-standard | 標準ストレージ      |
| storage-fast     | 高速ストレージ      |
| storage-highend  | 大容量ストレージ     |

---

# Known Runtime Attributes

実レスポンスおよび Runtime から確認済み。

---

| attribute_slug | description |
| -------------- | ----------- |
| usage-ai       | AI用途        |
| usage-business | ビジネス用途      |
| usage-gaming   | ゲーミング用途     |
| usage-creator  | クリエイター用途    |
| cpu-ai         | AI向けCPU     |
| gpu-highend    | ハイエンドGPU    |
| memory-highend | 大容量メモリ      |
| maker-global   | 海外メーカー      |
| maker-gaming   | ゲーミングブランド   |

---

# Current Finder Contract

Request

```json
{
  "groups": [],
  "attributes": [],
  "limit": 100
}
```

---

## Fields

### groups

Group Filter

Type

```text
array[string]
```

---

### attributes

Attribute Filter

Type

```text
array[string]
```

---

### limit

Maximum Result Count

Type

```text
integer
```

Default

```text
100
```

---

# Frontend Recommendation

Phase 1 では。

```text
Group Filter
```

のみで UI 構築を推奨。

---

理由。

Group Universe は。

```text
Discovery Runtime
```

から確定取得可能。

---

一方。

Attribute Universe は。

```text
Authority Audit Pending
```

である。

---

# Phase 2

Authority Audit 完了後。

以下を追加予定。

```text
attribute_slug

attribute_name

group

description

recommended_ui

display_order
```

---

Status

Frontend Ready

Authority Audit Pending
