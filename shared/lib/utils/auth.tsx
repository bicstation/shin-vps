// /home/maya/shin-vps/shared/lib/utils/auth.tsx
// @ts-nocheck

/**
 * =====================================================================
 * 🔐 SHIN CORE LINX｜Unified Auth Utility
 * =====================================================================
 *
 * PURPOSE:
 *   - Runtime-aware authentication transport
 *   - SSR / CSR compatible auth requests
 *   - Unified API authority
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

import API_CONFIG from '../config/api';

/**
 * =====================================================================
 * 🌍 Runtime-Aware API Base
 * =====================================================================
 */

export const getAuthApiBase = (): string => {

  return API_CONFIG.baseUrl;
};

/**
 * =====================================================================
 * 🔗 Auth Endpoint Builder
 * =====================================================================
 */

export const buildAuthUrl = (
  endpoint: string
): string => {

  const baseUrl =
    getAuthApiBase()
      .replace(/\/+$/, '');

  const normalizedEndpoint =
    String(endpoint || '')
      .replace(/^\/+/, '');

  return `${baseUrl}/${normalizedEndpoint}`;
};

/**
 * =====================================================================
 * 📡 Generic Auth Fetch
 * =====================================================================
 */

export async function authFetch<T = any>(

  endpoint: string,

  options: RequestInit = {}

): Promise<T> {

  const url =
    buildAuthUrl(endpoint);

  try {

    const response =
      await fetch(url, {

        ...options,

        credentials: 'include',

        headers: {

          'Content-Type': 'application/json',

          ...(options.headers || {}),
        },

        cache: 'no-store',
      });

    /**
     * ===============================================================
     * Error Handling
     * ===============================================================
     */

    if (!response.ok) {

      const errorText =
        await response.text();

      console.error(
        '❌ Auth Fetch Error:',
        {
          status: response.status,
          url,
          error: errorText,
        }
      );

      throw new Error(
        `Auth Error (${response.status})`
      );
    }

    /**
     * ===============================================================
     * JSON Parse
     * ===============================================================
     */

    return await response.json();

  } catch (error: any) {

    console.error(
      '❌ authFetch Failed:',
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
 * 🔐 Login
 * =====================================================================
 */

export async function login(

  username: string,

  password: string

) {

  return authFetch(
    'auth/login/',
    {
      method: 'POST',

      body: JSON.stringify({
        username,
        password,
      }),
    }
  );
}

/**
 * =====================================================================
 * 🚪 Logout
 * =====================================================================
 */

export async function logout() {

  return authFetch(
    'auth/logout/',
    {
      method: 'POST',
    }
  );
}

/**
 * =====================================================================
 * 👤 Current User
 * =====================================================================
 */

export async function fetchCurrentUser() {

  return authFetch(
    'auth/me/',
    {
      method: 'GET',
    }
  );
}

/**
 * =====================================================================
 * 📝 Register
 * =====================================================================
 */

export async function register(

  payload: Record<string, any>

) {

  return authFetch(
    'auth/register/',
    {
      method: 'POST',

      body: JSON.stringify(payload),
    }
  );
}

/**
 * =====================================================================
 * 📦 Unified Auth Export
 * =====================================================================
 */

const authUtils = {

  getAuthApiBase,

  buildAuthUrl,

  authFetch,

  login,

  logout,

  fetchCurrentUser,

  register,
};

export default authUtils;