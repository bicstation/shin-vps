<!-- /home/maya/shin-vps/next-bicstation/app/concierge/ARCHITECTURE.md -->


# SHIN CORE LINX｜Concierge AI Architecture

## 1. Overview

The Concierge AI module is a **semantic commerce orchestration system** designed to handle:

* **Conversation** – managing user messages and session states
* **Semantic reasoning** – interpreting user intents and product attributes
* **Recommendation** – generating, ranking, and scoring product suggestions
* **Runtime orchestration** – coordinating flows, pipelines, and memory
* **Routing** – translating semantic queries into navigation actions
* **Memory management** – maintaining session, conversation, and semantic memory

The system is built for **modular flows**, **transport abstraction**, and **frontend-backend separation**.

---

## 2. Layers

### 2.1 Orchestration / Flows

Manages sequential and parallel flows:

* **Conversation Flows**: `ConciergeConversationFlow`, `ConversationIntentFlow`, `ConversationMessageFlow`, `ConversationRuntimeFlow`, `ConversationStateFlow`
* **Semantic Flows**: `ConciergeSemanticFlow`, `SemanticExtractionFlow`, `SemanticReasoningFlow`, `SemanticRoutingFlow`, `SemanticRuntimeFlow`
* **Recommendation Flows**: `ConciergeRecommendationFlow`, `ProductRecommendationFlow`, `RecommendationRankingFlow`, `RecommendationRuntimeFlow`, `SemanticRecommendationFlow`
* **Routing Flows**: `ConciergeRoutingFlow`, `FinderRoutingFlow`, `ProductRoutingFlow`, `RankingRoutingFlow`, `RoutingRuntimeFlow`
* **Runtime / LLM Flows**: `RuntimeFlow`, `SemanticRuntimeFlow`, `ConciergeLLMFlow`, `IntentInferenceFlow`, `LLMResponseFlow`, `PromptGenerationFlow`
* **Memory Flows**: `ConciergeMemoryFlow`, `ConversationMemoryFlow`, `SemanticMemoryFlow`, `SessionMemoryFlow`, `MemoryRuntimeFlow`
* **Conversion Flows**: `CommerceConversionFlow`, `ConciergeConversionFlow`, `RecommendationConversionFlow`

---

### 2.2 Transport Layer

Abstracts backend and external API calls:

* **Adapters**: `finderAdapter`, `openaiAdapter`, `productAdapter`, `rankingAdapter`
* **Internal Transports**: `runtimeTransport`, `semanticTransport`
* **External Transports**: `finderTransport`, `openaiTransport`, `productTransport`, `rankingTransport`
* **Caching**: `cacheTransport`

---

### 2.3 Runtime Layer

Provides the core **execution engine** for the system:

* **Chat Runtime**: session and streaming support
* **Memory Runtime**: conversation, semantic, and session memory
* **Recommendation Runtime**: scoring, ranking, and recommendation generation
* **Routing Runtime**: semantic navigation
* **Semantic Runtime**: reasoning, query processing, and semantic scoring

---

### 2.4 Frontend Components

* **Chat / Conversation**: `ChatHero`, `ChatInput`, `ChatMessageList`, `TypingIndicator`, `ConversationHeader`, `ConversationFooter`
* **Semantic / Recommendation**: `RecommendationCard`, `RecommendationList`, `SemanticBadge`, `SuggestionChips`
* **Sidebar / System**: `ChatSidebar`, `ConciergeEmpty`, `ConciergeError`, `ConciergeLoading`

---

### 2.5 State Management

* **Hooks**: `useConciergeChat`, `useConciergeState`, `useConversationMemory`, `useRecommendationEngine`, `useSemanticConversation`, `useSemanticRouting`
* **Stores**: `conversationStore`, `recommendationStore`, `conciergeStore`

---

### 2.6 Semantic Layer

Handles extraction, reasoning, routing, and recommendations:

* **Extraction**: intent parsers (`extractBudgetIntent`, `extractGPUIntent`, etc.)
* **Reasoning**: build reasoning for conversation, product, and recommendation
* **Recommendation**: score, rank, and generate semantic recommendations
* **Routing**: convert semantic queries into application routes
* **Graph**: nodes and edges representing products, intents, and semantic relationships

---

### 2.7 System & Config

* **Context / Config**: `SystemContext`, `runtime.config`, `semantic.config`
* **Event Bus**: `SystemEventBus`
* **Registry**: `AgentRegistry`, `RuntimeRegistry`

---

### 2.8 Dummy Data / Prompts

* **Dummy**: `conciergeMessages`, `conciergeRecommendations`, `semanticPayload`
* **Prompts**: `recommendationPrompt`, `semanticPrompt`, `systemPrompt`

---

### 2.9 Principles

* **Backend semantic authority** – all semantic logic resides in backend flows.
* **Frontend is rendering layer only** – uses flows outputs to render UX.
* **Transport abstraction** – supports multiple APIs and caching.
* **Flow modularity** – each flow is composable and reusable.
* **Memory integration** – conversation and semantic memory updated incrementally.

---

### 2.10 Directory Snapshot

```
app/concierge/
├─ adapters/
├─ components/
├─ constants/
├─ dummy/
├─ engine/
├─ error.tsx
├─ hooks/
├─ lib/
├─ loading.tsx
├─ memory/
├─ not-found.tsx
├─ orchestration/
├─ page.tsx
├─ pipelines/
├─ prompts/
├─ providers/
├─ sections/
├─ semantic/
├─ state/
├─ styles/
├─ transport/
├─ types/
└─ utils/
```

This architecture forms a **modular, transport-agnostic, semantic-driven AI system** capable of conversation, recommendation, routing, and memory management.
