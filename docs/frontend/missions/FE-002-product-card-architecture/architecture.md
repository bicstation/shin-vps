# SHIN CORE LINX

# Mission FE-002

## Product Card Architecture

Status

Completed

---

# Mission Objective

Mission FE-002 was initiated to establish a Product Card Architecture
that can consistently express the responsibility of each Product Experience.

The objective of this mission was not to design a React component,
nor to create a reusable UI component.

The objective was to define the architectural thinking behind
how a Product Card should be composed according to the purpose of each page.

---

# Architecture Overview

Product Card Architecture begins with the responsibility of a page.

It does not begin with an existing UI.

The architectural design follows the workflow below.

```text
Page Responsibility

↓

Required Experience

↓

Required Information

↓

Presentation

↓

Product Card Composition
```

Each step derives naturally from the previous one.

---

# Design Principles

## Purpose Before Presentation

Presentation is not the starting point.

Presentation exists to express the responsibility of a page.

---

## Experience Before Information

Information should never be collected first.

The required user experience determines which information is necessary.

---

## Information Before Composition

Product Card composition is determined only after the required information
has been identified.

The composition should not dictate the information.

---

## Existing UI as Evidence

Current Product Card implementations are treated as Observation and Evidence.

They are valuable references but are not architectural starting points.

Architecture is derived from purpose rather than implementation.

---

# Architecture Workflow

Mission FE-002 established the following architectural workflow.

```text
Reality

↓

Observation

↓

Evidence

↓

Analysis

↓

Presentation Foundation

↓

Product Card Foundation

↓

Architecture Design
```

Architecture Design is therefore supported by Observation and Evidence,
not by assumptions.

---

# Product Experience Responsibilities

The Product Card Architecture was designed independently for each Product Experience.

| Product Experience | Primary Responsibility |
| ------------------ | ---------------------- |
| TOP | Create the user's first meaningful encounter with a product. |
| Ranking | Support comparison and confident product selection. |
| Discover | Help users understand a Semantic World through representative products. |
| Catalog | Support exploration across the product collection. |
| Product Detail | Help users understand the meaning, suitability, and value of a product. |

These responsibilities serve as the architectural entry point.

---

# Product Card Composition

Each Product Card is composed only after the following questions are answered.

1. What is the responsibility of this page?

2. What experience should the user obtain?

3. What information is required?

4. How should the information be presented?

5. How should the Product Card be composed?

Composition is therefore the result of architectural reasoning.

---

# Architectural Scope

Mission FE-002 focuses exclusively on Product Card Architecture.

The following items are outside the scope of this mission.

- React Component implementation
- Next.js implementation
- CSS design
- Runtime changes
- API changes
- Backend changes
- Frontend-wide Architecture

These topics belong to separate missions.

---

# Organizational Outcome

Mission FE-002 established a shared architectural understanding.

Product Card is not merely a reusable component.

Product Card is a Presentation that expresses the purpose of a Product Experience.

Architecture exists to derive the Product Card from that purpose.

---

# Mission Asset

This document is preserved as an organizational asset of
Frontend Experience Team.

Future Product Card-related missions should reference this architecture
before beginning Prototype or Implementation work.

---

# Commander Principles

Reality First.

Purpose Defines Experience.

Experience Shapes Presentation.

Presentation Composes the Product Card.

Architecture Before Specification.

Stay Within the Mission.

---

Mission FE-002

Product Card Architecture

Completed