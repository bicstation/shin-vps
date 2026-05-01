// /shared/lib/api/products.ts

import { API_ENDPOINTS } from '../config/api';

export async function fetchRanking(sort: string = 'score') {
  try {
    const url = `${API_ENDPOINTS.ranking}?sort=${sort}`;

    console.log('[API REQUEST]', url);

    const res = await fetch(url, {
      cache: 'no-store',
    });

    if (!res.ok) {
      console.error('[API ERROR]', res.status);
      return [];
    }

    const data = await res.json();

    if (Array.isArray(data)) return data;
    if (data?.results) return data.results;

    return [];
  } catch (e) {
    console.error('[fetchRanking ERROR]', e);
    return [];
  }
}