// /app/concierge/system/config/semantic.config.ts

/* =========================================
🔥 Semantic Configuration
========================================= */

export const SEMANTIC_CONFIG = {
  defaultSchemaVersion: 1,
  maxAttributesPerGroup: 10,
  supportedTypes: [
    'device',
    'product_type',
    'usage',
    'maker',
    'gpu',
    'cpu',
    'memory',
    'storage',
    'pc_feature',
  ],
  defaultRoles: ['primary', 'secondary', 'highlight', 'supportive'],
  defaultWeights: {
    primary: 0.8,
    secondary: 0.6,
    highlight: 1.0,
    supportive: 0.4,
  },
  similarityThreshold: 0.6,
  confidenceThreshold: 0.75,
}