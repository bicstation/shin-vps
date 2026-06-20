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
   */

  intent: string

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

  intent: string

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