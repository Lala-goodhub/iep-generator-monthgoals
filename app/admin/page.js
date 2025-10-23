'use client'; 
import { useState, useCallback } from 'react'; 
import Link from 'next/link';

// (✨ 6-2: '삭제' 🗑️ 기능 싹! 박아넣은 '최종' 🏛️ 관리자 페이지!)
export default function AdminPage() {
  const [password, setPassword] = useState(''); 
  const [isLoading, setIsLoading] = useState(false); 
  const [error, setError] = useState(''); 
  const [isLoggedIn, setIsLoggedIn] = useState(false); 
  const [logs, setLogs] = useState([]); 

  // --- ✨ '진짜' 💾 로그인 덩어리! (API 호출!) ---
  const handleLogin = useCallback(async (e) => { 
    e.preventDefault(); 
    setIsLoading(true);
    setError('');

    try {
      // --- (핵심!) '사장님 전용' 🔑 비밀 API ('/api/admin') 호출! ---
      const response = await fetch('/api/admin', { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }), // '비밀 암호' 🔑 쏴주기!
      });

      if (!response.ok) { // 응답이 '성공'(200) 아니면? ➡️ 에러! 💥
        const errorData = await response.json(); 
        throw new Error(errorData.error || '로그인 실패'); 
      }

      // --- '성공!' ✅ ➡️ '장부' 🗃️ 싹! 받아서 '화면' 🖥️ 에 뿌리기! ---
      const data = await response.json(); // '진짜' 장부 (logs 🗃️) 받기!
      console.log('✅ Admin logs fetched!', data.logs);
      
      setIsLoggedIn(true); // '진짜' 로그인 성공!
      setLogs(data.logs); // ✨ '진짜' 장부 🗃️ 싹! 채우기! ✨
      setError('');

    } catch (err) {
      // --- '요청' 📞 실패 또는 '주방' 🧑‍🍳 에러 💥 처리! ---
      console.error("🚨 Admin login error:", err);
      setIsLoggedIn(false); 
      setError(err.message || '로그인 중 오류 발생');
      // (✨ 1. '실패' 💥 했을 때만 비번 🔑 싹! 비우기!)
      setPassword(''); 
    } finally {
      setIsLoading(false); 
      // (✨ 2. '성공' ✅ 시에는 비번 🔑 '기억' 🧠 하도록 놔두기! -> '삭제' 🗑️ 할 때 써야 하니까!)
    }
  }, [password]); // (의존성 100% 동일!)

  // --- '로그아웃' ↩️ 함수 (100% 동일!) ---
  const handleLogout = useCallback(() => {
     setIsLoggedIn(false);
     setLogs([]);
     setError('');
     setPassword(''); // (✨ 로그아웃할 땐 '비번' 🔑 싹! 잊어버리기!)
  }, []);

