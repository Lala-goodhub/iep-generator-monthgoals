import { initializeApp, getApps } from "firebase/app"; 
import { getFirestore } from "firebase/firestore"; 
import { getStorage } from "firebase/storage"; 

// --- ✨ (핵심!) Vercel 비밀 금고에서 키 가져오는지 '점검!' ✨ ---
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// --- ✨ (핵심!) 가져온 키 값들을 '콘솔'에 찍어보기! ✨ ---
console.log("🔑 Firebase Config Check:", firebaseConfig); 
// (주의!) apiKey 빼고 나머지가 undefined 이면 금고 설정 오류!

let app;
if (!getApps().length) {
  try { // ✨ 초기화 오류 잡기 추가! ✨
    app = initializeApp(firebaseConfig);
    console.log("🔥 Firebase initialized!"); 
  } catch (initError) {
     console.error("🚨 Firebase Initialization Error:", initError);
     // 초기화 실패 시 빈 객체 할당 (추가 오류 방지)
     app = {}; 
  }
} else {
  app = getApps()[0]; 
}

// --- ✨ 초기화 성공 시에만 DB, Storage 연결! ✨ ---
let db = {};
let storage = {};
if (app.options) { // 초기화 성공 여부 확인
   db = getFirestore(app); 
   storage = getStorage(app);
} else {
   console.error("🚨 Firebase app not initialized correctly. DB and Storage unavailable.");
}

export { app, db, storage };