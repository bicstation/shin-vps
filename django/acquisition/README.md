# SHIN CORE LINX Reality Acquisition Platform

## Overview

The Reality Acquisition Platform is responsible for collecting,
observing, normalizing, and integrating product reality from
multiple external sources.

This platform is the entry point of product reality into
SHIN CORE LINX.

---

## Philosophy

Reality First

The platform never creates reality.

It only acquires, observes, normalizes, and transfers
authoritative information from external sources.

Every source is treated as a Reality Source.

---

## Supported Reality Sources

The platform is designed to support multiple acquisition methods.

- HTML Scraping
- REST API
- FTP
- CSV
- TSV
- XML
- JSON
- Manual Import

Future sources can be added without changing the platform
architecture.

---

## Runtime Pipeline

Reality Source

↓

Acquire

↓

Formatter

↓

Observation

↓

Mapper

↓

Integration

↓

SHIN CORE LINX

Each runtime has a single responsibility.

---

## Directory Structure

```
acquisition/

    common/
        Shared runtime and services.

    sources/
        Reality source implementations.

    integration/
        Import integration runtime.

    docs/
        Architecture and specifications.

    tests/
        Platform tests.

    examples/
        Sample implementations.
```

---

## Source Categories

```
sources/

    scraping/
        HTML based acquisition

    api/
        REST / GraphQL APIs

    ftp/
        FTP based distribution

    file/
        CSV / TSV / XML / JSON

    manual/
        Manual acquisition
```

---

## Design Principles

- Reality First
- Observation Before Interpretation
- Source Independent
- Runtime Oriented
- Contract Driven
- Single Responsibility

---

## Responsibilities

### Acquire

Collect raw reality from external sources.

### Formatter

Normalize raw source data into a common payload.

### Observation

Observe detailed product reality.

Examples

- Specifications
- Price
- Images
- Product Number
- Release Date

### Mapper

Convert normalized payload into the Import Contract.

### Integration

Import validated contracts into SHIN CORE LINX.

---

## Platform Goal

This platform provides a unified acquisition architecture
for every product source supported by SHIN CORE LINX.

Whether the data comes from HTML,
an API,
FTP,
or structured files,
the acquisition pipeline remains identical.

Reality is acquired once.

Reality is normalized once.

Reality becomes available everywhere.