// (✨ 3. '삭제' 🗑️ 함수 '통째로' 싹! '추가' ➕! - '따옴표' 💬 수리 🛠️ 완료!)

  const handleDeleteLog = useCallback(async (logId) => {
    // (✨ '삭제' 🗑️ 버튼 헷갈리니까 '한번 더' 🧐 물어보기!)
    // (✨ 삑사리 💥 수정! ➡️ ' (작은따옴표) 대신 " (쌍따옴표)로 싹! 감싸기!)
    if (!window.confirm("🚨 [주의!] 이 로그 📄 를 '진짜' 삭제하시겠습니까? (복구 불가!)")) {
      return; // "아니오" ✋ 누르면 ㅌㅌ!
    }

    setIsLoading(true); // (✨ '전체' ⏳ 로딩 돌리기!)
    setError('');

    try {
      // --- (핵심!) '비밀 삭제' 🧑‍🏭 API ('/api/admin/delete') 호출! ---
      const response = await fetch('/api/admin/delete', { // (NEW!) '삭제' API 주소!
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // (✨ '기억' 🧠 해둔 '비번' 🔑 + '삭제 ID' 🆔 쏴주기!)
        body: JSON.stringify({ password, logId }), 
      });

      if (!response.ok) { // (NEW!) 응답이 '성공'(200) 아니면? ➡️ 에러! 💥
        const errorData = await response.json();
        throw new Error(errorData.error || '로그 삭제 실패');
      }

      // --- '성공!' ✅ ➡️ '화면' 🖥️ 에서도 '즉시' ⚡️ 삭제! ---
      console.log('✅ Log deleted successfully!', logId);
      // ('logs' 🗃️ '장부' 깡통 🥫 에서... 'logId' 🆔 놈만 쏙! '필터' 🌪️!)
      setLogs(prevLogs => prevLogs.filter(log => log.id !== logId));
      
    } catch (err) {
      // --- '삭제' 🗑️ 실패 💥 처리! ---
      console.error("🚨 Log delete error:", err);
      setError(err.message || '로그 삭제 중 오류 발생');
    } finally {
      setIsLoading(false); // 로딩 멈추기!
    }
  }, [password]); // (✨ '기억' 🧠 해둔 '비번' 🔑 놈! 의존성 추가!)


  // --- (✨ 4. '화면' 🖥️ 그리기! - '삭제' 🗑️ 버튼 싹! 심기! 👨‍🌾) ---
  return (
    <main> 
      <div className="card"> 

        <header className="card-header relative"> 
          <Link 
            href="/" 
            style={{ 
              position: 'absolute', left: '0', top: '50%', transform: 'translateY(-50%)',
              textDecoration: 'none', color: '#0369a1', backgroundColor: '#e0f2fe',
              padding: '0.25rem 0.75rem', borderRadius: '0.5rem', boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
              fontSize: '0.875rem' 
            }}
            onMouseOver={(e) => { e.target.style.backgroundColor = '#bae6fd'; e.target.style.color = '#0284c7'; }}
            onMouseOut={(e) => { e.target.style.backgroundColor = '#e0f2fe'; e.target.style.color = '#0369a1'; }}
          >
            &larr; 돌아가기
          </Link>
          <h1 className="card-title">
            👑 관리자 페이지
          </h1>
          <p className="card-subtitle">
            (접속 기록 🗃️ 확인)
          </p>
        </header>

        {/* --- 로그인 안 됐을 때 (100% 동일!) --- */}
        {!isLoggedIn && (
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingTop: '1rem' }}>
            <div className="form-section">
              <label htmlFor="password" className="form-label">
                🔑 관리자 암호
              </label>
              <input
                type="password" 
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                placeholder="암호를 입력하세요..."
                className="input-text" 
              />
            </div>
            <div style={{ paddingTop: '0.5rem' }}>
              <button
                type="submit"
                disabled={isLoading}
                className="button button-secondary" 
              >
                {isLoading ? '확인 중...' : '로그인 🔓'}
              </button>
            </div>
          </form>
        )}

        {/* --- 로그인 성공 시 ('테이블' 📊 싹! '수정' 🛠️!) --- */}
        {isLoggedIn && (
          <div style={{ paddingTop: '1rem' }}>
            <h2 className="result-title" style={{ color: '#065f46', marginBottom: '1rem' }}> 
              ✅ 로그인 성공! (접속 기록 🗃️)
            </h2>
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>학교명 🏫</th>
                    <th>이름 👨‍🏫</th>
                    <th>접속 시간 ⌚</th>
                    <th>삭제 🗑️</th> {/* (✨ 4-1. '삭제' 🗑️ '칸' 1개 싹! '추가' ➕!) */}
                  </tr>
                </thead>
                <tbody>
                  {logs.length > 0 ? ( 
                    logs.map((log) => (
                      <tr key={log.id}>
                        <td>{log.school}</td>
                        <td>{log.name}</td>
                        <td>{log.time}</td>
                        <td>
                          {/* (✨ 4-2. '삭제' 🗑️ '버튼' 🖱️ 1개 싹! '추가' ➕!) */}
                          <button
                            onClick={() => handleDeleteLog(log.id)}
                            disabled={isLoading} // (✨ '삭제' 🗑️ 중 ⏳ 에는 '전부' 멈추기!)
                            className="button-delete" // (✨ '빨간' 🔴 버튼 - CSS는 행님이 맘대로!)
                          >
                            ❌
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : ( 
                    <tr>
                      {/* (✨ 4-3. 'colSpan' 놈 3 ➡️ 4 로 싹! '수정' 🛠️!) */}
                      <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                        아직 접속 기록이 없습니다.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <button
              onClick={handleLogout} 
              className="button-logout" 
            >
              로그아웃 ↩️
            </button>
          </div>
        )}

        {/* --- 에러 표시 (100% 동일!) --- */}
        {error && (
          <div className="error-box"> 
            <p>{error}</p>
          </div>
        )}

      </div>
    </main>
  );
}