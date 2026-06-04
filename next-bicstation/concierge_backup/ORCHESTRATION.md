<!-- /home/maya/shin-vps/next-bicstation/app/concierge/ORCHESTRATION.md -->

# SHIN CORE LINX｜Concierge AI Orchestration Overview

## 1. Purpose

This document describes the orchestration layer of **Concierge AI**, which coordinates the interaction between:

* **Conversation**
* **Semantic reasoning**
* **Recommendation engine**
* **Runtime flows**
* **Routing**
* **Memory management**

It acts as the "brain" of the AI, handling flows, pipelines, and module interactions.

---

## 2. Core Concepts

### 2.1 Flow Modules

Orchestration is implemented as **flows**, each encapsulating a sequence of steps:

* **Conversation Flows**

  * `ConciergeConversationFlow`
  * `ConversationIntentFlow`
  * `ConversationMessageFlow`
  * `ConversationRuntimeFlow`
  * `ConversationStateFlow`

* **Semantic Flows**

  * `ConciergeSemanticFlow`
  * `SemanticExtractionFlow`
  * `SemanticReasoningFlow`
  * `SemanticRoutingFlow`
  * `SemanticRuntimeFlow`

* **Recommendation Flows**

  * `ConciergeRecommendationFlow`
  * `ProductRecommendationFlow`
  * `RecommendationRankingFlow`
  * `RecommendationRuntimeFlow`
  * `SemanticRecommendationFlow`

* **Routing Flows**

  * `ConciergeRoutingFlow`
  * `FinderRoutingFlow`
  * `ProductRoutingFlow`
  * `RankingRoutingFlow`
  * `RoutingRuntimeFlow`

* **Memory Flows**

  * `ConciergeMemoryFlow`
  * `ConversationMemoryFlow`
  * `SemanticMemoryFlow`
  * `SessionMemoryFlow`
  * `MemoryRuntimeFlow`

* **Runtime / LLM Flows**

  * `RuntimeFlow`
  * `SemanticRuntimeFlow`
  * `ConciergeLLMFlow`
  * `IntentInferenceFlow`
  * `LLMResponseFlow`
  * `PromptGenerationFlow`

* **Conversion / Commerce Flows**

  * `CommerceConversionFlow`
  * `ConciergeConversionFlow`
  * `RecommendationConversionFlow`

---

### 2.2 Flow Responsibilities

1. **Semantic inference**: Analyze user intents and attributes.
2. **Recommendation orchestration**: Generate, rank, and score recommendations.
3. **Routing**: Map semantic intents to application routes (e.g., product page, ranking, finder).
4. **Runtime handling**: Manage stateful executions, including session and memory integration.
5. **Memory**: Maintain conversation, semantic, and session memory.

---

### 2.3 Flow Design Patterns

* **Sequential flow**: One step executes after another (e.g., extraction → reasoning → recommendation)
* **Parallel flow**: Independent steps execute concurrently (e.g., scoring multiple recommendation candidates)
* **Runtime hooks**: Provide dynamic overrides or middleware during execution
* **Transport integration**: All backend/external communication is abstracted via transport adapters

---

### 2.4 Example Flow

**Product Recommendation Flow**:

```
User Intent → Semantic Extraction → Semantic Reasoning → Recommendation Generation → Ranking → Conversion → Response
```

**Notes**:

* Each step is a modular `FlowStep` with explicit `execute(input)` and `next` references.
* Flows are composable and reusable for other domains (e.g., PC Finder, Ranking).

---

### 2.5 Key Benefits

* **Separation of concerns**: Frontend rendering, backend semantic authority, and orchestration are decoupled.
* **Traceable execution**: Each flow logs its input/output for debugging.
* **Extensible**: New modules (e.g., new recommendation strategies or semantic features) can be plugged in.
* **Unified protocol**: Semantic routing, recommendation, ranking, and finder all operate under the same transport abstraction.

---

### 2.6 Orchestration Directory Structure

```
/orchestration
├─ conversation/
│  ├─ ConciergeConversationFlow.tsx
│  ├─ ConversationIntentFlow.tsx
│  ├─ ConversationMessageFlow.tsx
│  ├─ ConversationRuntimeFlow.tsx
│  └─ ConversationStateFlow.tsx
├─ semantic/
│  ├─ ConciergeSemanticFlow.tsx
│  ├─ SemanticExtractionFlow.tsx
│  ├─ SemanticReasoningFlow.tsx
│  ├─ SemanticRoutingFlow.tsx
│  └─ SemanticRuntimeFlow.tsx
├─ recommendation/
│  ├─ ConciergeRecommendationFlow.tsx
│  ├─ ProductRecommendationFlow.tsx
│  ├─ RecommendationRankingFlow.tsx
│  ├─ RecommendationRuntimeFlow.tsx
│  └─ SemanticRecommendationFlow.tsx
├─ routing/
│  ├─ ConciergeRoutingFlow.tsx
│  ├─ FinderRoutingFlow.tsx
│  ├─ ProductRoutingFlow.tsx
│  ├─ RankingRoutingFlow.tsx
│  └─ RoutingRuntimeFlow.tsx
├─ runtime/
│  ├─ RuntimeFlow.tsx
│  ├─ SemanticRuntimeFlow.tsx
│  ├─ ConciergeLLMFlow.tsx
│  ├─ IntentInferenceFlow.tsx
│  ├─ LLMResponseFlow.tsx
│  └─ PromptGenerationFlow.tsx
├─ memory/
│  ├─ ConciergeMemoryFlow.tsx
│  ├─ ConversationMemoryFlow.tsx
│  ├─ SemanticMemoryFlow.tsx
│  ├─ SessionMemoryFlow.tsx
│  └─ MemoryRuntimeFlow.tsx
├─ conversion/
│  ├─ CommerceConversionFlow.tsx
│  ├─ ConciergeConversionFlow.tsx
│  └─ RecommendationConversionFlow.tsx
```

---

### 2.7 Logging & Debugging

* Every flow includes console logging for:

```
input parameters
normalized outputs
step-by-step execution
errors and exceptions
```

* Debug flows (`DebugFlow.tsx`) are available to test individual orchestration modules.

---

This completes the **Concierge AI orchestration overview**, suitable as a reference for developers and onboarding.

It illustrates how **semantic, recommendation, runtime, memory, and routing flows** are structured and integrated for SHIN CORE LINX.
