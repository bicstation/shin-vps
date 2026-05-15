import { NextResponse }
  from 'next/server'

const BASE_URL =
  'https://bicstation.com'

export async function GET() {

  const items = [

    {
      title:
        'AI向けおすすめPCランキング',

      url:
        `${BASE_URL}/ranking/ai`,

      description:
        'AI画像生成向けおすすめPC比較',
    },

    {
      title:
        'ゲーミングPCランキング',

      url:
        `${BASE_URL}/ranking/gaming`,

      description:
        '高FPS gaming向けおすすめPC',
    },
  ]

  const rss = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
<channel>

<title>BIC STATION</title>

<link>${BASE_URL}</link>

<description>
用途別おすすめPC比較
</description>

${items.map(
(item) => `
<item>
<title>${item.title}</title>
<link>${item.url}</link>
<description>${item.description}</description>
</item>
`
).join('')}

</channel>
</rss>`

  return new NextResponse(
    rss,
    {
      headers: {
        'Content-Type':
          'application/xml',
      },
    }
  )
}