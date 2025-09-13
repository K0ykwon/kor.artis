'use client'

import { useState, useEffect } from 'react'

// 어휘 데이터
const vocabData = [
  { word: "애매하다", meaning: "명확하지 않고 모호하다", example: "그의 답변이 애매해서 이해하기 어렵다." },
  { word: "일관되다", meaning: "처음부터 끝까지 한결같다", example: "그는 일관된 태도로 일에 임한다." },
  { word: "모순되다", meaning: "서로 맞지 않아 어긋나다", example: "그의 말과 행동이 모순된다." },
  { word: "상호작용", meaning: "서로 영향을 주고받는 작용", example: "인간과 환경의 상호작용을 연구한다." },
  { word: "포괄적", meaning: "모든 것을 두루 포함하는", example: "포괄적인 해결책을 찾아야 한다." },
  { word: "구체적", meaning: "명확하고 실제적인", example: "구체적인 계획을 세워보자." },
  { word: "추상적", meaning: "구체적이지 않고 관념적인", example: "추상적인 개념을 이해하기 어렵다." },
  { word: "객관적", meaning: "개인의 감정이나 편견이 없는", example: "객관적인 시각에서 판단해야 한다." },
  { word: "주관적", meaning: "개인의 감정이나 의견에 따른", example: "주관적인 견해를 피해야 한다." },
  { word: "비판적", meaning: "문제점을 찾아 지적하는", example: "비판적 사고를 기르는 것이 중요하다." }
]

// SRS 복습 주기 (일 단위)
const SRS_INTERVALS = [0, 1, 3, 7]

