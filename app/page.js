'use client'; 
import { useState, useCallback } from 'react'; 
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase-auth'; // (✨ NEW!) 새로 만든 파일에서 Auth 가져오기!import { signInAnonymously } from 'firebase/auth'; // 익명 로그인 함수

// (로그인 페이지)
export default function LoginPage() {
  const [school, setSchool] = useState(''); 
  const [name, setName] = useState(''); 
  const [isLoading, setIsLoading] = useState(false); 
  const [error, setError] = useState(''); 
  const router = useRouter(); 

  // "작성하기" 버튼 핸들러 (익명 로그인 후 로그 기록!)
  const handleSubmit = useCallback(async (e) => { 
    e.preventDefault(); 
    setIsLoading(true);
    setError('');
    if (school.trim() === '' || name.trim() === '') {
      setError('학교명과 이름은 필수 입력입니다!'); 
      setIsLoading(false); 
      return; 
    }

    try {
      // (NEW!) 1. 익명 로그인 👤 (Firebase 인증 🔑 획득!)
      console.log('Attempting Anonymous Sign-in...');
      await signInAnonymously(auth);
      console.log('Anonymous Sign-in Success!');

      // --- 2. '비밀 주방'(/api/log)에 'POST' 방식으로 '요청' (로그 기록!) ---
      const response = await fetch('/api/log', { 
        method: 'POST', 
        headers: {
          'Content-Type': 'application/json', 
        },
        body: JSON.stringify({ school, name }), 
      });

      // --- 3. '비밀 주방'의 '응답' 확인! ---
      if (!response.ok) { 
        const errorData = await response.json(); 
        throw new Error(errorData.error || '로그 기록 실패'); 
      }

      // --- 4. '성공!' ✅ ➡️ '생성기' 페이지로 이동! ---
      console.log('Log successful!'); 
      router.push('/generator'); 

    } catch (err) {
      // --- '요청' 실패 또는 '주방' 에러 처리! ---
      console.error("Logging error:", err);
      setError(err.message || '로그 기록 중 오류 발생'); 
      setIsLoading(false); 
    }

  }, [school, name, router]); 

  // --- 여기가 로그인 화면 (HTML/JSX - 이모티콘 싹! 제거!) ---
  return (
    <div className="card login-card"> 
      <header className="card-header">
        <h1 className="card-title">AI 월별 IEP 생성기</h1>
        <p className="card-subtitle">(기본 CSS Ver!)</p>
      </header>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div className="form-section">
          <label htmlFor="school" className="form-label">학교명</label>
          <input type="text" id="school" value={school} onChange={(e) => setSchool(e.target.value)} disabled={isLoading} placeholder="예) 새싹초등학교" className="input-text" />
        </div>
        <div className="form-section">
          <label htmlFor="name" className="form-label">성함</label>
          <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} disabled={isLoading} placeholder="예) 홍길동" className="input-text" />
        </div>
        <div style={{ paddingTop: '1rem' }}>
          <button type="submit" disabled={isLoading} className="button">
            {isLoading ? '기록 중...' : 'IEP 월별목표 작성하기'}
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