'use client'; 
import { useState, useCallback } from 'react'; 
import Link from 'next/link';
import { storage } from '@/lib/firebase'; // Firebase Storage import
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"; 

// (생성기 페이지 - 최종 결과 표시!)
export default function GeneratorPage() {
  // --- 상태 정의 (동일) ---
  const [currentLevelText, setCurrentLevelText] = useState(''); 
  const [semesterGoalText, setSemesterGoalText] = useState(''); 
  const [prevGoalText, setPrevGoalText] = useState(''); 
  const [prevEvalText, setPrevEvalText] = useState('');
  const [standardText, setStandardText] = useState(''); 
  const [specialActivityText, setSpecialActivityText] = useState(''); 
  const [currentLevelFile, setCurrentLevelFile] = useState(null); 
  const [semesterGoalFile, setSemesterGoalFile] = useState(null); 
  const [prevGoalFile, setPrevGoalFile] = useState(null); 
  const [prevEvalFile, setPrevEvalFile] = useState(null); 
  const [standardFile, setStandardFile] = useState(null); 
  const [noPrevGoal, setNoPrevGoal] = useState(false); 
  const [noPrevEval, setNoPrevEval] = useState(false); 
  const [noStandard, setNoStandard] = useState(false); 
  const [noSpecialActivity, setNoSpecialActivity] = useState(false); 
  const [goalCount, setGoalCount] = useState(5); 
  const [goalLength, setGoalLength] = useState(50); 
  const [isLoading, setIsLoading] = useState(false); 
  const [result, setResult] = useState(null); // 결과는 객체 { rawContent? }
  const [error, setError] = useState(''); 
  const [isUploading, setIsUploading] = useState({ currentLevel: false, semesterGoal: false, prevGoal: false, prevEval: false, standard: false }); 
  const [fileURLs, setFileURLs] = useState({ currentLevel: null, semesterGoal: null, prevGoal: null, prevEval: null, standard: null }); 

// (✨ '진짜' 🪄 코드! - 요놈 2개를 싹! 붙여넣기!)

 // --- 파일 핸들러 (최종 수정본!) ---
 const handleFileChangeAndUpload = useCallback(async (e, setFile, currentTextValue, fileKey) => { 
    console.log(`[DEBUG] handleFileChangeAndUpload called for key: ${fileKey}`); 
    setError(''); 
    let file = null;
    const target = e?.dataTransfer || e?.target; 

    if (target?.files?.length > 0) {
        console.log('[DEBUG] File selected/dropped:', target.files[0]);
        file = target.files[0];
    } else {
        console.log('[DEBUG] No file detected in event or event object missing.');
        if (target instanceof HTMLInputElement && target.value) target.value = null; 
        return; 
    }

    const textToCheck = currentTextValue || ""; 

    const isValidDocx = file && (
        file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
        file.name.toLowerCase().endsWith('.docx') 
    );

    if (isValidDocx) { 
      if (textToCheck.trim() !== '') { 
         console.log('[DEBUG] Text exists, preventing file upload.');
         setError('🚨 텍스트와 파일은 동시에 입력할 수 없습니다!'); setFile(null); if (target instanceof HTMLInputElement && target.value) target.value = null; 
      } else { 
        console.log('[DEBUG] Valid DOCX file detected. Setting file state and starting upload...');
        setFile(file);  // (✨ "✅ 파일명 [X]" 으로 싹! 바꿔주는 놈!)
        setIsUploading(prev => ({ ...prev, [fileKey]: true })); 
        setError(''); 
        try { 
          const fileName = `${Date.now()}-${file.name}`;
          const storageRef = ref(storage, `uploads/${fileName}`);
          const uploadResult = await uploadBytes(storageRef, file);
          console.log('✅ File uploaded successfully!', uploadResult);
          const downloadURL = await getDownloadURL(uploadResult.ref);
          console.log('✅ File URL:', downloadURL);
          setFileURLs(prev => ({ ...prev, [fileKey]: downloadURL }));
        } catch (uploadError) {
          console.error("🚨 File Upload Error:", uploadError); setError(`🚨 파일 업로드 실패: ${uploadError.message}`); setFile(null); setFileURLs(prev => ({ ...prev, [fileKey]: null }));
        } finally {
          console.log('[DEBUG] Upload process finished.');
          setIsUploading(prev => ({ ...prev, [fileKey]: false })); 
          if (target instanceof HTMLInputElement && target.value) target.value = null; 
        }
      }
    } else if (file) { 
        console.log('[DEBUG] Invalid file type or extension:', file.type, file.name);
        setError(`🚨 .docx 워드 파일만 업로드 가능합니다! ('${file.name}' 형식: ${file.type || '알수없음'})`); 
        setFile(null); 
        if (target instanceof HTMLInputElement && target.value) target.value = null; 
    } else {
        console.log('[DEBUG] File object is null or invalid.');
    }
  }, [storage]); 

  // --- 파일 지우기 핸들러 (동일) ---
  const handleFileClear = useCallback((setFile, fileKey) => { 
      console.log(`[DEBUG] Clearing file for key: ${fileKey}`); 
      setFile(null); setFileURLs(prev => ({ ...prev, [fileKey]: null })); setError(''); 
  }, []);
  const handleSubmit = useCallback(async (e) => { 
    e.preventDefault(); setIsLoading(true); setResult(null); setError('');
    const hasCurrentLevel = (currentLevelText && currentLevelText.trim() !== '') || !!currentLevelFile;
    const hasSemesterGoal = (semesterGoalText && semesterGoalText.trim() !== '') || !!semesterGoalFile;
    if (!hasCurrentLevel || !hasSemesterGoal) { setError('🚨 현행 수준/학기 목표 필수!'); setIsLoading(false); return; }
    if (goalCount <= 0 || goalLength <= 0) { setError('🚨 갯수/글자 수는 1 이상!'); setIsLoading(false); return; }
    if (Object.values(isUploading).some(uploading => uploading)) { setError('🚨 파일 업로드 중... 잠시 후 다시 시도.'); setIsLoading(false); return; }
    try {
      // TODO: 파일 업로드 로직 강화 (텍스트 변환 등)
      const requestData = {
          currentLevelText: currentLevelText || "", semesterGoalText: semesterGoalText || "",
          prevGoalText: !noPrevGoal && prevGoalText ? prevGoalText : "", prevEvalText: !noPrevEval && prevEvalText ? prevEvalText : "",
          standardText: !noStandard && standardText ? standardText : "", 
          specialActivityText: !noSpecialActivity && specialActivityText ? specialActivityText : "", 
          noPrevGoal, noPrevEval, noStandard, noSpecialActivity, 
          goalCount, goalLength,
          fileURLs: { 
              currentLevel: currentLevelFile && fileURLs.currentLevel ? fileURLs.currentLevel : null,
              semesterGoal: semesterGoalFile && fileURLs.semesterGoal ? fileURLs.semesterGoal : null,
              prevGoal: prevGoalFile && fileURLs.prevGoal ? fileURLs.prevGoal : null,
              prevEval: prevEvalFile && fileURLs.prevEval ? fileURLs.prevEval : null,
              standard: standardFile && fileURLs.standard ? fileURLs.standard : null,
          }
      };
      console.log('🚀 Sending FINAL data to /api/generate:', requestData); 
      const response = await fetch('/api/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(requestData) });
      if (!response.ok) { 
        const errorData = await response.json().catch(() => ({})); 
        console.error('[DEBUG] API Error Response:', errorData);
        if (response.status === 400 && errorData.error?.includes('SAFETY')) { setError(errorData.error); } 
        else { throw new Error(errorData.error || `AI 서버 오류 (${response.status})`); }
      } else { const data = await response.json(); console.log('✅ Received FINAL data:', data); setResult(data); }
    } catch (err) { console.error("🚨 FINAL Generation error:", err); setError(err.message || '목표 생성 중 오류 발생'); } 
      finally { console.log('[DEBUG] Setting isLoading to false.'); setIsLoading(false); }
  }, [ 
      currentLevelText, semesterGoalText, prevGoalText, prevEvalText, standardText, specialActivityText,
      currentLevelFile, semesterGoalFile, prevGoalFile, prevEvalFile, standardFile, 
      noPrevGoal, noPrevEval, noStandard, noSpecialActivity, 
      goalCount, goalLength, 
      isUploading, fileURLs 
  ]);

  // --- ✨ 화면 그리기 (최종 결과 표시!) ✨ ---
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
          >&larr; 돌아가기</Link>
          <h1 className="card-title">🌱 월별 목표 생성기</h1>
        </header>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* --- Input Sections (1-6) --- */}
          <InputSectionCss title="1. 현행 수준 (⭐필수)" textValue={currentLevelText} onTextChange={(e) => { setCurrentLevelText(e.target.value); if (currentLevelFile) handleFileClear(setCurrentLevelFile, 'currentLevel'); }} fileValue={currentLevelFile} onFileChange={(e) => handleFileChangeAndUpload(e, setCurrentLevelFile, currentLevelText, 'currentLevel')} onFileClear={() => handleFileClear(setCurrentLevelFile, 'currentLevel')} fileId="file-current-level" isLoading={isLoading} isUploading={isUploading.currentLevel} />
          <InputSectionCss title="2. 학기 목표 (⭐필수)" textValue={semesterGoalText} onTextChange={(e) => { setSemesterGoalText(e.target.value); if (semesterGoalFile) handleFileClear(setSemesterGoalFile, 'semesterGoal'); }} fileValue={semesterGoalFile} onFileChange={(e) => handleFileChangeAndUpload(e, setSemesterGoalFile, semesterGoalText, 'semesterGoal')} onFileClear={() => handleFileClear(setSemesterGoalFile, 'semesterGoal')} fileId="file-semester-goal" isLoading={isLoading} isUploading={isUploading.semesterGoal} />
          <InputSectionCss title="3. 이전 월별 목표 (선택)" textValue={prevGoalText} onTextChange={(e) => { setPrevGoalText(e.target.value); if (prevGoalFile) handleFileClear(setPrevGoalFile, 'prevGoal'); }} fileValue={prevGoalFile} onFileChange={(e) => handleFileChangeAndUpload(e, setPrevGoalFile, prevGoalText, 'prevGoal')} onFileClear={() => handleFileClear(setPrevGoalFile, 'prevGoal')} fileId="file-prev-goal" isDisabled={noPrevGoal} checkboxChecked={noPrevGoal} onCheckboxChange={() => { setNoPrevGoal(!noPrevGoal); if (!noPrevGoal) { setPrevGoalText(''); handleFileClear(setPrevGoalFile, 'prevGoal');} }} checkboxLabel="이전 월별 목표가 없습니다." isLoading={isLoading} isUploading={isUploading.prevGoal} />
          <InputSectionCss title="4. 이전 월별 평가 (선택)" textValue={prevEvalText} onTextChange={(e) => { setPrevEvalText(e.target.value); if (prevEvalFile) handleFileClear(setPrevEvalFile, 'prevEval'); }} fileValue={prevEvalFile} onFileChange={(e) => handleFileChangeAndUpload(e, setPrevEvalFile, prevEvalText, 'prevEval')} onFileClear={() => handleFileClear(setPrevEvalFile, 'prevEval')} fileId="file-prev-eval" isDisabled={noPrevEval} checkboxChecked={noPrevEval} onCheckboxChange={() => { setNoPrevEval(!noPrevEval); if (!noPrevEval) { setPrevEvalText(''); handleFileClear(setPrevEvalFile, 'prevEval');} }} checkboxLabel="이전 월별 평가가 없습니다." isLoading={isLoading} isUploading={isUploading.prevEval} />
          <InputSectionCss title="5. 해당 과목 성취 기준 (선택)" textValue={standardText} onTextChange={(e) => { setStandardText(e.target.value); if (standardFile) handleFileClear(setStandardFile, 'standard'); }} fileValue={standardFile} onFileChange={(e) => handleFileChangeAndUpload(e, setStandardFile, standardText, 'standard')} onFileClear={() => handleFileClear(setStandardFile, 'standard')} fileId="file-standard" isDisabled={noStandard} checkboxChecked={noStandard} onCheckboxChange={() => { setNoStandard(!noStandard); if (!noStandard) { setStandardText(''); handleFileClear(setStandardFile, 'standard');} }} checkboxLabel="성취 기준을 제공하지 않습니다." isLoading={isLoading} isUploading={isUploading.standard} />
          <InputSectionCss title="6. 특별히 반영하고 싶은 교육 활동 (선택)" textValue={specialActivityText} onTextChange={(e) => setSpecialActivityText(e.target.value)} fileValue={null} onFileChange={() => {}} onFileClear={() => {}} fileId="file-special-activity" isDisabled={noSpecialActivity} checkboxChecked={noSpecialActivity} onCheckboxChange={() => { setNoSpecialActivity(!noSpecialActivity); if (!noSpecialActivity) { setSpecialActivityText('');} }} checkboxLabel="특별 교육 활동 없음" isLoading={isLoading} isFileUploadEnabled={false} />
          
          <div className="form-section" style={{marginTop: 0, marginBottom: 0}}> 
             <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1f2937', marginBottom: '1rem' }}>7. AI 생성 옵션 ⚙️</h2>
             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}> 
               <div><label htmlFor="goal-count" className="form-label">(1) 생성할 목표 갯수</label><input type="number" id="goal-count" value={goalCount} onChange={(e) => setGoalCount(Number(e.target.value))} min="1" className="input-text" disabled={isLoading} /></div>
               <div><label htmlFor="goal-length" className="form-label">(2) 목표당 글자 수</label><input type="number" id="goal-length" value={goalLength} onChange={(e) => setGoalLength(Number(e.target.value))} min="10" step="10" className="input-text" disabled={isLoading} /></div>
             </div>
           </div>

          <div style={{ paddingTop: '1rem' }}> 
             <button type="submit" disabled={isLoading || Object.values(isUploading).some(u=>u)} className="button">
               {isLoading ? '🤖 AI가 생성 중...' : (Object.values(isUploading).some(u=>u) ? '⏳ 파일 업로드 중...' : '🚀 월별 목표 생성하기!')}
             </button>
           </div>
        </form>

        {/* --- 에러 표시 (동일) --- */}
        {error && <div className="error-box"><h3>😭 앗! 에러 발생!</h3><p>{error}</p></div>}
        
        {/* --- ✨ (최종!) AI 결과물 🍲 표시! -> 'rawContent' 만! ✨ --- */}
        {result && (
          <div className="result-box"> 
            {/* ✨ 제목(title), 부가설명(content) 제거! AI 응답만 표시! ✨ */}
            {result.rawContent && (
              <pre className="result-content" style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}> 
                {result.rawContent}
              </pre> 
            )}
            {/* (혹시 모를 문자열 결과 호환성) */}
            {typeof result === 'string' && <pre className="result-content">{result}</pre>}
          </div>
        )}
      </div>
    </main>
  );
} // GeneratorPage 함수 끝

