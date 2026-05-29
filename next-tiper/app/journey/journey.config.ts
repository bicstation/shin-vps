export type JourneyItem = {
id: string
title: string
subtitle: string
description: string[]
href: string
cta: string
}

export const JOURNEY_ITEMS: JourneyItem[] = [

{
id: 'video',


title: '動画を見る',

subtitle: 'WATCH VIDEOS',

description: [
  '人気動画を探す',
  'ランキングを見る',
  '作品を検索する',
],

href: '/videos',

cta: '動画一覧へ',


},

{
id: 'live-chat',


title: '会話を楽しむ',

subtitle: 'LIVE CHAT',

description: [
  'ライブチャット',
  '初心者向けガイド',
  'おすすめサイト',
],

href: '/guide/live-chat',

cta: 'ガイドを見る',


},

{
id: 'chat-lady',


title: '副業を始める',

subtitle: 'SIDE BUSINESS',

description: [
  'チャットレディ',
  '人気サイト比較',
  '初心者向けガイド',
],

href: '/guide/chat-lady',

cta: '比較を見る',


},

{
id: 'matching',


title: '出会いを探す',

subtitle: 'MATCHING',

description: [
  '恋活',
  'マッチング',
  '比較ガイド',
],

href: '/guide/matching',

cta: 'ガイドを見る',


},

]
