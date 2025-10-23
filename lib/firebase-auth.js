// (lib/firebase-auth.js - Auth 객체만 따로 초기화하여 export)

import { getAuth } from "firebase/auth";
import { app } from './firebase'; // (✨ 기존 초기화된 app 객체만 가져옵니다!)

// Auth 객체 초기화 및 내보내기 (이 파일은 '클라이언트'에서만 import됩니다.)
const auth = getAuth(app);

export { auth };