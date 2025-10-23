// app/api/generate/route.js
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai'; 
import mammoth from 'mammoth'; 
import fetch from 'node-fetch'; 

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) { throw new Error("GEMINI_API_KEY is not set"); }

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ 
  model: "gemini-2.5-pro", 
  safetySettings: [ 
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  ] 
});

// --- 파일 내용 읽기 함수 (동일!) ---
const readFileContent = async (url) => { 
  if (!url) return null;
  try {
    console.log(`📄 Fetching file content from: ${url}`);
    const response = await fetch(url); 
    if (!response.ok) { throw new Error(`파일 다운로드 실패 (${response.status})`); }
    const arrayBuffer = await response.arrayBuffer(); 
    const buffer = Buffer.from(arrayBuffer); 
    const { value } = await mammoth.extractRawText({ buffer }); 
    console.log(`📄 Extracted text (first 100 chars): ${value.substring(0, 100)}...`);
    return value; 
  } catch (readError) {
    console.error(`🚨 Error reading file from ${url}:`, readError);
    return null; 
  }
};

// ------------------------------------------
// ✨ '최종 서식!' ✨ AI 목표 생성 주방!
// ------------------------------------------
export async function POST(request) {
  try {
    // --- 1. 재료 받기 (동일!) ---
    const body = await request.json();
    let { 
      currentLevelText, semesterGoalText, prevGoalText, prevEvalText, standardText,
      specialActivityText, 
      noPrevGoal, noPrevEval, noStandard, 
      noSpecialActivity, 
      goalCount, goalLength,
      fileURLs 
    } = body;
    console.log('✅ Received data (Final Format):', body); 

// (✨ '진짜' 📦 선언 코드! - 요놈으로 싹! 덮어쓰기!)

    // --- 2. 재료 검사 (싹! 다 선언!) ---
    const initialCurrentLevelText = currentLevelText;
    const initialSemesterGoalText = semesterGoalText;
    const initialPrevGoalText = prevGoalText; // (<- 요놈 3총사!)
    const initialPrevEvalText = prevEvalText; // (<- 싹! 추가!)
    const initialStandardText = standardText; // (<- 잊지 마십쇼!)
    const initialSpecialActivityText = specialActivityText;

    // --- 3. 파일 내용 읽기 (동일!) ---
    if (!initialCurrentLevelText && fileURLs?.currentLevel) { currentLevelText = await readFileContent(fileURLs.currentLevel) || ""; }
    if (!initialSemesterGoalText && fileURLs?.semesterGoal) { semesterGoalText = await readFileContent(fileURLs.semesterGoal) || ""; }
    /* ... 나머지 파일 읽기 ... */
    if (!noPrevGoal && !initialPrevGoalText && fileURLs?.prevGoal) { prevGoalText = await readFileContent(fileURLs.prevGoal) || ""; }
    if (!noPrevEval && !initialPrevEvalText && fileURLs?.prevEval) { prevEvalText = await readFileContent(fileURLs.prevEval) || ""; }
    if (!noStandard && !initialStandardText && fileURLs?.standard) { standardText = await readFileContent(fileURLs.standard) || ""; }

    // --- 4. 재료 검사 (파일 읽은 후 - 동일!) ---
    if (!currentLevelText || !semesterGoalText) { return NextResponse.json({ error: '현행 수준과 학기 목표 (텍스트 또는 파일)는 필수.' }, { status: 400 }); }
    if (goalCount <= 0 || goalLength <= 0) { return NextResponse.json({ error: '갯수/글자 수는 1 이상.' }, { status: 400 }); }

    // --- ✨ 5. AI '요리 지시서' 📝 (프롬프트) '최종 수정!' ✨ ---
    let prompt = `# 입력 정보:\n* **현행 수준:** ${currentLevelText}\n* **학기 목표:** ${semesterGoalText}`;
    if (!noPrevGoal && prevGoalText) prompt += `\n* **이전 월별 목표 (참고용, 반복 금지):** ${prevGoalText}`;
    if (!noPrevEval && prevEvalText) prompt += `\n* **이전 월별 평가:** ${prevEvalText}`;
    let standardTextForPrompt = ""; 
    if (!noStandard && standardText) { prompt += `\n* **관련 성취 기준 (입력):** ${standardText}`; standardTextForPrompt = standardText; }
    if (!noSpecialActivity && specialActivityText) { prompt += `\n* **특별히 반영할 교육 활동:** ${specialActivityText}`; }
    
// (✨ '최종 코스 요리' 🍽️ 지시서! - 요놈을 싹! 붙여넣기!)

    // 과목명 추출 (간단하게 학기 목표 첫 단어 사용)
    const subjectNameMatch = semesterGoalText.match(/^([\w\s]+)/); // 문자, 숫자, 공백으로 시작하는 첫 단어 그룹
    const subjectName = subjectNameMatch ? subjectNameMatch[1].trim() : "교과"; 
    
    const educationContentCount = goalCount + 2; // (✨ 1. '반찬' 🍱 갯수 계산!)

    prompt += `\n\n# 분석:
학생은 ${
// AI가 채울 부분
"" 
}.

# 생성 조건:
* 위 '입력 정보'와 '분석'을 종합적으로 고려하여 학기 목표 달성을 위한 **월별 목표 ${goalCount}개**를 생성합니다.
* '학생은 [AI가 채울 분석 내용]' 부분에는, '현행 수준'과 '학기 목표'를 바탕으로 학생의 **현재 강점, 약점, 그리고 이번 월별 목표가 왜 필요한지**를 **구체적이고 상세하게** 1~2문장으로 분석하여 작성합니다.
* 각 목표는 **${goalLength}자 내외**로 간결하게 작성합니다.
* 각 목표의 어미는 반드시 **'~을 할 수 있다.'** 로 끝나야 합니다.
* '이전 월별 목표'가 주어졌다면, 해당 목표와 **중복되지 않도록** 새로운 목표를 제안합니다.
* '특별히 반영할 교육 활동'이 주어졌다면, 생성되는 목표 중 **최소 1개 이상**은 해당 활동과 **직접적으로 관련**되도록 작성합니다.
* '성취 기준'이 주어졌다면(${standardTextForPrompt ? '현재 있음' : '현재 없음'}), 생성된 목표가 해당 성취 기준과 어떻게 관련되는지 **반드시 목표 내용 바로 아랫줄에** '[관련 성취 기준: ${standardTextForPrompt}]' 형식으로 추가합니다. 

* ✨ (3. '반찬' 🍱 '정렬' 🍴 규칙 추가!)
* **목표 목록 아래**에는 '[교육 목표]' 라는 제목을 붙여 목표를 나열합니다.
* '교육 목표' 목록 아래에는 '[교육 내용]' 섹션을 **반드시** 추가합니다.
* '교육 내용'은 위에서 생성된 '[교육 목표]' 달성에 필요한 **구체적인 활동 또는 실습 내용**이어야 합니다.
* '교육 내용'의 갯수는 **총 ${educationContentCount}개** (목표 갯수 + 2개)를 생성합니다.
* '교육 내용'은 **생성된 '[교육 목표]'의 순서대로 정렬**하여 **관련된 목표별로 그룹화**해야 합니다.
* '교육 내용'의 형식은 **'(목표 번호-내용 번호)'** (예: (1-1), (1-2), (2-1), (3-1)...) 형식을 사용합니다.
* 각 '교육 내용'은 **${goalLength}자 내외**로 작성합니다.
* 각 '교육 내용'의 어미는 반드시 **'~하기'** 로 끝나야 합니다.

* 결과 형식은 **반드시** 아래 예시와 같이 '[과목명 월별 개별화 교육 계획 목표]' 제목, 분석 내용, 목표 목록, 그리고 교육 내용 목록만 포함해야 합니다. **다른 인사말이나 부가 설명("네, 특수교육 전문가로서~" 등)은 절대로 추가하지 마세요.**

# 결과 예시:
[${subjectName} 월별 개별화 교육 계획 목표]

학생은 [AI가 채울 상세한 분석 내용].

[교육 목표]
1. [AI가 생성할 1번 목표 내용 (~을 할 수 있다.)]
[관련 성취 기준: AAA-01] (성취 기준 입력 시)
2. [AI가 생성할 2번 목표 내용 (~을 할 수 있다.)]
[관련 성취 기준: BBB-02] (성취 기준 입력 시)
3. [AI가 생성할 3번 목표 내용 (~을 할 수 있다.)]

[교육 내용]
(목표 1 관련)
1-1. [AI가 생성할 1번 목표 관련 교육 내용 (~하기)]
1-2. [AI가 생성할 1번 목표 관련 교육 내용 (~하기)]
(목표 2 관련)
2-1. [AI가 생성할 2번 목표 관련 교육 내용 (~하기)]
(목표 3 관련)
3-1. [AI가 생성할 3번 목표 관련 교육 내용 (~하기)]
3-2. [AI가 생성할 3번 목표 관련 교육 내용 (~하기)]`;

    console.log('📝 Generated Final Final Prompt:', prompt); 

    // --- 6. AI 🤖 호출! & 결과 🍲 받기! (동일!) ---
    const result = await model.generateContent(prompt); 
    let responseText = '';
    if (result?.response?.candidates?.[0]?.content?.parts?.[0]?.text) { 
        responseText = result.response.candidates[0].content.parts[0].text; 
    } else { 
        console.warn('⚠️ Unexpected AI response structure (Final Format):', result);
        if (result?.response?.promptFeedback?.blockReason) { throw new Error(`SAFETY: ${result.response.promptFeedback.blockReason}`); }
        if (result?.response?.candidates?.length === 0) { throw new Error('AI가 응답을 생성하지 못했습니다. (후보 없음)'); }
        throw new Error('AI로부터 유효한 응답 텍스트를 받지 못했습니다.');
    }
    console.log('🤖 AI Response Text (Final Format):', responseText);

    // --- 7. 결과 가공 (✨ 이제 AI가 다 해주므로 title, content 제거!) & 보내기 ---
    const finalResult = { 
      rawContent: responseText // AI 응답 '그대로' 전달!
    };
    
    return NextResponse.json(finalResult, { status: 200 });

  } catch (error) { 
    console.error("🚨 Error in /api/generate (Final Format):", error);
    if (error.message.includes('SAFETY')) { return NextResponse.json({ error: `AI가 유해 콘텐츠 가능성이 있어 응답을 차단했습니다 (이유: ${error.message.split(': ')[1]}). 내용을 수정 후 다시 시도해주세요.`, details: error.message }, { status: 400 }); }
    return NextResponse.json({ error: '목표 생성 중 서버 오류 발생', details: error.message }, { status: 500 });
  }
}
export async function GET(request) { return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 }); }