// (✨ '새 파일' 📝 - app/api/admin/delete/route.js - '장부 삭제' 🗑️ API!)

import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase'; // 'Firebase 설계도' 📝
import { doc, deleteDoc } from 'firebase/firestore'; // '장부' 🗃️ 연장 🔧 (✨ '삭제' 🗑️ 연장!)

// ------------------------------------------
// ✨ 6-1: '관리자' 👑 '삭제' 🗑️ 비밀 주방 (POST 요청 처리!)
// ------------------------------------------
export async function POST(request) {
  try {
    // --- 1. '관리자' 👑 가 보낸 '비밀 암호' 🔑 + '삭제 ID' 🆔 받기 ---
    const body = await request.json();
    const { password, logId } = body; // (✨ '삭제 ID' 🆔 추가!)

    // --- 2. '진짜' 🔐 '비밀 암호' (Vercel 비밀 금고!) 랑 '비교' 🧐 ---
    const adminPassword = process.env.ADMIN_PASSWORD; // (동일!)

    if (!adminPassword) {
      throw new Error('관리자 암호가 서버에 설정되지 않았습니다! (ADMIN_PASSWORD)');
    }

    if (password !== adminPassword) {
      // (401: '인증 실패' 🚫 뜻)
      return NextResponse.json({ error: '🚨 암호가 틀렸습니다!' }, { status: 401 });
    }

    // --- 3. '삭제 ID' 🆔 검사 ---
    if (!logId) {
      return NextResponse.json({ error: '🚨 삭제할 로그 ID가 없습니다.' }, { status: 400 });
    }

    // --- 4. '암호' 🔑 맞으면 -> '장부' 🗃️ 에서 '기록' 📄 싹! '삭제' 🗑️! ---
    console.log(`🔥 Admin deleting log: ${logId}`);
    const logDocRef = doc(db, 'userLogs', logId); // 'userLogs' 장부 📚 에서 'logId' 📄 놈을 콕! 찍기!
    
    await deleteDoc(logDocRef); // (✨ '삭제' 🗑️ 실행!)

    // --- 5. "성공!" ✅ '관리자' 👑 한테 알려주기 ---
    return NextResponse.json({ message: '로그 삭제 성공!' }, { status: 200 });

  } catch (error) {
    // --- 6. (비상!) 🚨 주방에서 불났을 때(?) ---
    console.error("🚨 Error in delete API:", error);
    return NextResponse.json({ error: error.message || '삭제 API 오류' }, { status: 500 });
  }
}