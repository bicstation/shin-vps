// /home/maya/shin-dev/shin-vps/shared/lib/semantic/semanticIcons.ts

/* =========================================
🔥 Semantic Icon Registry
========================================= */

export const semanticIcons:
  Record<
    string,
    string
  > = {

  // ======================================
  // Usage
  // ======================================

  'usage-gaming':
    '🎮',

  'usage-ai':
    '🤖',

  'usage-business':
    '💼',

  'usage-creator':
    '🎬',

  'usage-streaming':
    '📡',

  'usage-esports':
    '⚡',

  // ======================================
  // Device
  // ======================================

  'device-laptop':
    '💻',

  'device-desktop':
    '🖥️',

  'device-workstation':
    '🧠',

  'device-server':
    '🗄️',

  'device-mini-pc':
    '📦',

  'device-mobile-pc':
    '🎒',

  // ======================================
  // Maker
  // ======================================

  'maker-dell':
    '🏢',

  'maker-lenovo':
    '🛠️',

  'maker-asus':
    '🔥',

  'maker-hp':
    '⚙️',

  'maker-msi':
    '🐉',

  // ======================================
  // GPU
  // ======================================

  'gpu-rtx-5090':
    '🚀',

  'gpu-rtx-5080':
    '⚡',

  'gpu-rtx-4090':
    '🔥',

  'gpu-rtx-4080':
    '🎯',

  // ======================================
  // CPU
  // ======================================

  'cpu-ryzen':
    '🧩',

  'cpu-intel':
    '🔷',

  // ======================================
  // Memory
  // ======================================

  'memory-32gb':
    '🧠',

  'memory-64gb':
    '🚀',

  // ======================================
  // Storage
  // ======================================

  'storage-ssd':
    '💾',

  'storage-nvme':
    '⚡',

  // ======================================
  // PC Features
  // ======================================

  'pc_feature-watercooling':
    '❄️',

  'pc_feature-rgb':
    '🌈',

  // ======================================
  // Default
  // ======================================

  default:
    '✨',
}

/* =========================================
🔥 Resolve Semantic Icon
========================================= */

export function
resolveSemanticIcon(
  slug: string
): string {

  return (

    semanticIcons[
      slug
    ]

    || semanticIcons.default
  )
}

