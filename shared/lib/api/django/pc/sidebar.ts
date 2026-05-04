// /home/maya/shin-dev/shin-vps/shared/lib/api/django/pc/sidebar.ts

import { getApiBase } from '@/shared/lib/config/api';

export async function fetchSidebar() {
  try {
    const base = getApiBase();
    const res = await fetch(`${base}/general/pc-sidebar-stats/`, {
      cache: 'no-store',
    });

    if (!res.ok) return null;

    return await res.json();
  } catch {
    return null;
  }
}