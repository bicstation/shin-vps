// /home/maya/shin-dev/shin-vps/shared/lib/semantic/semanticLabelMap.ts

/* =========================================
🔥 Semantic Label Map
========================================= */

export const semanticLabelMap:
  Record<
    string,
    string
  > = {

  // ======================================
  // Usage
  // ======================================

  'usage-gaming':
    '同じgaming用途',

  'usage-ai':
    '同じAI workload用途',

  'usage-business':
    '同じビジネス用途',

  'usage-creator':
    '同じcreator用途',

  'usage-streaming':
    '同じ配信用途',

  'usage-esports':
    '同じeSports用途',

  'usage-office':
    '同じ事務用途',

  // ======================================
  // Device
  // ======================================

  'device-laptop':
    '同じノートPC構成',

  'device-desktop':
    '同じデスクトップ構成',

  'device-server':
    '同じサーバー系統',

  'device-workstation':
    '同じワークステーション系統',

  'device-mini-pc':
    '同じMini PC系統',

  'device-mobile-pc':
    '同じモバイルPC系統',

  // ======================================
  // Maker
  // ======================================

  'maker-dell':
    '同じDellブランド',

  'maker-lenovo':
    '同じLenovoブランド',

  'maker-asus':
    '同じASUSブランド',

  'maker-hp':
    '同じHPブランド',

  'maker-msi':
    '同じMSIブランド',

  // ======================================
  // GPU
  // ======================================

  'gpu-rtx-5090':
    '同じRTX5090構成',

  'gpu-rtx-5080':
    '同じRTX5080構成',

  'gpu-rtx-4090':
    '同じRTX4090構成',

  'gpu-rtx-4080':
    '同じRTX4080構成',

  // ======================================
  // CPU
  // ======================================

  'cpu-ryzen':
    '同じRyzen系統',

  'cpu-intel':
    '同じIntel系統',

  // ======================================
  // Memory
  // ======================================

  'memory-16gb':
    '同じ16GBメモリ構成',

  'memory-32gb':
    '同じ32GBメモリ構成',

  'memory-64gb':
    '同じ64GBメモリ構成',

  // ======================================
  // Storage
  // ======================================

  'storage-ssd':
    '同じSSD構成',

  'storage-nvme':
    '同じNVMe SSD構成',

  // ======================================
  // PC Features
  // ======================================

  'pc_feature-watercooling':
    '同じ水冷構成',

  'pc_feature-rgb':
    '同じRGB対応構成',
}

/* =========================================
🔥 Resolve Semantic Label
========================================= */

export function
resolveSemanticLabel(
  slug: string
): string {

  return (

    semanticLabelMap[
      slug
    ]

    || slug
  )
}

