import { Noto_Sans_KR } from 'next/font/google'; // (NEW!) '예쁜 글씨체' ✍️ 전문가

// (NEW!) ✨ '새 옷'(styles.css) 불러오기! ✨
import './styles.css'; 

// (이전과 동일) 글꼴 세팅 (둥글 + 무게)
const noto_sans_kr = Noto_Sans_KR({
  subsets: ['latin'], 
  weight: ['400', '500', '700'], 
});

// (이전과 동일) 탭 제목 🌱
export const metadata = {
  title: '🌱 AI 월별 IEP 생성기', 
  description: 'AI로 월별 개별화교육계획안을 생성합니다.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      {/* (이전과 동일) 'body'에 '예쁜 글씨체' ✍️ 적용! */}
      <body className={noto_sans_kr.className}> 
        {children}
      </body>
    </html>
  );
}