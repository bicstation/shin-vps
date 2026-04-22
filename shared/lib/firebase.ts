import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Firebaseの設定オブジェクト
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyB2dizTRDncD3hOkgsLLKiDX6tQpzZtNY0",
  authDomain: "bicstationaicontents.firebaseapp.com",
  projectId: "bicstationaicontents",
  storageBucket: "bicstationaicontents.firebasestorage.app",
  messagingSenderId: "268855528598",
  appId: "1:268855528598:web:c61f5b128b4f675c09c6b7",
  measurementId: "G-7LBQ5W03BB"
};

// サーバーサイドレンダリング(SSR)を考慮した初期化
// すでに初期化されている場合は既存のアプリを使い、そうでなければ新規作成します
const app = getApps().length > 0 ? getApp() : initializeApp(FIREBASE_CONFIG);

// Firestoreインスタンスのエクスポート
export const db = getFirestore(app);

// 必要に応じてAuthなどもここに追加できます
// import { getAuth } from "firebase/auth";
// export const auth = getAuth(app);