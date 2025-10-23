'use client'; 
import { useState, useCallback } from 'react'; // (NEW!) useCallback 추가!
import { useRouter } from 'next/navigation';

// (로그인 페이지)
export default function LoginPage() {
  // --- 상태 정의 (100% 동일) ---
  const [school, setSchool] = useState(''); 
  const [name, setName] = useState(''); 
  const [isLoading, setIsLoading] = useState(false); 
  const [error, setError] = useState(''); 
  const router = useRouter(); 

  // --- "작성하기" 버튼 핸들러 (NEW!) ✨ '비밀 주방' 🧑‍🍳 호출 로직 추가! ✨ ---
  const handleSubmit = useCallback(async (e) => { // (NEW!) async 추가! (fetch 쓰려면!)
    e.preventDefault(); 
    setIsLoading(true);
    setError('');
    if (school.trim() === '' || name.trim() === '') {
      setError('🚨 학교명과 이름은 필수 입력입니다!'); 
      setIsLoading(false); 
      return; 
    }

    try {
      // --- ✨ (핵심!) '비밀 주방'(/api/log)에 'POST' 방식으로 '요청' 📞! ---
      const response = await fetch('/api/log', { // (NEW!) 우리 '비밀 주방' 주소!
        method: 'POST', // (NEW!) '보내는' 방식!
        headers: {
          'Content-Type': 'application/json', // (NEW!) "JSON 형식으로 보낸다!"
        },
        body: JSON.stringify({ school, name }), // (NEW!) '학교/이름' 🥩 재료 포장! 🎁
      });

      // --- ✨ '비밀 주방' 🧑‍🍳의 '응답' 💬 확인! ---
      if (!response.ok) { // (NEW!) 응답이 '성공'(201) 아니면? ➡️ 에러! 💥
        const errorData = await response.json(); // (NEW!) 주방 에러 메시지 받기!
        throw new Error(errorData.error || '로그 기록 실패'); // (NEW!) 에러 던지기! 💥
      }

      // --- ✨ '성공!' ✅ ➡️ '생성기' 🤖 페이지로 이동! ---
      console.log('🔥 Log successful!'); // (NEW!) 브라우저 '콘솔'에도 기록!
      router.push('/generator'); 
      // (성공 시에는 setIsLoading(false) 할 필요 없음 -> 페이지 이동하니까!)

    } catch (err) {
      // --- ✨ '요청' 📞 실패 또는 '주방' 🧑‍🍳 에러 💥 처리! ---
      console.error("🚨 Logging error:", err);
      setError(err.message || '로그 기록 중 오류 발생'); // (NEW!) 에러 메시지 표시!
      setIsLoading(false); // (NEW!) 로딩 멈추기!
    }

    // --- (삭제!) '가짜' 로딩 1초 ➡️ 100% '삭제!' 🗑️ ---
    // setTimeout(() => { ... }, 1000); 

  }, [school, name, router]); // (NEW!) useCallback 의존성 추가!

  // --- (NEW!) ✨ 여기가 '예쁜 옷' 👕 입은 로그인 화면 (HTML/JSX - 100% 동일!) ---
  return (
    <div className="card login-card"> 
      <header className="card-header">
        <h1 className="card-title">🌱 AI 월별 IEP 생성기</h1>
        <p className="card-subtitle">(기본 CSS Ver! ✨)</p>
      </header>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div className="form-section">
          <label htmlFor="school" className="form-label">🏫 학교명</label>
          <input type="text" id="school" value={school} onChange={(e) => setSchool(e.target.value)} disabled={isLoading} placeholder="예) 새싹초등학교" className="input-text" />
        </div>
        <div className="form-section">
          <label htmlFor="name" className="form-label">👨‍🏫 성함</label>
          <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} disabled={isLoading} placeholder="예) 홍길동" className="input-text" />
        </div>
        <div style={{ paddingTop: '1rem' }}>
          <button type="submit" disabled={isLoading} className="button">
            {isLoading ? '기록 중...' : '📝 IEP 월별목표 작성하기 🚀'}
          </button>
        </div>
      </form>
      {error && <div className="error-box"><p>{error}</p></div>}
      <div style={{ textAlign: 'center', paddingTop: '0.5rem' }}>
        <a href="/admin" className="admin-link">(관리자 페이지)</a>
      </div>
    </div>
  );
}