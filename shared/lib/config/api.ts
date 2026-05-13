// /home/maya/shin-vps/shared/lib/config/api.ts
// @ts-nocheck

/**
 * =====================================================================
 * 🌍 SHIN CORE LINX｜Unified Runtime API Resolver
 * =====================================================================
 *
 * PURPOSE:
 *   - SSR → Docker Internal API
 *   - Browser → Public API
 *   - Runtime-aware transport layer
 *
 * DESIGN:
 *
 *   Browser:
 *     https://api.domain.com/api
 *
 *   SSR / Server Components:
 *     http://django-v3:8000/api
 *
 * =====================================================================
 */

/**
 * =====================================================================
 * 🌍 Runtime Detection
 * =====================================================================
 */

export const IS_SERVER =
  typeof window === 'undefined';

export const IS_BROWSER =
  typeof window !== 'undefined';

/**
 * =====================================================================
 * 🖥️ Internal API (SSR)
 * =====================================================================
 */

const INTERNAL_API = (

  process.env.INTERNAL_API_URL ||

  'http://django-v3:8000/api'

).replace(/\/+$/, '');

/**
 * =====================================================================
 * 🌐 Public API (Browser)
 * =====================================================================
 */

const PUBLIC_API = (

  process.env.NEXT_PUBLIC_API_URL ||

  'http://localhost:8083/api'

).replace(/\/+$/, '');

/**
 * =====================================================================
 * 🔥 Runtime-Aware API Resolver
 * =====================================================================
 */

export const getApiBase = (): string => {

  /**
   * ===============================================================
   * 🖥️ SSR / Server Components
   * ===============================================================
   */

  if (IS_SERVER) {

    return INTERNAL_API;
  }

  /**
   * ===============================================================
   * 🌐 Browser / CSR
   * ===============================================================
   */

  return PUBLIC_API;
};

/**
 * =====================================================================
 * 🔧 Normalize API URL
 * =====================================================================
 */

export const normalizeApiUrl = (
  url: string
): string => {

  return String(url || '')
    .trim()
    .replace(/\/+$/, '');
};

/**
 * =====================================================================
 * 🔗 Build API URL
 * =====================================================================
 */

export const buildApiUrl = (
  endpoint: string
): string => {

  const baseUrl =
    normalizeApiUrl(
      getApiBase()
    );

  const normalizedEndpoint =
    String(endpoint || '')
      .replace(/^\/+/, '');

  return `${baseUrl}/${normalizedEndpoint}`;
};

/**
 * =====================================================================
 * ⚙️ Unified API Config
 * =====================================================================
 */

export const API_CONFIG = {

  /**
   * Runtime-aware API Base
   */
  get baseUrl(): string {

    return getApiBase();
  },

  /**
   * Internal SSR API
   */
  internal: INTERNAL_API,

  /**
   * Browser Public API
   */
  public: PUBLIC_API,

  /**
   * Runtime Flags
   */
  isServer: IS_SERVER,

  isBrowser: IS_BROWSER,

  /**
   * URL Builder
   */
  buildUrl: buildApiUrl,

  /**
   * Default Timeout
   */
  timeout: 10000,
};

/**
 * =====================================================================
 * 🔥 API Endpoints
 * =====================================================================
 */

export const getApiEndpoints = () => {

  return {

    ranking:
      buildApiUrl(
        'general/pc-products/ranking/'
      ),

    detailByUid: (
      uid: string
    ) =>

      buildApiUrl(
        `products/by-uid/${uid}/`
      ),
  };
};

/**
 * =====================================================================
 * 📦 Default Export
 * =====================================================================
 */

export default API_CONFIG;