// (lib/firebase.js - 클라이언트 전용 Auth 객체 '재생성' 🛠️ 버전!)

import { initializeApp, getApps } from "firebase/app"; 
import { getFirestore } from "firebase/firestore"; 
import { getStorage } from "firebase/storage"; 
import { getAuth } from "firebase/auth"; // (NEW!) Auth 연장 🔧 다시 추가!

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
// (✨ NEW!) Auth 객체는 '여기서' 초기화합니다!
let auth = {}; 

if (app.options && app.options.projectId) { // 초기화 성공 여부 확인
    db = getFirestore(app); 
    storage = getStorage(app);
    auth = getAuth(app); // (NEW!) Auth 객체 초기화!
} else {
  console.error("Firebase app not initialized correctly. Services unavailable.");
}

// (✨ NEW!) Auth 객체 '다시' 🔑 내보내기!
export { app, db, storage, auth };