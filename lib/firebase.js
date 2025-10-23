// (lib/firebase.js - Auth 초기화 '통합'에서 '분리' ✂️ 버전!)

import { initializeApp, getApps } from "firebase/app"; 
import { getFirestore } from "firebase/firestore"; 
import { getStorage } from "firebase/storage"; 
// import { getAuth } from "firebase/auth"; // 🚨 (1. Auth 연장 🔧 '삭제' 🗑️ - 이 파일에서 안 씁니다!)

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

// --- DB, Storage 연결 및 내보내기 ---
let db = {};
let storage = {};
// let auth = {}; // 🚨 (2. Auth 객체 선언 '삭제' 🗑️ - 이 파일에서 안 씁니다!)

if (app.options && app.options.projectId) { // 초기화 성공 여부 확인
    db = getFirestore(app); 
    storage = getStorage(app);
    // auth = getAuth(app); // 🚨 (3. Auth 객체 초기화 '삭제' 🗑️ - 이 파일에서 안 씁니다!)
} else {
  console.error("Firebase app not initialized correctly. Services unavailable.");
}

// (✨ NEW!) 'Auth' 객체는 '클라이언트' 🖥️ 측에서만 필요합니다!
// '서버' 👨‍🍳 에서는 db, storage만 씁니다!
export { app, db, storage };