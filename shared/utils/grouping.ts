export const groupByGojuon = (items: any[]) => {
  const gojuon = {
    'あ行': /^[あ-おア-オ]/,
    'か行': /^[か-こカ-コ]/,
    'さ行': /^[さ-そサ-ソ]/,
    'た行': /^[た-とタ-ト]/,
    'な行': /^[な-のナ-ノ]/,
    'は行': /^[は-ほハ-ホ]/,
    'ま行': /^[ま-もマ-モ]/,
    'や行': /^[や-よヤ-ヨ]/,
    'ら行': /^[ら-ろラ-ロ]/,
    'わ行': /^[わ-をワ-ヲ]/,
  };

  const grouped = items.reduce((acc, item) => {
    const firstChar = item.ruby?.[0] || item.name?.[0] || '';
    // どの行に属するか判定
    const row = Object.entries(gojuon).find(([_, regex]) => regex.test(firstChar))?.[0] || 'その他';
    
    if (!acc[row]) acc[row] = [];
    acc[row].push(item);
    return acc;
  }, {} as Record<string, any[]>);

  // 行の並び順を固定して返す
  return Object.keys(gojuon).reduce((acc, key) => {
    if (grouped[key]) acc[key] = grouped[key];
    return acc;
  }, {} as Record<string, any[]>);
};