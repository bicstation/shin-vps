// /home/maya/shin-vps/shared/lib/api/config.ts
// @ts-nocheck

/**
 * =====================================================================
 * 🛰️ SHIN CORE LINX｜Legacy API Config Wrapper
 * =====================================================================
 *
 * PURPOSE:
 *   Compatibility layer only.
 *
 *   Runtime authority is centralized in:
 *
 *     /shared/lib/config/api.ts
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