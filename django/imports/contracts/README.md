# SHIN CORE LINX Import Contract

## Overview

Import Contract is the canonical interface between Reality Importers and
the SHIN CORE LINX Runtime.

Every importer must transform Reality into this Contract before entering
the common Import Runtime.

```
Reality
    │
    ▼
Acquire
    │
    ▼
Observe
    │
    ▼
Formatter
    │
    ▼
Mapper
    │
    ▼
Import Contract
    │
    ▼
Validator
    │
    ▼
PCProduct Model Mapper
    │
    ▼
Repository
```

The Import Runtime never depends on individual websites.

It only depends on the Import Contract.

---

# Principle

Reality First

Observation First

Contract First

Import Runtime must never understand Shopify,
EC-CUBE, WooCommerce, Amazon,
ValueCommerce or Yahoo.

Website-specific knowledge belongs only inside each Importer.

---

# Contract Sections

Every Import Contract consists of four sections.

```
identity
commerce
media
observation
```

## identity

Product identity.

Examples

- unique_id
- maker
- brand
- series
- collaboration
- product_name
- product_url
- affiliate_url

---

## commerce

Commercial information.

Examples

- price
- currency

---

## media

Normalized media.

Examples

- image_url
- images

---

## observation

Raw observations collected from Reality.

Examples

- title
- url
- description
- main_image
- tables
- scripts

Observation should preserve Reality.

Normalization belongs to Mapper.

---

# Authority

```
schema.py
```

defines the Import Contract.

```
validator.py
```

validates every Contract.

```
exceptions.py
```

defines Contract errors.

No importer should define its own Contract.

All importers must follow this schema.

---

# Responsibilities

Importer
    Reality
        ↓
    Import Contract

Validator
    Contract Validation

Model Mapper
    Contract → PCProduct Payload

Repository
    Payload → Database

Semantic Runtime
    Semantic Generation

Each layer has exactly one responsibility.