// (✨ '새 파일' 📝 - app/api/admin/route.js - '장부 훔쳐보기' 🧐 API!)

import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase'; // 'Firebase 설계도' 📝
import { collection, getDocs, query, orderBy } from 'firebase/firestore'; // '장부' 🗃️ 연장 🔧 (읽기용!)

// ------------------------------------------
// ✨ 5-1: '관리자' 👑 비밀 주방 (POST 요청 처리!)
// ------------------------------------------
export async function POST(request) {
  try {
    // --- 1. '관리자' 👑 가 보낸 '비밀 암호' 🔑 받기 ---
    const body = await request.json();
    const { password } = body;

    // --- 2. '진짜' 🔐 '비밀 암호' (Vercel 비밀 금고!) 랑 '비교' 🧐 ---
    // (주의!) 🚨 '1234' 쓰지 마시고! -> Vercel '환경 변수' 🔑 에
    // 'ADMIN_PASSWORD' = '행님만 아는 진짜 비번!' 👈 요렇게 싹! 박아놓으십쇼!
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
      throw new Error('관리자 암호가 서버에 설정되지 않았습니다! (ADMIN_PASSWORD)');
    }

    if (password !== adminPassword) {
      // (401: '인증 실패' 🚫 뜻)
      return NextResponse.json({ error: '🚨 암호가 틀렸습니다!' }, { status: 401 });
    }

    // --- 3. '암호' 🔑 맞으면 -> '장부' 🗃️ 싹! 긁어오기! ---
    console.log('✅ Admin login successful! Fetching logs...');
    const logCollection = collection(db, 'userLogs'); // 'userLogs' 장부 칸 📚
    // '시간순' ⌚ (최신순!)으로 '정렬' 🍴
    const q = query(logCollection, orderBy('timestamp', 'desc')); 
    const querySnapshot = await getDocs(q); // '장부' 🗃️ 싹! 긁어오기!

    // --- 4. '장부' 🗃️ '예쁘게' 💅 가공하기 ---
    const logs = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        school: data.school,
        name: data.name,
        // (✨ Firebase '시간' ⌚ -> '글자' ✍️ 로 싹! 변환!)
        time: data.timestamp ? data.timestamp.toDate().toLocaleString('ko-KR') : '시간 기록 없음'
      };
    });

    // --- 5. "성공!" ✅ '관리자' 👑 한테 '장부' 🗃️ 쏴주기! ---
    return NextResponse.json({ logs: logs }, { status: 200 }); // 'logs' 🗃️ 쏴주기!

  } catch (error) {
    // --- 6. (비상!) 🚨 주방에서 불났을 때(?) ---
    console.error("🚨 Error in admin API:", error);
    return NextResponse.json({ error: error.message || '관리자 API 오류' }, { status: 500 });
  }
}