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

  /**
   * =================================================================
   * 🌐 Core API Runtime
   * =================================================================
   */
  getApiBase,

  buildApiUrl,

  normalizeApiUrl,

} from '../config/api';

/**
 * =====================================================================
 * 🛡️ Legacy Compatibility Aliases
 * =====================================================================
 * Old API layer compatibility for existing imports
 * =====================================================================
 */

/**
 * 🚨 Legacy Alias:
 * getDjangoBaseUrl()
 * ↓
 * getApiBase()
 */
export const getDjangoBaseUrl = getApiBase;

/**
 * =====================================================================
 * 📦 Runtime Re-Exports
 * =====================================================================
 */

export {

  IS_SERVER,

  IS_BROWSER,

  /**
   * =================================================================
   * 🌐 Core Runtime
   * =================================================================
   */
  getApiBase,

  buildApiUrl,

  normalizeApiUrl,

  /**
   * =================================================================
   * 📦 Named Config Export
   * =================================================================
   */
  NAMED_API_CONFIG as API_CONFIG,
};

/**
 * =====================================================================
 * 📦 Default Export
 * =====================================================================
 */

export default API_CONFIG;