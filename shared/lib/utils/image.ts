// /shared/lib/utils/image.ts

import { getApiBase } from '@/shared/lib/config/api';

export const getImageUrl = (path?: string) => {
  if (!path) return '/no-image.png';

  // すでにフルURLならそのまま
  if (path.startsWith('http')) return path;

  const base = getApiBase();

  // /api を除去（安全に）
  const origin = base.replace(/\/api\/?$/, '');

  return `${origin}${path}`;
};