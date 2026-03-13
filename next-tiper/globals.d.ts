// ファイル名: ./next-tiper/globals.d.ts (または types/css.d.ts)

// CSSファイルをimportする際にTypeScriptがエラーを出さないように型を宣言
declare module '*.css' {
  const content: string;
  export default content;
}