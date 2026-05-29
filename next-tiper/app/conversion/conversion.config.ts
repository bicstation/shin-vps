export interface ConversionNodeConfig {
id: string;
terminal: string;
mission: string;
description: string;
href: string;
cta: string;
}

export const conversionNodes: ConversionNodeConfig[] = [
{
id: "live-chat",
terminal: "COMMUNICATION TERMINAL",
mission: "会話相手を探す",
description:
"人気サービスや利用方法を確認できます。",
href: "/guide/live-chat",
cta: "ENTER",
},

{
id: "chat-lady",
terminal: "INCOME TERMINAL",
mission: "副業を開始する",
description:
"応募前に知っておきたい情報を確認できます。",
href: "/guide/chat-lady",
cta: "ENTER",
},

{
id: "matching",
terminal: "MATCHING TERMINAL",
mission: "理想の相手を探す",
description:
"安全な始め方や人気サービスを比較できます。",
href: "/guide/matching",
cta: "ENTER",
},
];
