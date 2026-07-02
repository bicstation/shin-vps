import {

  BadgeDollarSign,
  BookOpen,
  Box,
  Briefcase,
  Compass,
  Cpu,
  Gamepad2,
  Laptop,
  Layers3,
  Monitor,
  Network,
  PenTool,
  Server,
  Smartphone,
  Sparkles,

} from 'lucide-react'

import type {

  LucideIcon,

} from 'lucide-react'

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
   Experience Dictionary
  ======================================================================== */

  'book-open':
    BookOpen,

  layers:
    Layers3,

  network:
    Network,

  compass:
    Compass,

  cpu:
    Cpu,

  box:
    Box,

  'pen-tool':
    PenTool,

  'badge-dollar-sign':
    BadgeDollarSign,

}