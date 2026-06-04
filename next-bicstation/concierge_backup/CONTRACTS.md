<!-- /home/maya/shin-vps/next-bicstation/app/concierge/CONTRACTS.md -->

# SHIN CORE LINX｜Concierge AI Contracts

## 1. Overview

Contracts define the **payloads, schemas, and type structures** used by the Concierge AI system.
They ensure **consistency** between frontend, backend, and transport layers.

---

## 2. Recommendation Contract

**Payload Example:**

```ts
export type RecommendationPayload = {
  id: string
  name: string
  description?: string
  image_url?: string
  score?: number
  usage?: string
  gpu?: string
  cpu?: string
  maker?: string
  memory?: string
  storage?: string
  resolution?: string
  panel?: string
  workload?: string
  ai?: string
  budget?: number
}
```

**Purpose:**
Defines the structure for **product recommendations**, including semantic attributes and scoring.

---

## 3. Semantic Contract

**Semantic Attribute Example:**

```ts
export type SemanticAttribute = {
  id?: number
  name: string
  slug: string
  attr_type?: string
  attr_type_display?: string
  description?: string
  icon?: string
  color?: string
  count?: number
  order?: number
  semantic_role?: 'highlight' | 'primary' | 'secondary' | 'supportive'
  semantic_weight?: number
}
```

**Semantic Finder Query:**

```ts
export type SemanticFinderQuery = {
  usage?: string
  gpu?: string
  cpu?: string
  maker?: string
  memory?: string
  storage?: string
  resolution?: string
  panel?: string
  workload?: string
  ai?: string
  budget?: number
}
```

**Purpose:**
Ensures all **semantic API calls** follow the same structure for extraction, reasoning, and routing.

---

## 4. Chat Contracts

**Conversation Message:**

```ts
export type ConversationMessage = {
  id?: string
  role: 'user' | 'system' | 'assistant'
  content: string
  created_at?: string
  updated_at?: string
  metadata?: Record<string, any>
}
```

**Chat Session:**

```ts
export type ChatSession = {
  sessionId: string
  userId: string
  messages: ConversationMessage[]
  createdAt: string
  updatedAt?: string
}
```

**Chat State:**

```ts
export type ChatState = {
  messages: ConversationMessage[]
  activeSessionId?: string
  loading: boolean
}
```

---

## 5. Transport Contracts

**Generic Transport Response:**

```ts
export type TransportResponse<T = any> = {
  success: boolean
  data?: T
  error?: string
  status?: number
}
```

**Purpose:**
Standardizes API response handling across:

* Ranking
* Finder
* Product
* Semantic queries

---

## 6. Runtime & Orchestration Contracts

**Runtime Module:**

```ts
export type RuntimeModule = {
  id: string
  name: string
  execute: (...args: any[]) => any
}
```

**Orchestration Flow Step:**

```ts
export type FlowStep<T = any> = {
  id: string
  name: string
  execute: (input: T) => Promise<any>
  next?: FlowStep<T>
}
```

**Orchestration Flow:**

```ts
export type OrchestrationFlow<T = any> = {
  steps: FlowStep<T>[]
  run: (input: T) => Promise<any>
}
```

**Purpose:**
Defines **modular and type-safe flow execution** for the Concierge AI orchestration layer.

---

## 7. Summary

* **Recommendation Contract** → products, scoring, semantic attribution
* **Semantic Contract** → attributes, intents, and query structures
* **Chat Contract** → messages, sessions, state
* **Transport Contract** → API responses and error handling
* **Runtime / Orchestration Contract** → flows and modular execution

Contracts provide **frontend-backend alignment**, **flow safety**, and **extensibility** for future AI modules like PC Finder or LLM-based chat.
