// // ============================================================================
// // FILE:
// // /shared/lib/api/django/pc/ranking/fetchSemanticRankingRuntime.ts
// // Copyright (c) 2026 Shin Corporation.
// // All rights reserved.
// // ============================================================================

// /**
//  * ============================================================================
//  * SHIN CORE LINX
//  * Ranking Runtime Legacy Compatibility Layer
//  * ============================================================================
//  *
//  * PURPOSE
//  *
//  * Legacy Runtime API
//  *
//  * New Pipeline
//  *
//  * Gateway
//  *      ↓
//  * Normalize
//  *      ↓
//  * Composition
//  *      ↓
//  * Projection
//  *      ↓
//  * Runtime Facade
//  *
//  * This file exists only for backward compatibility.
//  *
//  * New code SHOULD use:
//  *
//  * getRankingRuntime()
//  *
//  * ============================================================================
//  */

// import type {

//   SemanticRankingRuntime,

// } from './contracts'

// import {

//   getRankingRuntime,

// } from './runtime'

// /* ============================================================================
// 🔥 Legacy Runtime API
// ============================================================================ */

// /**
//  * Legacy Compatibility
//  *
//  * Returns only Backend Runtime.
//  *
//  * New implementations should use:
//  *
//  * getRankingRuntime()
//  */

// export async function fetchSemanticRankingRuntime(

//   slug: string,

// ): Promise<SemanticRankingRuntime> {

//   const {

//     runtime,

//   } = await getRankingRuntime(

//     slug

//   )

//   return runtime

// }

// /* ============================================================================
// 🔥 Alias
// ============================================================================ */

// export const fetchRankingRuntime =

//   fetchSemanticRankingRuntime

// /* ============================================================================
// 🔥 Default Export
// ============================================================================ */

// export default fetchSemanticRankingRuntime