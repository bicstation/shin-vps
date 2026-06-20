# SHIN Concierge Runtime V1

## Overview

SHIN Concierge Runtime V1 is a lightweight conversation runtime for SHIN CORE LINX.

The purpose of Concierge is not to provide semantic reasoning, recommendation generation, or routing decisions.

Its responsibility is to maintain conversations, preserve session context, invoke backend runtimes, and return results to the frontend.

---

## Purpose

```text
User Conversation
↓
Session Memory
↓
Backend Runtime Invocation
↓
Response Rendering
```

Concierge acts as a bridge between user conversations and backend runtime systems.

---

## Runtime Scope

### Responsibilities

* Conversation Management
* Session Memory
* Runtime Orchestration
* Backend Runtime Transport

### Not Responsibilities

* Semantic Authority
* Recommendation Authority
* Routing Authority
* Agent Runtime
* Graph Runtime
* Workflow Runtime
* Reasoning Engine
* Multi-Agent System

---

## Authority Model

### Backend

```text
Semantic Authority
Recommendation Authority
Routing Authority
Runtime Authority
```

### Concierge Runtime

```text
Conversation Authority
Session Authority
```

### Frontend

```text
Rendering Authority
Discovery Experience
User Interaction
```

---

## Architecture

```text
User
↓
Conversation Runtime
↓
Session Memory
↓
Concierge Orchestrator
↓
Backend Runtime
↓
Adapter Layer
↓
Frontend
```

---

## Directory Structure

```text
concierge

├── contracts
├── conversation
├── memory
├── orchestration
├── transport
└── index.ts
```

---

## Contracts

### ConciergeInput

Runtime input contract.

```ts
{
  sessionId: string;
  message: string;
}
```

### ConciergeOutput

Runtime output contract.

```ts
{
  success: boolean;
  message: string;
}
```

### ConciergeSession

Conversation session contract.

```ts
{
  sessionId: string;
  messages: string[];
}
```

---

## Execution Flow

```text
Input
↓
Load Session
↓
Update Conversation
↓
Save Session
↓
Backend Runtime Call
↓
Response
```

---

## Design Principles

### Principle 1

Backend owns meaning.

```text
Backend = Semantic Authority
```

### Principle 2

Backend owns recommendations.

```text
Backend = Recommendation Authority
```

### Principle 3

Backend owns routing.

```text
Backend = Routing Authority
```

### Principle 4

Frontend renders.

```text
Frontend = Rendering Authority
```

### Principle 5

Concierge orchestrates.

```text
Concierge = Conversation Runtime
```

---

## Explicitly Forbidden

The following features must not be implemented inside Concierge Runtime V1.

```text
Semantic Engine

Recommendation Engine

Routing Engine

Agent Framework

Reasoning Engine

Graph Runtime

Workflow Engine

Autonomous Agent

Multi-Agent System
```

---

## Version

```text
SHIN Concierge Runtime V1
Status: Active
Architecture: Minimal Runtime
Authority Model: Backend First
```
