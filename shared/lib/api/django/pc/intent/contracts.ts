// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/shared/lib/api/django/pc/intent/contracts.ts
// Copyright (c) 2024 Shin Corporation.
// All rights reserved.
// ============================================================================

/**
 * ============================================================================
 * SHIN CORE LINX
 * Semantic Intent Runtime Contracts
 * ============================================================================
 *
 * IMPORTANT
 *
 * Backend remains:
 *
 * semantic authority
 *
 * intent authority
 *
 * This contract represents:
 *
 * Runtime Reality
 *
 * NOT:
 *
 * UI Projection
 *
 * ============================================================================
 */

/* ============================================================================
🔥 Intent Request
============================================================================ */

export interface IntentRequest {

  /**
   * Natural Language Input
   *
   * Example:
   *
   * AI開発向けPCが欲しい
   * 動画編集したい
   * 持ち運びたい
   */

  message: string
}

/* ============================================================================
🔥 Intent Metadata
============================================================================ */

/**
 * Backend Intent Authority Metadata
 *
 * This represents the metadata attached to the resolved
 * semantic intent by the Backend.
 *
 * IMPORTANT
 *
 * These values are Backend Runtime Reality.
 *
 * Adapter SHALL NOT:
 *
 * ✗ Generate metadata
 * ✗ Reinterpret metadata
 * ✗ Hard-code metadata
 * ✗ Replace Backend values
 *
 * UI Projection belongs to a later layer.
 */

export interface IntentMetadata {

  no?: string

  slug?: string

  name?: string

  title?: string

  subtitle?: string

  description?: string

  seo_title?: string

  seo_description?: string

  icon_key?: string

  theme_key?: string

  color_key?: string

  priority?: string

  visibility?: string

  canonical_path?: string

  schema_type?: string

  og_title?: string

  og_description?: string

  og_image?: string

  is_adult?: string
}

/* ============================================================================
🔥 Intent Runtime
============================================================================ */

export interface IntentRuntime {

  /**
   * Original Message
   */

  message: string

  /**
   * Semantic Intent
   *
   * Example:
   *
   * usage-ai
   * usage-creator
   * usage-mobile
   *
   * Unknown:
   *
   * null
   */

  intent: string | null

  /**
   * Backend Intent Metadata
   */

  intent_metadata: IntentMetadata | null

  /**
   * Classification Confidence
   */

  confidence: number

  /**
   * Matched Semantic Groups
   */

  matched_groups: string[]

  /**
   * Unknown Terms
   */

  unknown_terms: string[]

  /**
   * Runtime Ready
   */

  ready: boolean
}

/* ============================================================================
🔥 Intent Result
============================================================================ */

export interface IntentResult {

  /**
   * Semantic Intent
   */

  intent: string | null

  /**
   * Backend Intent Metadata
   */

  intentMetadata?: IntentMetadata | null

  /**
   * Confidence
   */

  confidence?: number

  /**
   * Matched Groups
   */

  matchedGroups?: string[]

  /**
   * Unknown Terms
   */

  unknownTerms?: string[]

  /**
   * Runtime Ready
   */

  ready?: boolean
}