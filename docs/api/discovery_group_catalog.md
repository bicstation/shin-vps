# Discovery Group Catalog

Version: 1.0

Source

GET /api/pc/discover/

Authority

Discovery Runtime

---

## Purpose

Frontend Group Universe Catalog

---

利用用途

* Discovery Page
* Navigation Menu
* Ranking Navigation
* Finder Group Selector
* Category Pages

---

# Visibility Policy

| Value    | Meaning   |
| -------- | --------- |
| visible  | 通常表示      |
| disabled | 表示するが選択不可 |
| hidden   | UI非表示     |

---

# Usage Groups

| group_slug     | group_name | product_count | recommended_visibility |
| -------------- | ---------- | ------------- | ---------------------- |
| usage-budget   | コスパ用途      | 353           | visible                |
| usage-gaming   | ゲーミング用途    | 19            | visible                |
| usage-business | ビジネス用途     | 18            | visible                |
| usage-ai       | AI用途       | 11            | visible                |
| usage-creator  | クリエイター用途   | 0             | disabled               |
| usage-mobile   | モバイル用途     | 0             | disabled               |

---

# Device Groups

| group_slug         | group_name | product_count | recommended_visibility |
| ------------------ | ---------- | ------------- | ---------------------- |
| device-laptop      | ノートPC      | 165           | visible                |
| device-desktop     | デスクトップPC   | 142           | visible                |
| device-mini        | ミニPC       | 8             | visible                |
| device-workstation | ワークステーション  | 4             | visible                |
| device-mobile      | モバイルPC     | 2             | visible                |
| device-server      | サーバー       | 0             | disabled               |

---

# CPU Groups

| group_slug      | group_name   | product_count | recommended_visibility |
| --------------- | ------------ | ------------- | ---------------------- |
| cpu-mainstream  | 主流CPU        | 336           | visible                |
| cpu-ai          | AI向けCPU      | 19            | visible                |
| cpu-entry       | エントリーCPU     | 9             | visible                |
| cpu-highend     | ハイエンドCPU     | 2             | visible                |
| cpu-workstation | ワークステーションCPU | 0             | disabled               |
| cpu-arm         | ARM系CPU      | 0             | disabled               |

---

# GPU Groups

| group_slug       | group_name | product_count | recommended_visibility |
| ---------------- | ---------- | ------------- | ---------------------- |
| gpu-integrated   | 内蔵GPU      | 22            | visible                |
| gpu-highend      | ハイエンドGPU   | 3             | visible                |
| gpu-mainstream   | 主流GPU      | 0             | disabled               |
| gpu-entry        | エントリーGPU   | 0             | disabled               |
| gpu-professional | 業務向けGPU    | 0             | disabled               |

---

# Memory Groups

| group_slug      | group_name | product_count | recommended_visibility |
| --------------- | ---------- | ------------- | ---------------------- |
| memory-standard | 標準メモリ      | 412           | visible                |
| memory-entry    | 最低限メモリ     | 28            | visible                |
| memory-highend  | 大容量メモリ     | 4             | visible                |

---

# Storage Groups

| group_slug       | group_name | product_count | recommended_visibility |
| ---------------- | ---------- | ------------- | ---------------------- |
| storage-standard | 標準ストレージ    | 323           | visible                |
| storage-highend  | 大容量ストレージ   | 0             | disabled               |
| storage-fast     | 高速ストレージ    | 0             | disabled               |

---

# Monitor Groups

| group_slug          | group_name | product_count | recommended_visibility |
| ------------------- | ---------- | ------------- | ---------------------- |
| monitor-creator     | クリエイターモニター | 7             | visible                |
| monitor-gaming      | ゲーミングモニター  | 3             | visible                |
| monitor-highrefresh | 高リフレッシュ    | 3             | visible                |
| monitor-business    | 業務向けモニター   | 0             | disabled               |
| monitor-ultrawide   | ウルトラワイド    | 0             | disabled               |
| monitor-oled        | OLEDモニター   | 0             | disabled               |

---

# Maker Groups

| group_slug   | group_name | product_count | recommended_visibility |
| ------------ | ---------- | ------------- | ---------------------- |
| maker-global | 海外メーカー     | 453           | visible                |
| maker-gaming | ゲーミングブランド  | 257           | visible                |
| maker-japan  | 国内メーカー     | 0             | disabled               |

---

# Adult Groups

| group_slug    | group_name | product_count | recommended_visibility |
| ------------- | ---------- | ------------- | ---------------------- |
| adult-feature | 映像特徴       | 6             | visible                |
| adult-actress | 女優系        | 0             | disabled               |
| adult-body    | 体型・見た目     | 0             | disabled               |
| adult-scene   | シチュエーション   | 0             | disabled               |
| adult-style   | プレイ内容      | 0             | disabled               |

---

# Frontend Rules

group_slug を Frontend 固定値として管理しない。

Discovery Runtime を Authority とする。

product_count は Runtime の値を利用する。

Visibility は Frontend Policy で最終決定する。

---

Status

Production Ready
