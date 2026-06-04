// /shared/lib/api/django/client.ts
// @ts-nocheck

/**
 * =====================================================================
 * 🛰️ SHIN CORE LINX｜Unified Django API Client
 * =====================================================================
 */

import API_CONFIG from '../../config/api';

import {
  IS_SERVER,
} from '../../config/api';

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

  const cleanEndpoint =
    endpoint
      .replace(/^\/+/, '')
      .replace(/\/+$/, '');

  return `${apiRoot}/${cleanEndpoint}`;
};

/**
 * =====================================================================
 * 🛡️ Legacy Compatibility Alias
 * =====================================================================
 */

export const resolveApiUrl =
  buildApiUrl;

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

  try {

    return await response.json();

  } catch (error) {

    console.error(
      '❌ JSON Parse Failed:',
      { url }
    );

    throw error;
  }
}

/**
 * =====================================================================
 * 🛡️ Legacy Compatibility Alias
 * =====================================================================
 */

export const handleResponseWithDebug =
  handleDjangoResponse;

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

  const url =
    buildApiUrl(
      endpoint,
      manualHost
    );

  const headers = {

    ...getDjangoHeaders(
      manualHost
    ),

    ...(options.headers || {}),
  };

  try {

    const response =
      await fetch(url, {

        ...options,

        headers,

        cache: 'no-store',
      });

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

  resolveApiUrl,

  buildQueryString,

  getCurrentSiteMetadata,

  getDjangoHeaders,

  handleDjangoResponse,

  handleResponseWithDebug,

  djangoFetch,
};

export default djangoClient;