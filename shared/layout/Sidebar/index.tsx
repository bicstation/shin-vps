'use client';

import React from 'react';
import AdultSidebar from './AdultSidebar';

/**
 * Sidebar Entry Point
 * page.tsx から渡された props を AdultSidebar へ透過的にリレーします。
 */
export default function Sidebar(props: any) {
  return <AdultSidebar {...props} />;
}