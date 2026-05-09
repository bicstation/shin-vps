// shared/lib/api/semantic/ranking.ts

export async function
fetchSemanticRankingIndex() {

  // TODO:
  // backend semantic authority API
  // へ差し替え

  return [

    {
      key: 'usage',

      label:
        'Usage Semantic',

      title:
        '用途から探す',

      description:
        'gaming / creator / AI semantic',

      items: [

        {
          slug:
            'usage-gaming',

          name:
            'ゲーミングPC',

          description:
            'high FPS gaming semantic',

          icon:
            '🎮',

          count:
            124,

          semantic_role:
            'highlight',
        },

        {
          slug:
            'usage-creator',

          name:
            '動画編集・Creator',

          description:
            'creator workload semantic',

          icon:
            '🎬',

          count:
            92,

          semantic_role:
            'primary',
        },

      ],
    },

    {
      key: 'gpu',

      label:
        'GPU Semantic',

      title:
        'GPU性能から探す',

      description:
        'AI / gaming workload semantic',

      items: [

        {
          slug:
            'gpu-rtx-5090',

          name:
            'RTX 5090',

          description:
            'ultra AI semantic',

          icon:
            '⚡',

          count:
            22,

          semantic_role:
            'highlight',
        },

      ],
    },

  ]
}
