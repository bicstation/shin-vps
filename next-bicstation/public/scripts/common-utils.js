// public/scripts/common-utils.js
console.log("BICSTATION: External script (common-utils.js) loaded!");

/**
 * 汎用的なHTMLデコード関数
 * 各ページで window.decodeHtml(text) として呼び出し可能です
 */
window.decodeHtml = function(html) {
    if (!html) return '';
    const map = { 
        '&nbsp;': ' ', '&amp;': '&', '&quot;': '"', 
        '&apos;': "'", '&lt;': '<', '&gt;': '>' 
    };
    return html.replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(parseInt(dec, 10)))
               .replace(/&[a-z]+;/gi, (match) => map[match] || map[match.toLowerCase()] || match);
};