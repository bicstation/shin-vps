// ============================================================================
// FILE:
// shared/lib/ui/semantic/icon-map.ts
// Copyright (c) 2026 Shin Corporation.
// All rights reserved.
// ============================================================================

import {

  BadgeDollarSign,
  BookOpen,
  Box,
  Briefcase,
  Building2,
  Compass,
  Cpu,
  Database,
  FileText,
  Gauge,
  Gamepad2,
  Globe,
  HardDrive,
  Laptop,
  Layers3,
  MemoryStick,
  Monitor,
  Network,
  PenTool,
  Server,
  Smartphone,
  Sparkles,
  StretchHorizontal,
  Tablet,
  Terminal,
  Wrench,
  Zap,

} from 'lucide-react'

import type {

  LucideIcon,

} from 'lucide-react'

/* ============================================================================
🔥 Semantic Icon Map
============================================================================ */

export const ICON_MAP:

  Record<string, LucideIcon> = {

  /* ========================================================================
   Semantic Worlds
  ======================================================================== */

  gamepad:
    Gamepad2,

  sparkles:
    Sparkles,

  briefcase:
    Briefcase,

  smartphone:
    Smartphone,

  laptop:
    Laptop,

  pc:
    Monitor,

  server:
    Server,

  /* ========================================================================
   Hardware
  ======================================================================== */

  cpu:
    Cpu,

  memory:
    MemoryStick,

  'hard-drive':
    HardDrive,

  database:
    Database,

  monitor:
    Monitor,

  tablet:
    Tablet,

  /* ========================================================================
   Performance
  ======================================================================== */

  gauge:
    Gauge,

  zap:
    Zap,

  /* ========================================================================
   Business / Organization
  ======================================================================== */

  globe:
    Globe,

  building:
    Building2,

  /* ========================================================================
   Display
  ======================================================================== */

  'stretch-horizontal':
    StretchHorizontal,

  /* ========================================================================
   Content / Creation
  ======================================================================== */

  'pen-tool':
    PenTool,

  'file-text':
    FileText,

  /* ========================================================================
   Development / Technical
  ======================================================================== */

  terminal:
    Terminal,

  wrench:
    Wrench,

  /* ========================================================================
   Semantic / Navigation
  ======================================================================== */

  'book-open':
    BookOpen,

  layers:
    Layers3,

  network:
    Network,

  compass:
    Compass,

  box:
    Box,

  /* ========================================================================
   Commerce
  ======================================================================== */

  'badge-dollar-sign':
    BadgeDollarSign,

}