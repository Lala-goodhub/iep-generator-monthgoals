// (lib/firebase.js - 최종 Auth 초기화 통합 버전!)

import { initializeApp, getApps } from "firebase/app"; 
import { getFirestore } from "firebase/firestore"; 
import { getStorage } from "firebase/storage"; 
import { getAuth } from "firebase/auth"; // (NEW!) Auth 연장 🔧

// --- Vercel 비밀 금고에서 키 가져오기 ---
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID, // (선택 사항이지만 추가)
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

// --- DB, Storage, Auth 연결 및 내보내기 ---
let db = {};
let storage = {};
let auth = {}; // (NEW!) Auth 객체 선언!

if (app.options && app.options.projectId) { // 초기화 성공 여부 확인
    db = getFirestore(app); 
    storage = getStorage(app);
    auth = getAuth(app); // (NEW!) Auth 객체 초기화!
} else {
  console.error("Firebase app not initialized correctly. Services unavailable.");
}

export { app, db, storage, auth }; // (NEW!) auth 🔑 싹! 내보내기!