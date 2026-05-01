// /shared/lib/config/api.ts
export const API_BASE = process.env.NEXT_PUBLIC_API_URL 
  || 'https://api.bicstation.com';

export const API_ENDPOINTS = {
  ranking: `${API_BASE}/api/products/ranking/`,
};