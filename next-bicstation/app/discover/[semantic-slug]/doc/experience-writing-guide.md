# ============================================================================
# SHIN CORE LINX
# Discover Experience V2
# Experience Dictionary Template
# ============================================================================

## Purpose

This template defines the canonical structure of a Discover Experience
Translation Dictionary.

The Experience Dictionary does not define Semantic Reality.

Its responsibility is to translate Semantic Reality into customer-facing
language.

The input source may be:

- JSON
- TSV
- API Runtime
- Other Translation Data

The output is a TypeScript Experience Dictionary.

---

# Input

```json
{
  "group_slug": "usage-gaming",

  "theme": {
    "icon": "gamepad",
    "accentColor": "#45B3FF",
    "backgroundImage": "/images/discover/usage-gaming.png"
  },

  "hero": {
    "label": "...",
    "title": "...",
    "catchCopy": "...",
    "description": "...",
    "backgroundPosition": "center top"
  },

  "about": {
    "title": "...",
    "body": "...",
    "backgroundPosition": "center 30%"
  },

  "elements": {
    "title": "...",
    "description": "...",
    "keywords": [],
    "backgroundPosition": "center"
  },

  "products": {
    "title": "...",
    "description": "...",
    "backgroundPosition": "center 70%"
  },

  "related": {
    "title": "...",
    "description": "...",
    "backgroundPosition": "center bottom"
  },

  "continue": {
    "title": "...",
    "description": "...",
    "buttonLabel": "...",
    "backgroundPosition": "bottom"
  }
}
```

---

# Output

```ts
const dictionary: ExperienceDictionary = {

  hero: {

    label:

      hero.label,

    title:

      hero.title,

    catchCopy:

      hero.catchCopy,

    description:

      hero.description,

    icon:

      theme.icon,

    accentColor:

      theme.accentColor,

    backgroundImage:

      theme.backgroundImage,

    backgroundPosition:

      hero.backgroundPosition,

  },

  about: {

    title:

      about.title,

    body:

      about.body,

    icon:

      "book-open",

    accentColor:

      theme.accentColor,

    backgroundImage:

      theme.backgroundImage,

    backgroundPosition:

      about.backgroundPosition,

  },

  elements: {

    title:

      elements.title,

    description:

      elements.description,

    keywords:

      elements.keywords,

    icon:

      "layers",

    accentColor:

      theme.accentColor,

    backgroundImage:

      theme.backgroundImage,

    backgroundPosition:

      elements.backgroundPosition,

  },

  products: {

    title:

      products.title,

    description:

      products.description,

    icon:

      "cpu",

    accentColor:

      theme.accentColor,

    backgroundImage:

      theme.backgroundImage,

    backgroundPosition:

      products.backgroundPosition,

  },

  related: {

    title:

      related.title,

    description:

      related.description,

    icon:

      "network",

    accentColor:

      theme.accentColor,

    backgroundImage:

      theme.backgroundImage,

    backgroundPosition:

      related.backgroundPosition,

  },

  continue: {

    title:

      continue.title,

    description:

      continue.description,

    buttonLabel:

      continue.buttonLabel,

    icon:

      "compass",

    accentColor:

      theme.accentColor,

    backgroundImage:

      theme.backgroundImage,

    backgroundPosition:

      continue.backgroundPosition,

  },

}
```

---

# Responsibility

Semantic Reality

↓

Experience Translation Data

↓

Experience Dictionary Template

↓

Experience Dictionary

↓

React Components

---

# Notes

- Semantic Reality is defined by Backend.
- Experience Translation Data defines customer language.
- This template assembles a Discover Experience Dictionary.
- React Components must never contain translation logic.
- Experience Dictionaries are resolved by `group_slug`.
