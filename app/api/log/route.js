import { auth } from '@/lib/firebase';
import { NextResponse } from 'next/server'; 
import { db } from '@/lib/firebase'; // 4-1에서 만든 'Firebase 설계도' 📝
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'; // Firebase '장부' 🗃️ 연장 🔧 (serverTimestamp ⌚ 포함!)

// ------------------------------------------
// (원래 코드) 4-2: '로그인 기록' ✍️ 비밀 주방 (POST 요청 처리!)
// ------------------------------------------
export async function POST(request) {
  try {
    // --- 1. 손님(로그인 페이지)이 보낸 '재료' 🥩 (학교/이름) 받기 ---
    const body = await request.json(); 
    const { school, name } = body; 

    // --- 2. '재료' 🥩 신선도(?) 검사 ---
    if (!school || !name || school.trim() === '' || name.trim() === '') {
      return NextResponse.json({ error: '학교명과 이름은 필수입니다.' }, { status: 400 });
    }

    // --- 3. Firebase '장부' 🗃️에 '기록' ✍️하기! ---
    console.log(`🔥 Logging user: ${school} - ${name}`); 

    // 'userLogs' 라는 이름의 '장부 칸' 📚 (컬렉션)에!
    const logCollection = collection(db, 'userLogs'); 

    // '새로운' 📄 '문서'(기록 1줄)를 '추가' ➕하는데...
    await addDoc(logCollection, {
      school: school, // (1) 학교명
      name: name,     // (2) 이름
      timestamp: serverTimestamp() // (3) ✨ (핵심!) Firebase 서버 '시계' ⌚로 '자동' 기록! ✨
    });

    // --- 4. "성공!" ✅ 손님한테 알려주기 ---
    return NextResponse.json({ message: '로그 기록 성공!' }, { status: 201 });

  } catch (error) {
    // --- 5. (비상!) 🚨 주방에서 불났을 때(?) ---
    console.error("🚨 Error logging user:", error); 
    // 500 상태 코드 ('주방 내부 문제!' 뜻) + 에러 메시지 보내기!
    return NextResponse.json({ error: '로그 기록 중 서버 오류 발생' }, { status: 500 });
  }
}

// (보너스!) GET 요청 등 다른 방식 요청 오면? -> "POST만 받는다!" 🚫
export async function GET() {
  return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 });
}