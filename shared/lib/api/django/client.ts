// /shared/lib/api/django/client.ts
// @ts-nocheck

/**
 * =====================================================================
 * 🛰️ SHIN CORE LINX｜Unified Django API Client
 * =====================================================================
 *
 * PURPOSE:
 *   - SSR / Server Component internal routing
 *   - Browser public routing
 *   - Runtime-aware API transport layer
 *   - Unified endpoint construction
 *
 * DESIGN:
 *   Browser:
 *     https://api.domain.com/api
 *
 *   SSR:
 *     http://django-v3:8000/api
 *
 * =====================================================================
 */

import API_CONFIG from '../../config/api';
import { IS_SERVER } from '../../config/api';

import {
  getSiteMetadata,
} from '../../utils/siteConfig';

/**
 * =====================================================================
 * 🌍 Build API Root
 * =====================================================================
 */

export const buildApiRoot = (
  manualHost?: string
): string => {

  /**
   * ===============================================================
   * Runtime-aware transport authority
   * ===============================================================
   */

  return API_CONFIG.baseUrl
    .replace(/\/+$/, '');
};

/**
 * =====================================================================
 * 🔗 Build Endpoint URL
 * =====================================================================
 */

export const buildApiUrl = (
  endpoint: string,
  manualHost?: string
): string => {

  const apiRoot =
    buildApiRoot(manualHost);

  /**
   * Normalize endpoint
   */

  const cleanEndpoint =
    endpoint
      .replace(/^\/+/, '')
      .replace(/\/+$/, '');

  /**
   * Build
   */

  return `${apiRoot}/${cleanEndpoint}`;
};

/**
 * =====================================================================
 * 🧠 Build Query String
 * =====================================================================
 */

export const buildQueryString = (
  params: Record<string, any>
): string => {

  const searchParams =
    new URLSearchParams();

  Object.entries(params).forEach(
    ([key, value]) => {

      if (

        value !== undefined &&

        value !== null &&

        value !== ''

      ) {

        searchParams.append(
          key,
          String(value)
        );
      }
    }
  );

  return searchParams.toString();
};

/**
 * =====================================================================
 * 🌍 Current Site Metadata
 * =====================================================================
 */

export const getCurrentSiteMetadata = (
  manualHost?: string
) => {

  return getSiteMetadata(manualHost);
};

/**
 * =====================================================================
 * 📡 Django Headers
 * =====================================================================
 */

export const getDjangoHeaders = (
  manualHost?: string
): Record<string, string> => {

  const meta =
    getCurrentSiteMetadata(manualHost);

  const siteTag =
    meta.site_tag
      .replace(/\/+$/, '')
      .trim();

  const headers: Record<string, string> = {

    Accept: 'application/json',

    'Content-Type': 'application/json',
  };

  /**
   * ===============================================================
   * SSR Identity Headers
   * ===============================================================
   */

  if (IS_SERVER) {

    headers['x-site-tag'] =
      siteTag;

    headers['x-project-id'] =
      siteTag;

    headers['x-site-prefix'] =
      meta.site_prefix;

    headers['x-django-host'] =
      meta.django_host;

    headers['Host'] =
      meta.django_host;

    console.log(

      `📡 [API-IDENTITY] ` +

      `Tag: ${siteTag} | ` +

      `Prefix: ${meta.site_prefix} | ` +

      `Host: ${meta.django_host}`

    );
  }

  return headers;
};

/**
 * =====================================================================
 * 🛡️ Safe Response Handler
 * =====================================================================
 */

export async function handleDjangoResponse<T = any>(

  response: Response,

  url: string

): Promise<T> {

  /**
   * ===============================================================
   * Debug Logging
   * ===============================================================
   */

  if (IS_SERVER) {

    const icon =
      response.ok
        ? '✅'
        : '❌';

    console.log(

      `${icon} [DJANGO-API]`,

      response.status,

      url

    );
  }

  /**
   * ===============================================================
   * Error Handling
   * ===============================================================
   */

  if (!response.ok) {

    const errorText =
      await response.text();

    console.error(

      '❌ Django API Error:',

      {
        status: response.status,
        url,
        error: errorText,
      }
    );

    throw new Error(
      `Django API Error (${response.status})`
    );
  }

  /**
   * ===============================================================
   * Safe JSON Parse
   * ===============================================================
   */

  try {

    return await response.json();

  } catch (error) {

    console.error(

      '❌ JSON Parse Failed:',

      {
        url,
      }
    );

    throw error;
  }
}

/**
 * =====================================================================
 * 🚀 Unified Django Fetch
 * =====================================================================
 */

export async function djangoFetch<T = any>(

  endpoint: string,

  options: RequestInit = {},

  manualHost?: string

): Promise<T> {

  /**
   * ===============================================================
   * URL
   * ===============================================================
   */

  const url =
    buildApiUrl(
      endpoint,
      manualHost
    );

  /**
   * ===============================================================
   * Headers
   * ===============================================================
   */

  const headers = {

    ...getDjangoHeaders(
      manualHost
    ),

    ...(options.headers || {}),
  };

  try {

    /**
     * ===========================================================
     * Fetch
     * ===========================================================
     */

    const response =
      await fetch(url, {

        ...options,

        headers,

        cache: 'no-store',
      });

    /**
     * ===========================================================
     * Handle Response
     * ===========================================================
     */

    return await handleDjangoResponse<T>(
      response,
      url
    );

  } catch (error: any) {

    console.error(

      '❌ djangoFetch Failed:',

      {
        endpoint,
        url,
        message: error?.message,
      }
    );

    throw error;
  }
}

/**
 * =====================================================================
 * 📦 Unified Export
 * =====================================================================
 */

const djangoClient = {

  buildApiRoot,

  buildApiUrl,

  buildQueryString,

  getCurrentSiteMetadata,

  getDjangoHeaders,

  handleDjangoResponse,

  djangoFetch,
};

export default djangoClient;