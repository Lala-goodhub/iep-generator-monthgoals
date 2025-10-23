// (lib/firebase.js - 최종 분리 버전!)

import { initializeApp, getApps } from "firebase/app"; 
import { getFirestore } from "firebase/firestore"; 
import { getStorage } from "firebase/storage"; 
// 🚨 (NEW!) Auth 관련 import 모두 삭제! (여기서는 DB, Storage만 export!)

// --- Vercel 비밀 금고에서 키 가져오기 ---
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "", 
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

console.log("Firebase Config Check:", firebaseConfig); 

let app;
if (!getApps().length) {
  try { 
    app = initializeApp(firebaseConfig);
    console.log("Firebase initialized!"); 
  } catch (initError) {
      console.error("Firebase Initialization Error:", initError);
      app = {}; 
  }
} else {
  app = getApps()[0]; 
}

// --- DB, Storage 연결 및 내보내기 (Auth 객체 싹! 제거!) ---
let db = {};
let storage = {};

if (app.options && app.options.projectId) {
    db = getFirestore(app); 
    storage = getStorage(app);
} else {
  console.error("Firebase app not initialized correctly. Services unavailable.");
}

// (✨ NEW!) Auth 객체 싹 제거! 서버에서 필요한 DB와 Storage만 내보냅니다.
export { app, db, storage };