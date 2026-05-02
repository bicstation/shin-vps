// /shared/lib/utils/media.ts

import { getApiBase } from '@/shared/lib/config/api';

export function getMediaUrl(path?: string) {
  if (!path) return '/no-image.png';

  // フルURLならそのまま
  if (path.startsWith('http')) return path;

  const base = getApiBase();

  // /api を安全に削除（末尾のみ）
  const origin = base.replace(/\/api\/?$/, '');

  return `${origin}${path}`;
}