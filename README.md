# 길품국어 랜딩페이지

수능 국어 1등급을 목표로 하는 학생들을 위한 교육 서비스 랜딩페이지입니다.

## 기술 스택

- **Next.js 14** - React 프레임워크
- **TypeScript** - 타입 안정성
- **Tailwind CSS** - 스타일링
- **Noto Sans KR** - 한글 폰트

## 주요 기능

- 📅 실시간 수능 D-Day 카운트다운
- 🎯 강사 소개 및 강의 정보
- ⭐ 학생 후기 및 성과 표시
- 📱 반응형 디자인
- 🎨 모던한 UI/UX

## 설치 및 실행

1. 의존성 설치
```bash
npm install
```

2. 개발 서버 실행
```bash
npm run dev
```

3. 브라우저에서 `http://localhost:3000` 접속

## 프로젝트 구조

```
├── app/
│   ├── globals.css      # 전역 스타일
│   ├── layout.tsx       # 루트 레이아웃
│   └── page.tsx         # 메인 페이지
├── components/
│   ├── Header.tsx       # 헤더 컴포넌트
│   ├── MainPromotion.tsx # 메인 프로모션
│   ├── InstructorBanner.tsx # 강사 배너
│   └── Testimonials.tsx # 후기 섹션
├── package.json
├── tailwind.config.js
└── tsconfig.json
```

## 컴포넌트 설명

- **Header**: 수능 D-Day 카운트다운 표시
- **MainPromotion**: 메인 헤드라인과 서브 텍스트
- **InstructorBanner**: 강사 소개 및 강의 정보
- **Testimonials**: 학생 후기 그리드와 메가패스 배지

## 스타일링

- Tailwind CSS와 커스텀 CSS를 조합하여 사용
- 반응형 디자인으로 모바일/태블릿/데스크톱 지원
- 한글 폰트 최적화 (Noto Sans KR)
