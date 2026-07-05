// // ============================================================================
// // FILE:
// // /shared/lib/api/django/pc/ranking/fetchRankingProducts.ts
// // Copyright (c) 2026 Shin Corporation.
// // All rights reserved.
// // ============================================================================

// /**
//  * ============================================================================
//  * SHIN CORE LINX
//  * Ranking Products Legacy Compatibility Layer
//  * ============================================================================
//  *
//  * PURPOSE
//  *
//  * Legacy Frontend API
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
//  * New implementations SHOULD use:
//  *
//  * getRankingRuntime()
//  *
//  * ============================================================================
//  */

// import type {

//   ProjectedRankingProduct,

// } from './projection'

// import {

//   getRankingRuntime,

// } from './runtime'

// /* ============================================================================
// 🔥 Legacy Products API
// ============================================================================ */

// /**
//  * Legacy Compatibility
//  *
//  * Returns projected products only.
//  *
//  * New implementations should use:
//  *
//  * getRankingRuntime()
//  */

// export async function fetchRankingProducts(

//   slug: string,

// ): Promise<ProjectedRankingProduct[]> {

//   const {

//     projection,

//   } = await getRankingRuntime(

//     slug

//   )

//   return projection.products

// }

// /* ============================================================================
// 🔥 Alias
// ============================================================================ */

// export const fetchProjectedRankingProducts =

//   fetchRankingProducts

// /* ============================================================================
// 🔥 Default Export
// ============================================================================ */

// export default fetchRankingProducts