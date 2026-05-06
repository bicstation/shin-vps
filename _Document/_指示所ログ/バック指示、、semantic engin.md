■ backend semantic engine 強化フェーズ指示

■ 目的

frontend semantic rendering layer 導入に伴い、
backend を semantic authority として強化する

---

■ 方針

backend は：

semantic meaning source

として動作する

frontend は：

semantic rendering

のみ担当

---

■ 次フェーズ（重要）

semantic metadata layer を backend に正式導入する

---

■ 推奨attribute schema（拡張版）

{
id,
slug,
name,
type,

priority,
score,

icon,
color,

semantic_role,
semantic_weight,

keywords,
}

---

■ 新規導入推奨項目

① semantic_role

例：

primary
secondary
supportive
highlight

用途：
frontend rendering hint

---

② semantic_weight

semantic importance を数値化

例：

usage-gaming → 0.95
maker-asus → 0.45

用途：
Finder / Recommendation / Ranking

---

③ icon / color

semantic rendering metadata

frontend側へ提供可能にする

---

■ backend責務（重要）

backend は：

・semantic definition
・semantic scoring
・semantic priority
・semantic metadata

を保持する

---

■ frontend責務

frontend は：

semantic metadata
↓
rendering policy
↓
UI expression

のみ担当

---

■ 次フェーズ推奨

① semantic metadata API化
② semantic scoring強化
③ multi-usage対応
④ confidence導入
⑤ negative semantic対応

---

■ 特に重要

usage は：

semantic intent layer

として扱う

---

■ 将来的展開

semantic engine を：

Finder
Recommendation
Ranking
AI reasoning

の共通基盤へ統合する

---

■ backend現在状態

TSV-driven semantic engine 化済

構成：

TSV
↓
DB sync
↓
semantic matcher
↓
usage scoring
↓
attribute attach

---

■ 次ゴール

semantic attribute を：

「タグ」

ではなく

「意味を持つUI駆動データ」

へ進化させる

---

■ 総評

semantic engine は
実運用段階へ到達

次フェーズは：

semantic intelligence layer

の構築

以上
