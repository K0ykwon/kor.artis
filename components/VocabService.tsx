'use client'

import { useState, useEffect } from 'react'
import { getRandomVocabs, VocabItem } from '@/lib/vocabData'

// SRS 복습 주기 (일 단위)
const SRS_INTERVALS = [0, 1, 3, 7]

export default function VocabService() {
  const [vocabDatabase, setVocabDatabase] = useState<VocabItem[]>([])
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [userAnswer, setUserAnswer] = useState('')
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(300) // 5분 = 300초
  const [isQuizActive, setIsQuizActive] = useState(false)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [studyStreak, setStudyStreak] = useState(0)
  const [totalWordsLearned, setTotalWordsLearned] = useState(0)
  const [showDetailedInfo, setShowDetailedInfo] = useState(false)
  const [aiQuizMode, setAiQuizMode] = useState(false)
  const [aiQuizSentence, setAiQuizSentence] = useState('')
  const [learnedWords, setLearnedWords] = useState<VocabItem[]>([])
  const [currentAiWord, setCurrentAiWord] = useState<VocabItem | null>(null)
  const [aiQuizData, setAiQuizData] = useState<string | null>(null)
  const [userSentence, setUserSentence] = useState('')
  const [evaluationResult, setEvaluationResult] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // 컴포넌트 마운트 시 랜덤 어휘 로드
  useEffect(() => {
    const randomVocabs = getRandomVocabs(15) // 15개 랜덤 어휘
    setVocabDatabase(randomVocabs)
  }, [])

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
    // 새로운 랜덤 어휘 세트 로드
    const newVocabs = getRandomVocabs(15)
    setVocabDatabase(newVocabs)
    
    setIsQuizActive(true)
    setTimeLeft(300)
    setCurrentWordIndex(0)
    setShowAnswer(false)
    setUserAnswer('')
    setScore(0)
    setQuizCompleted(false)
    setShowUpgrade(false)
    setLearnedWords([])
  }

  // 답안 확인
  const checkAnswer = () => {
    if (!showAnswer) {
      setShowAnswer(true)
      setShowDetailedInfo(true)
      return
    }

    const currentWord = vocabDatabase[currentWordIndex]
    const isCorrect = userAnswer.toLowerCase().includes(currentWord.meaning.toLowerCase()) || 
                     currentWord.meaning.toLowerCase().includes(userAnswer.toLowerCase())

    if (isCorrect) {
      setScore(score + 1)
      setLearnedWords([...learnedWords, currentWord])
    }

    // 다음 문제로
    if (currentWordIndex < vocabDatabase.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1)
      setShowAnswer(false)
      setShowDetailedInfo(false)
      setUserAnswer('')
    } else {
      // 퀴즈 완료
      setIsQuizActive(false)
      setQuizCompleted(true)
      setTotalWordsLearned(totalWordsLearned + vocabDatabase.length)
      setStudyStreak(studyStreak + 1)
      
      if (score >= Math.ceil(vocabDatabase.length * 0.7)) { // 70% 이상 정답시 업그레이드 제안
        setShowUpgrade(true)
      }
    }
  }

  // AI 랜덤 퀴즈 생성
  const generateAiQuiz = async () => {
    if (learnedWords.length === 0) return
    
    const randomWord = learnedWords[Math.floor(Math.random() * learnedWords.length)]
    setCurrentAiWord(randomWord)
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/ai-quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'generate',
          word: randomWord.word,
          meaning: randomWord.meaning
        })
      })
      
      const result = await response.json()
      
      if (result.success) {
        setAiQuizData(result.data)
        setAiQuizMode(true)
        setUserSentence('')
        setEvaluationResult(null)
      } else {
        console.error('AI 퀴즈 생성 실패:', result.error)
      }
    } catch (error) {
      console.error('API 호출 오류:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // 문장 평가
  const evaluateUserSentence = async () => {
    if (!userSentence.trim() || !currentAiWord) return
    
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/ai-quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'evaluate',
          word: currentAiWord.word,
          meaning: currentAiWord.meaning,
          userSentence: userSentence
        })
      })
      
      const result = await response.json()
      
      if (result.success) {
        setEvaluationResult(result.data)
      } else {
        console.error('문장 평가 실패:', result.error)
      }
    } catch (error) {
      console.error('API 호출 오류:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // 시간 포맷팅
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const currentWord = vocabDatabase[currentWordIndex]

  return (
    <section className="vocab-service">
      <div className="container">
        <div className="service-header">
          <h2 className="service-title">
            국어 성적은 <span className="highlight">기본기</span>가 가장 중요합니다
          </h2>
          <p className="service-subtitle">
            하루 15분으로 문해능력과 어휘력을 향상해보세요
          </p>
        </div>

        <div className="service-content">
          <div className="service-card">
            <div className="card-header">
              <h3 className="card-title">📚 수능 국어 어휘 마스터</h3>
              <div className="user-stats">
                <div className="stat-item">
                  <span className="stat-icon">🔥</span>
                  <span className="stat-text">{studyStreak}일 연속</span>
                </div>
                <div className="stat-item">
                  <span className="stat-icon">📖</span>
                  <span className="stat-text">{totalWordsLearned}개 학습</span>
                </div>
              </div>
            </div>
            
            {!isQuizActive && !quizCompleted && (
              <div className="quiz-intro">
                <div className="intro-content">
                  <h4 className="section-title">어휘 암기 챌린지</h4>
                  <p className="challenge-description">
                    수능 필수 어휘를 퀴즈로 재미있게 학습해보세요
                  </p>
                  
                  <div className="quiz-info">
                    <div className="info-item">
                      <span className="info-label">총 문제</span>
                      <span className="info-value">{vocabDatabase.length}개</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">제한시간</span>
                      <span className="info-value">5분</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">목표점수</span>
                      <span className="info-value">{Math.ceil(vocabDatabase.length * 0.7)}점 이상</span>
                    </div>
                  </div>

                  <button 
                    className="start-btn" 
                    onClick={() => window.open('/vocab-challenge', '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes')}
                  >
                    🚀 어휘 챌린지 시작하기
                  </button>
                </div>
              </div>
            )}

            {isQuizActive && (
              <div className="quiz-container">
                <div className="quiz-header">
                  <div className="progress-info">
                    <span>문제 {currentWordIndex + 1}/{vocabDatabase.length}</span>
                    <span>점수: {score}</span>
                  </div>
                  <div className="timer">
                    ⏰ {formatTime(timeLeft)}
                  </div>
                </div>

                <div className="quiz-question">
                  <div className="word-info">
                    <h3 className="question-word">{currentWord.word}</h3>
                    <span className="difficulty-badge">{currentWord.level}</span>
                  </div>
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
                        
                        {showDetailedInfo && (
                          <div className="detailed-info">
                            <div className="info-section">
                              <h4 className="info-title">📚 유의어</h4>
                              <div className="info-tags">
                                {currentWord.synonyms.map((synonym, index) => (
                                  <span key={index} className="info-tag synonym-tag">{synonym}</span>
                                ))}
                              </div>
                            </div>
                            
                            <div className="info-section">
                              <h4 className="info-title">📂 카테고리</h4>
                              <div className="info-tags">
                                <span className="info-tag category-tag">{currentWord.category}</span>
                              </div>
                            </div>
                            
                            <div className="info-section">
                              <h4 className="info-title">📊 빈도</h4>
                              <div className="info-tags">
                                <span className="info-tag frequency-tag">{currentWord.frequency}</span>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        <button className="next-btn" onClick={checkAnswer}>
                          {currentWordIndex < vocabDatabase.length - 1 ? '다음 문제' : '퀴즈 완료'}
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
                  <h3>🎉 어휘 챌린지 완료!</h3>
                  <div className="result-stats">
                    <div className="stat-item">
                      <span className="stat-label">최종 점수</span>
                      <span className="stat-value">{score}/{vocabDatabase.length}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">정답률</span>
                      <span className="stat-value">{Math.round((score / vocabDatabase.length) * 100)}%</span>
                    </div>
                  </div>
                </div>

                {showUpgrade && (
                  <div className="upgrade-offer">
                    <div className="upgrade-content">
                      <h4>🎯 훌륭한 성과입니다!</h4>
                      <p>기본 어휘를 마스터했으니 이제 독해 실력을 키워보세요!</p>
                      <a href="https://www.notion.so/26c7ff4cb3f2809face4dab5b5b3d01c?pvs=21" className="upgrade-link">
                        10분 독해루틴으로 성적을 더 올려보세요! →
                      </a>
                    </div>
                  </div>
                )}

                {learnedWords.length > 0 && (
                  <div className="ai-quiz-section">
                    <h4 className="ai-quiz-title">🤖 AI 랜덤 퀴즈</h4>
                    <p className="ai-quiz-description">
                      오늘 배운 단어를 활용해서 문장을 만들어보세요!
                    </p>
                    <button className="ai-quiz-btn" onClick={generateAiQuiz}>
                      AI 퀴즈 시작하기
                    </button>
                  </div>
                )}

                {aiQuizMode && (
                  <div className="ai-quiz-container">
                    <div className="ai-quiz-header">
                      <h4>🤖 AI 랜덤 퀴즈</h4>
                      <button 
                        className="close-ai-quiz" 
                        onClick={() => {
                          setAiQuizMode(false)
                          setEvaluationResult(null)
                          setUserSentence('')
                        }}
                      >
                        ✕
                      </button>
                    </div>
                    <div className="ai-quiz-content">
                      {currentAiWord && (
                        <div className="ai-quiz-word-info">
                          <h5>단어: <span className="highlight-word">{currentAiWord.word}</span></h5>
                          <p>의미: {currentAiWord.meaning}</p>
                        </div>
                      )}
                      
                      {isLoading ? (
                        <div className="loading-container">
                          <div className="loading-spinner"></div>
                          <p>AI가 퀴즈를 생성하고 있습니다...</p>
                        </div>
                      ) : aiQuizData ? (
                        <div className="ai-quiz-data">
                          <div className="quiz-section">
                            <h5>📝 퀴즈</h5>
                            <p className="quiz-question">{aiQuizData.split('퀴즈: ')[1]?.split('힌트: ')[0]}</p>
                          </div>
                          
                          <div className="quiz-section">
                            <h5>💡 힌트</h5>
                            <p className="quiz-hint">{aiQuizData.split('힌트: ')[1]?.split('예시: ')[0]}</p>
                          </div>
                          
                          <div className="quiz-section">
                            <h5>✍️ 문장 작성</h5>
                            <textarea
                              className="ai-quiz-textarea"
                              placeholder="여기에 문장을 작성해보세요..."
                              rows={4}
                              value={userSentence}
                              onChange={(e) => setUserSentence(e.target.value)}
                            />
                          </div>
                          
                          <div className="ai-quiz-actions">
                            <button 
                              className="ai-quiz-submit"
                              onClick={evaluateUserSentence}
                              disabled={!userSentence.trim() || isLoading}
                            >
                              {isLoading ? '평가 중...' : '제출하기'}
                            </button>
                            <button 
                              className="ai-quiz-skip"
                              onClick={generateAiQuiz}
                              disabled={isLoading}
                            >
                              다른 문제
                            </button>
                          </div>
                        </div>
                      ) : null}
                      
                      {evaluationResult && (
                        <div className="evaluation-result">
                          <h5>📊 AI 평가 결과</h5>
                          <div className="evaluation-content">
                            <pre className="evaluation-text">{evaluationResult}</pre>
                          </div>
                          <div className="evaluation-actions">
                            <button 
                              className="ai-quiz-submit"
                              onClick={() => {
                                setEvaluationResult(null)
                                setUserSentence('')
                              }}
                            >
                              다시 도전
                            </button>
                            <button 
                              className="ai-quiz-skip"
                              onClick={generateAiQuiz}
                            >
                              다른 문제
                            </button>
                          </div>
                        </div>
                      )}
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

            <div className="service-features">
              <div className="feature-item">
                <h4 className="feature-title">간격 반복(SRS) 학습</h4>
                <p className="feature-description">
                  과학적으로 검증된 복습 주기로 장기 기억을 형성합니다
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
                <h4 className="feature-title">수능 맞춤 어휘 데이터베이스</h4>
                <ul className="db-list">
                  <li>수능특강 필수 어휘 500개</li>
                  <li>교과서 핵심 어휘 300개</li>
                  <li>AI 분석 기출 어휘 200개</li>
                </ul>
                <div className="progress-bar">
                  <div className="progress-fill" style={{width: '60%'}}></div>
                  <span className="progress-text">총 1000개 중 600개 학습 완료</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
