■ semantic API inventory（初版）
（backend semantic structure definition）

■ 目的

frontend semantic rendering layer に対し：

semantic API contract

を正式定義する

■ 現在の semantic API 構造

backend は現在：

semantic authority
semantic metadata provider
semantic grouping provider

として動作

■ 共通 semantic payload schema
attribute object
{
  "id": 51,

  "attr_type": "usage",
  "attr_type_display": "usage",

  "name": "クリエイター向け",
  "slug": "usage-creator",

  "order": 712,

  "semantic_role": "highlight",
  "semantic_weight": 0.92,

  "icon": "pen-tool",
  "color": "purple"
}
■ semantic fields 定義
field	role
semantic_role	rendering importance
semantic_weight	semantic strength
icon	semantic icon hint
color	semantic color hint
■ semantic_role enum
highlight
primary
secondary
supportive
■ semantic grouping structure
"grouped_attributes": {
  "usage": [...],
  "gpu": [...],
  "cpu": [...],
  "maker": [...],
  "memory": [...],
  "storage": [...]
}
■ grouping order authority

backend 側で固定：

usage
gpu
cpu
maker
memory
storage
feature
■ API Inventory
① PCProduct Detail API
URL
/api/pc-products/<unique_id>/
Method
GET
Params
param	type	required
unique_id	string	yes
semantic payload
field
attributes
grouped_attributes
grouped_attributes

✅ supported

frontend usage
usage
Product Hero
Semantic Sections
Spec Rendering
AI Summary UI
Related Candidate Base
■ response example
{
  "id": 1,
  "name": "Example PC",

  "attributes": [...],

  "grouped_attributes": {
    "usage": [...],
    "gpu": [...],
    "cpu": [...]
  }
}
② Ranking API
URL
/api/pc-products/ranking/
Method
GET
Params（想定）
param	role
usage	semantic filtering
maker	semantic filtering
gpu	semantic filtering
semantic payload
field
attributes
grouped_attributes
grouped_attributes

✅ supported

frontend usage
usage
Ranking Cards
Semantic Badge Rendering
Ranking Filters
Usage Ranking
③ Related API
URL
/api/pc-products/<unique_id>/related/
Method
GET
semantic payload
field
attributes
grouped_attributes
grouped_attributes

✅ supported

frontend usage
usage
Related Cards
Similar Semantic Blocks
Recommendation Zones
④ Finder API（planned）
URL（planned）
/api/finder/
Method
GET
semantic request params（planned）
param	role
usage	semantic intent
gpu	semantic filter
cpu	semantic filter
maker	semantic filter
memory	semantic filter
storage	semantic filter
semantic payload
field
attributes
grouped_attributes
semantic_score（planned）
confidence（planned）
grouped_attributes

✅ planned

frontend usage
usage
Finder UI
Semantic Search
AI Recommendation
Dynamic Filtering
■ frontend semantic rendering 方針

frontend は：

semantic rendering layer

として動作

■ frontend が保持しないもの
meaning definition
group ordering
semantic priority
semantic grouping logic
■ backend authority

backend は：

semantic definition
semantic grouping
semantic ordering
semantic metadata

を保持

■ semantic engine current architecture
TSV
↓
semantic metadata
↓
Loader
↓
DB sync
↓
semantic entities
↓
Serializer
↓
semantic grouping
↓
semantic payload
↓
frontend semantic rendering
■ 現段階で未実施
confidence
multi-usage
semantic graph
semantic relation
embedding
■ 現在到達点

semantic API は：

implementation detail

ではなく：

semantic structure contract

として定義開始

以上

■ semantic API structure（現段階まとめ）

========================================
① PCProduct Detail API
========================================

■ URL

/api/pc-products/<unique_id>/

■ 実例

/api/pc-products/2557_sdc1625555401mpnojp/

■ Method

GET

■ 役割

単一PC商品の semantic detail を取得

■ 主なresponse

{
  "id": 1,
  "name": "Example PC",

  "attributes": [...],

  "grouped_attributes": {
    "usage": [...],
    "gpu": [...],
    "cpu": [...],
    "maker": [...],
    "memory": [...],
    "storage": [...]
  }
}

■ frontend用途

・Product Hero
・Semantic Sections
・Spec UI
・Badge Rendering
・AI Summary


========================================
② Ranking API
========================================

■ URL

/api/pc-products/ranking/

■ Method

GET

■ query例

/api/pc-products/ranking/?usage=usage-gaming

/api/pc-products/ranking/?gpu=gpu-rtx-5070

■ 役割

semantic条件ベースのランキング取得

■ semantic payload

attributes
grouped_attributes

■ frontend用途

・Ranking Cards
・Semantic Ranking
・Usage Ranking
・Filter UI


========================================
③ Related API
========================================

■ URL

/api/pc-products/<unique_id>/related/

■ 実例

/api/pc-products/2557_sdc1625555401mpnojp/related/

■ Method

GET

■ 役割

semantic類似商品取得

■ semantic payload

attributes
grouped_attributes

■ frontend用途

・Related Cards
・Recommendation Zone
・Semantic Similar Products


========================================
④ Finder API（予定）
========================================

■ URL

/api/finder/

■ Method

GET

■ query例

/api/finder/?usage=usage-gaming

/api/finder/?usage=usage-creator&memory=mem-32gb

/api/finder/?gpu=gpu-rtx-5070&storage=ssd-1tb

■ 役割

semantic attribute ベース検索

■ semantic request構造

usage
gpu
cpu
maker
memory
storage

■ semantic payload

attributes
grouped_attributes

■ 将来追加予定

semantic_score
confidence

■ frontend用途

・Finder UI
・Semantic Search
・AI Recommendation
・Dynamic Filters


========================================
■ semantic attribute schema
========================================

{
  "id": 51,

  "attr_type": "usage",
  "attr_type_display": "usage",

  "name": "クリエイター向け",
  "slug": "usage-creator",

  "order": 712,

  "semantic_role": "highlight",
  "semantic_weight": 0.92,

  "icon": "pen-tool",
  "color": "purple"
}


========================================
■ semantic fields
========================================

semantic_role
→ semantic importance

semantic_weight
→ semantic strength

icon
→ rendering hint

color
→ rendering hint


========================================
■ grouped_attributes structure
========================================

"grouped_attributes": {

  "usage": [...],

  "gpu": [...],

  "cpu": [...],

  "maker": [...],

  "memory": [...],

  "storage": [...],

  "feature": [...]
}


========================================
■ semantic grouping order
========================================

usage
gpu
cpu
maker
memory
storage
feature


========================================
■ backend responsibility
========================================

backend は：

・semantic meaning
・semantic metadata
・semantic grouping
・semantic ordering
・semantic authority

を保持する


========================================
■ frontend responsibility
========================================

frontend は：

semantic payload
↓
renderer
↓
layout
↓
UI rendering

のみ担当


========================================
■ 現在の semantic engine architecture
========================================

TSV
↓
semantic metadata
↓
Loader
↓
DB sync
↓
semantic entities
↓
Serializer
↓
semantic grouping
↓
semantic payload
↓
frontend semantic rendering


========================================
■ 現在到達点
========================================

backend semantic engine は：

「タグAPI」

ではなく：

「semantic structure platform」

として動作開始