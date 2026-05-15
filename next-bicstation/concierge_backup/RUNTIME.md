<!-- /home/maya/shin-vps/next-bicstation/app/concierge/RUNTIME.md -->

# SHIN CORE LINX｜Concierge AI Runtime Overview

## 1. Purpose

The **Runtime Layer** manages the execution of all flows and orchestrated modules in Concierge AI:

* Conversation sessions
* Semantic reasoning and intent inference
* Recommendation generation
* Memory management
* Routing and navigation
* LLM responses

It ensures **consistent execution, state handling, and error isolation**.

---

## 2. Core Components

### 2.1 Chat Runtime

* `chatRuntime.ts` – Core chat orchestration
* `chatSessionRuntime.ts` – Session handling
* `chatStreamRuntime.ts` – Streaming responses

### 2.2 Memory Runtime

* `memoryRuntime.ts` – Central memory orchestrator
* Algorithms:

  * `buildSemanticMemory.ts`
  * `mergeSemanticContext.ts`
  * `mergeSemanticMemory.ts`
  * `resolveConversationContext.ts`
* Graph:

  * `ConversationGraph.ts`
  * `SemanticMemoryGraph.ts`
* Core stores:

  * `conversationMemory.ts`
  * `semanticMemory.ts`
  * `sessionMemory.ts`

### 2.3 Recommendation Runtime

* `recommendationRuntime.ts` – Orchestrates recommendation steps
* `rankingRuntime.ts` – Ranking products
* `scoringRuntime.ts` – Semantic scoring
* `recommendationRuntime.ts` – Final recommendation composition

### 2.4 Routing Runtime

* `routingRuntime.ts` – Core routing orchestration
* `navigationRuntime.ts` – Handles semantic navigation and redirection

### 2.5 Semantic Runtime

* `semanticRuntime.ts` – Core semantic computation
* `queryRuntime.ts` – Query processing
* `reasoningRuntime.ts` – Semantic inference and reasoning

---

## 3. Runtime Principles

1. **Decoupled execution**: Each runtime module executes independently but can call dependent flows.
2. **Transport-agnostic**: Calls to backend, external APIs, or LLMs are routed via transport adapters.
3. **Memory integration**: Session, conversation, and semantic memory are automatically updated during runtime.
4. **Error isolation**: Failures in a single module do not break other flows; errors propagate to a controlled layer.
5. **Logging & Debugging**: All modules log inputs, outputs, and errors for observability.

---

## 4. Example Flow Execution

```
User Input →
  Conversation Runtime →
    Intent Extraction →
      Semantic Runtime →
        Recommendation Runtime →
          Routing Runtime →
            Response Output
```

* Each step can execute synchronously or asynchronously.
* Memory stores are updated incrementally.
* Recommendations are scored and routed according to semantic intent.

---

## 5. Notes

* Runtime layer forms the **core execution backbone** of Concierge AI.
* Supports modular orchestration, enabling new flows to be plugged in without impacting existing modules.
* Provides a unified interface for frontend components (Chat, PC Finder, Rankings) to consume structured responses.
