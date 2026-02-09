// utils/grouping.ts
export const groupByGojuon = (items: any[]) => {
  const gojuon = {
    'あ行': /[あ-おア-オ]/,
    'か行': /[か-こカ-コ]/,
    'さ行': /[さ-そサ-ソ]/,
    'た行': /[た-とタ-ト]/,
    'な行': /[な-のナ-ノ]/,
    'は行': /[は-ほハ-ホ]/,
    'ま行': /[ま-もマ-モ]/,
    'や行': /[や-よヤ-ヨ]/,
    'ら行': /[ら-ろラ-ロ]/,
    'わ行': /[わ-をワ-ヲ]/,
  };

  return items.reduce((acc, item) => {
    const firstChar = item.ruby?.[0] || item.name?.[0];
    const row = Object.entries(gojuon).find(([_, regex]) => regex.test(firstChar))?.[0] || 'その他';
    
    if (!acc[row]) acc[row] = [];
    acc[row].push(item);
    return acc;
  }, {} as Record<string, any[]>);
};