// --- (InputSectionCss 부품 - 100% 동일!) ---
function InputSectionCss({ 
  title, textValue, onTextChange, fileValue, onFileChange, onFileClear, fileId,
  isDisabled = false, checkboxChecked, onCheckboxChange, checkboxLabel, isLoading = false, isUploading = false,
  isFileUploadEnabled = true 
}) {
  const [isDragging, setIsDragging] = useState(false); 
  const isActuallyDisabled = isDisabled || !!(fileValue && isDisabled); 
  const isTextDisabled = isActuallyDisabled || !!fileValue;
  const isFileDisabled = isActuallyDisabled || (textValue != null && typeof textValue === 'string' && textValue.trim() !== ''); 
  const handleDragOver = useCallback((e) => { e.preventDefault(); if (!isFileUploadEnabled || isFileDisabled || isLoading || isUploading) return; setIsDragging(true); }, [isFileUploadEnabled, isFileDisabled, isLoading, isUploading]); 
  const handleDragLeave = useCallback((e) => { e.preventDefault(); setIsDragging(false); }, []);
  const handleDrop = useCallback((e) => { e.preventDefault(); if (!isFileUploadEnabled || isFileDisabled || isLoading || isUploading) return; setIsDragging(false); onFileChange(e); }, [isFileUploadEnabled, isFileDisabled, isLoading, isUploading, onFileChange]); 
// (CCTV 🎥 설치한 새 코드! 🕵️‍♂️ - 요놈을 싹! 붙여넣으십쇼!)
  const handleFileClick = useCallback((e) => { 
    console.log('--- 🕵️‍♂️ CCTV-1: 파일 신호 잡힘! (in handleFileClick)', e);
    if (e.target.files && e.target.files.length > 0) {
      console.log('--- 🕵️‍♂️ CCTV-2: 파일 이름 잡힘!', e.target.files[0].name);
    } else {
      console.log('--- 🕵️‍♂️ CCTV-3: 앗! e.target.files가 비었음! 깡통! 🥫');
    }
    onFileChange(e); // (마법사 🪄 부르기!)
    console.log('--- 🕵️‍♂️ CCTV-4: 마법사 🪄 부르라고 신호 보냈음! (onFileChange 호출함)');
  }, [onFileChange]);

  // ✨ 여기가 화면을 그리는 부분 (JSX)! ✨
  return ( 
     <div className={`upload-section ${isActuallyDisabled ? 'disabled' : ''}`}>
      <h2 className="upload-title">{title}</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* 방법 1 */}
        <div>
          <label htmlFor={`text-${fileId}`} className="form-label">✍️ 직접 입력</label>
          <textarea id={`text-${fileId}`} rows={4} value={textValue ?? ''} onChange={onTextChange} disabled={isTextDisabled || isLoading || isUploading} placeholder={isTextDisabled ? '(파일 선택됨)' : (isActuallyDisabled ? '(비활성화됨)' : '여기에 입력...')} className="input-textarea" />
        </div>
        
        {/* 파일 업로드 기능 켜져 있을 때 */}
        {isFileUploadEnabled && (
          <>
            {/* 구분선 */}
            <div className="divider"><span>또는</span></div>
            {/* 방법 2 */}
            <div>
              <label className="form-label">📄 DOCX 파일</label>
              {!fileValue && (
                <label htmlFor={fileId} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} className={`upload-box ${isDragging ? 'dragging' : ''} ${isFileDisabled || isLoading || isUploading ? 'disabled' : ''}`} >
                  {isUploading ? (<div style={{color: '#0369a1'}}>⏳ 업로드 중...</div>) : (<div><span className="upload-icon">☁️</span><p className="upload-text">파일 '클릭' 🖱️ 또는 '드래그' ✋</p><p className="upload-hint">(.docx)</p></div>)}
                </label>
              )}
              {fileValue && (
                <div className="file-info"><span className="file-name">✅ {fileValue.name}</span><button type="button" onClick={onFileClear} disabled={isActuallyDisabled || isLoading || isUploading} className="file-clear-button">X</button></div>
              )}
              <input type="file" id={fileId} accept=".docx" onChange={handleFileClick} disabled={isFileDisabled || isLoading || isUploading} style={{ display: 'none' }} /> 
            </div>
          </>
        )}

        {/* 파일 업로드 기능 꺼져있을 때 */}
        {!isFileUploadEnabled && (
           <div style={{color: '#9ca3af', fontSize: '0.8rem', textAlign: 'center', padding: '1rem', border: '1px dashed #d1d5db', borderRadius: '0.5rem', marginTop: '1rem'}}> (파일 업로드 미지원) </div>
        )}
      </div>
      {/* 체크박스 */}
      {checkboxLabel && (
        <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
          <label className="checkbox-label"><input type="checkbox" checked={checkboxChecked} onChange={onCheckboxChange} className="checkbox" disabled={isLoading || isActuallyDisabled || isUploading} /><span>{checkboxLabel}</span></label> 
        </div> 
      )} 
    </div> // 여기가 InputSectionCss div 닫는 태그
  ); // 여기가 return 문의 닫는 소괄호!
} // InputSectionCss 함수 끝