export default function VocabChallenge() {
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [userAnswer, setUserAnswer] = useState('')
  const [score, setScore] = useState(0)
  const [completedWords, setCompletedWords] = useState(0)
  const [timeLeft, setTimeLeft] = useState(300) // 5분 = 300초
  const [isQuizActive, setIsQuizActive] = useState(false)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [showUpgrade, setShowUpgrade] = useState(false)

  // 타이머
  useEffect(() => {
    if (isQuizActive && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && isQuizActive) {
      setIsQuizActive(false)
      setQuizCompleted(true)
    }
  }, [isQuizActive, timeLeft])

  // 퀴즈 시작
  const startQuiz = () => {
    setIsQuizActive(true)
    setTimeLeft(300)
    setCurrentWordIndex(0)
    setShowAnswer(false)
    setUserAnswer('')
    setScore(0)
    setCompletedWords(0)
    setQuizCompleted(false)
    setShowUpgrade(false)
  }

  // 답안 확인
  const checkAnswer = () => {
    if (!showAnswer) {
      setShowAnswer(true)
      return
    }

    const currentWord = vocabData[currentWordIndex]
    const isCorrect = userAnswer.toLowerCase().includes(currentWord.meaning.toLowerCase()) || 
                     currentWord.meaning.toLowerCase().includes(userAnswer.toLowerCase())

    if (isCorrect) {
      setScore(score + 1)
    }

    setCompletedWords(completedWords + 1)
    
    // 다음 문제로
    if (currentWordIndex < vocabData.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1)
      setShowAnswer(false)
      setUserAnswer('')
    } else {
      // 퀴즈 완료
      setIsQuizActive(false)
      setQuizCompleted(true)
      if (score >= 7) { // 70% 이상 정답시 업그레이드 제안
        setShowUpgrade(true)
      }
    }
  }

  // 시간 포맷팅
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const currentWord = vocabData[currentWordIndex]

  return (
    <section className="vocab-challenge">
      <div className="container">
        <div className="challenge-header">
          <h2 className="challenge-title">
            국어 성적은 <span className="highlight">기본기</span>가 가장 중요합니다.
          </h2>
          <p className="challenge-subtitle">
            하루 15분으로 문해능력과 어휘력을 향상 해보세요.
          </p>
        </div>

        <div className="challenge-content">
          <div className="bait-product">
            <h3 className="bait-title">
              <span className="highlight">미끼상품</span> 5분 어휘 암기
            </h3>
            
            {!isQuizActive && !quizCompleted && (
              <div className="quiz-intro">
                <div className="intro-content">
                  <h4 className="section-title">② 어휘 암기 챌린지</h4>
                  <p className="challenge-description">
                    <strong>→ 하루 챌린지 완료 시 유료서비스 미끼상품으로 이동 (10분 독해루틴 기능)</strong>
                  </p>
                  
                  <div className="quiz-info">
                    <div className="info-item">
                      <span className="info-label">총 문제</span>
                      <span className="info-value">{vocabData.length}개</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">제한시간</span>
                      <span className="info-value">5분</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">목표점수</span>
                      <span className="info-value">7점 이상</span>
                    </div>
                  </div>

                  <button className="start-btn" onClick={startQuiz}>
                    🚀 5분 어휘 챌린지 시작하기
                  </button>
                </div>
              </div>
            )}

            {isQuizActive && (
              <div className="quiz-container">
                <div className="quiz-header">
                  <div className="progress-info">
                    <span>문제 {currentWordIndex + 1}/{vocabData.length}</span>
                    <span>점수: {score}</span>
                  </div>
                  <div className="timer">
                    ⏰ {formatTime(timeLeft)}
                  </div>
                </div>

                <div className="quiz-question">
                  <h3 className="question-word">{currentWord.word}</h3>
                  <p className="question-example">"{currentWord.example}"</p>
                  
                  <div className="answer-section">
                    {!showAnswer ? (
                      <div className="answer-input">
                        <input
                          type="text"
                          value={userAnswer}
                          onChange={(e) => setUserAnswer(e.target.value)}
                          placeholder="뜻을 입력하세요..."
                          className="answer-field"
                          onKeyPress={(e) => e.key === 'Enter' && checkAnswer()}
                        />
                        <button className="check-btn" onClick={checkAnswer}>
                          확인
                        </button>
                      </div>
                    ) : (
                      <div className="answer-reveal">
                        <div className="correct-answer">
                          <strong>정답: {currentWord.meaning}</strong>
                        </div>
                        <button className="next-btn" onClick={checkAnswer}>
                          {currentWordIndex < vocabData.length - 1 ? '다음 문제' : '퀴즈 완료'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {quizCompleted && (
              <div className="quiz-result">
                <div className="result-header">
                  <h3>🎉 5분 어휘 챌린지 완료!</h3>
                  <div className="result-stats">
                    <div className="stat-item">
                      <span className="stat-label">최종 점수</span>
                      <span className="stat-value">{score}/{vocabData.length}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">정답률</span>
                      <span className="stat-value">{Math.round((score / vocabData.length) * 100)}%</span>
                    </div>
                  </div>
                </div>

                {showUpgrade && (
                  <div className="upgrade-offer">
                    <div className="upgrade-content">
                      <h4>🎯 훌륭한 성과입니다!</h4>
                      <p>5분 공부 완료! 조금만 더 공부해볼까요?</p>
                      <a href="https://www.notion.so/26c7ff4cb3f2809face4dab5b5b3d01c?pvs=21" className="upgrade-link">
                        10분 독해루틴으로 성적을 더 올려보세요! →
                      </a>
                    </div>
                  </div>
                )}

                <div className="result-actions">
                  <button className="retry-btn" onClick={startQuiz}>
                    다시 도전하기
                  </button>
                </div>
              </div>
            )}

            <div className="features">
              <div className="feature-item">
                <h4 className="feature-title">간격 반복(SRS) 기반 복습 구조</h4>
                <p className="feature-description">
                  학습 단어 10개 → D0, D1, D3, D7 주기 복습
                </p>
                <div className="srs-visual">
                  <div className="srs-cycle">
                    <div className="day">D0</div>
                    <div className="arrow">→</div>
                    <div className="day">D1</div>
                    <div className="arrow">→</div>
                    <div className="day">D3</div>
                    <div className="arrow">→</div>
                    <div className="day">D7</div>
                  </div>
                </div>
              </div>

              <div className="feature-item">
                <h4 className="feature-title">데이터베이스 활용</h4>
                <ul className="db-list">
                  <li>수능특강 필수 어휘 DB</li>
                  <li>교과서 어휘 DB</li>
                  <li>AI 생성 어휘 DB (지속 확장 가능)</li>
                </ul>
                <div className="db-link">
                  <a href="https://www.studocu.com/ko/document/%EC%9D%B8%ED%97%AC%EA%B3%A0%EB%93%B1%ED%95%99%EA%B5%90/assential-literature/%EC%88%98%ED%8A%B9-%EB%8F%85%EC%84%9C-%EC%96%B4%ED%9C%98-%EC%88%98%ED%8A%B9-%EB%8F%85%EC%84%9C-%EC%96%B4%ED%9C%98/78471190" 
                     target="_blank" 
                     rel="noopener noreferrer"
                     className="external-link">
                    수능특강 어휘 자료 보기 →
                  </a>
                </div>
              </div>
            </div>

            <div className="cta-box">
              <div className="cta-icon">💡</div>
              <p className="cta-text">
                하루 5분, 간단하고 재밌게<br />
                수능국어 필수 어휘를 퀴즈로 외워보세요
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
