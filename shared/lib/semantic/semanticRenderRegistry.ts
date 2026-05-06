// shared/lib/semantic/semanticRenderRegistry.ts

import { SemanticAttribute } from '@/shared/types/semantic';

// 🔹 Semantic バッジや UI コンポーネントへのマッピング
export const semanticRenderRegistry: Record<string, SemanticAttribute> = {
  'usage-gaming': {
    icon: 'gamepad',
    color: 'red',
    displayName: 'ゲーミング',
  },
  'usage-creator': {
    icon: 'pen-tool',
    color: 'purple',
    displayName: 'クリエイター向け',
  },
  'usage-business': {
    icon: 'office-building',
    color: 'blue',
    displayName: 'ビジネス・法人向け',
  },
  'usage-mobile': {
    icon: 'laptop',
    color: 'green',
    displayName: 'モバイル・軽量',
  },
  'gpu-intel-arc': {
    icon: 'gpu',
    color: 'cyan',
    displayName: 'Intel Arc',
  },
  'gpu-rtx-4080': {
    icon: 'gpu',
    color: 'orange',
    displayName: 'RTX 4080',
  },
  // 追加属性はここに登録
};

// 🔹 使い方
// import { semanticRenderRegistry } from '@/shared/lib/semantic/semanticRenderRegistry';
// semanticRenderRegistry[slug]?.icon