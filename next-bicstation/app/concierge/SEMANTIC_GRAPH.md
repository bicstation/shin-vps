<!-- /home/maya/shin-vps/next-bicstation/app/concierge/SEMANTIC_GRAPH.md -->

# SHIN CORE LINX｜Concierge AI Semantic Graph

## 1. Overview

The **Semantic Graph** is the core knowledge structure powering Concierge AI:

* Represents **products, user intents, and semantic attributes** as nodes.
* Connects nodes through **edges** indicating relationships, similarity, or recommendations.
* Enables **semantic reasoning, recommendation scoring, and navigation**.

The graph is maintained both in memory and persisted via runtime stores.

---

## 2. Nodes

### 2.1 Product Nodes

* Represent individual products (PCs, configurations, etc.)
* Properties include:

  * `unique_id`
  * `name`
  * `attributes` (semantic attributes)
  * `grouped_attributes` (grouped for recommendation)
  * `score` / `semantic_score`

### 2.2 Semantic Nodes

* Represent semantic concepts (e.g., usage-gaming, gpu-rtx-4070)
* Properties include:

  * `slug`
  * `name`
  * `semantic_role` (`highlight`, `primary`, etc.)
  * `semantic_weight`
  * `icon` / `color`
* Used to map user intent to product recommendations.

### 2.3 User Intent Nodes

* Capture live user intent from chat or finder queries.
* Connected to semantic nodes and product nodes.
* Properties:

  * `usage`, `gpu`, `cpu`, `maker`, `memory`, `storage`, `ai`, `workload`
  * `budget` (optional)
* Provides **entry point for reasoning and recommendation flows**.

---

## 3. Edges

* **Recommendation Edges**: Connect product nodes with semantic nodes or other product nodes indicating similarity or suitability.
* **Intent Edges**: Connect user intent nodes to semantic nodes based on extracted intent.
* **Weighting**: Each edge can include `semantic_score`, `similarity_score`, or `confidence`.

---

## 4. Graph Operations

1. **Insertion**

   * Add new products, semantic attributes, or intents.
   * Ensure edges are created to reflect semantic similarity or recommendation rules.

2. **Traversal**

   * Semantic reasoning algorithms traverse edges to discover suitable products for a given intent.
   * Ranking and scoring use edge weights.

3. **Aggregation**

   * Group nodes by semantic type (usage, gpu, cpu, maker).
   * Compute combined scores for recommendation.

4. **Filtering**

   * Limit search to specific budgets, intents, or categories.
   * Soft fallback using related semantic nodes if exact match not found.

---

## 5. Integration with Flows

* **Conversation Flow**: Connects live user messages to intent nodes.
* **Semantic Flow**: Updates or reasons over semantic nodes.
* **Recommendation Flow**: Traverses graph edges to generate ranked recommendations.
* **Routing Flow**: Maps graph results to frontend routes (e.g., `/product/<unique_id>` or `/ranking/<slug>`).

---

## 6. Example Graph

```
[User Intent: usage-gaming]
          |
          v
[Semantic Node: usage-gaming] ---[weight:0.8]--> [Product Node: RTX4080 Gaming PC]
          |
          v
[Semantic Node: gpu-rtx-4080] ---[weight:0.9]--> [Product Node: RTX4080 Gaming PC]
```

* Multi-edge, multi-node connections allow **explainable recommendations**.
* Scores are calculated dynamically using `semantic_score` and `confidence`.

---

## 7. Key Principles

1. **Backend Authority**: The semantic graph is authoritative; frontend only consumes.
2. **Composable Nodes & Edges**: Supports addition of new product lines, semantic attributes, and recommendation rules.
3. **Explainability**: Each recommendation can trace back through semantic nodes and edges to justify selection.
4. **Extensibility**: Future integration with AI-generated semantic attributes or LLM reasoning is supported.
