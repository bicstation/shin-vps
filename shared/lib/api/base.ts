// /home/maya/shin-vps/shared/lib/api/base.ts
// @ts-nocheck

/**
 * =====================================================================
 * 🛰️ SHIN CORE LINX｜API Base Wrapper
 * =====================================================================
 *
 * PURPOSE:
 *   Legacy compatibility layer.
 *
 *   Runtime authority is centralized in:
 *
 *     /shared/lib/config/api.ts
 *
 * DESIGN:
 *   - Prevent duplicated routing authority
 *   - Maintain backward compatibility
 *   - Re-export unified runtime helpers
 *
 * =====================================================================
 */

import API_CONFIG, {

  API_CONFIG as NAMED_API_CONFIG,

  IS_SERVER,

  IS_BROWSER,

  getApiBase,

  buildApiUrl,

  normalizeApiUrl,

} from '../config/api';

/**
 * =====================================================================
 * 📦 Runtime Re-Exports
 * =====================================================================
 */

export {

  IS_SERVER,

  IS_BROWSER,

  getApiBase,

  buildApiUrl,

  normalizeApiUrl,

  NAMED_API_CONFIG as API_CONFIG,
};

/**
 * =====================================================================
 * 📦 Default Export
 * =====================================================================
 */

export default API_CONFIG;