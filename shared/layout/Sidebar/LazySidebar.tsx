'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const SidebarWrapper = dynamic(
  () => import('./SidebarWrapper'),
  { ssr: false }
);

export default function LazySidebar() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return <SidebarWrapper />;
}