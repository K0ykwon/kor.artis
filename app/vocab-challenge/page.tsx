'use client'

import { useState, useEffect } from 'react'
import { getRandomVocabs, VocabItem } from '@/lib/vocabData'

export default function VocabChallenge() {
  const [currentStep, setCurrentStep] = useState(0) // 0: 단어 보기, 1: 퀴즈, 2: 결과
  const [vocabList, setVocabList] = useState<VocabItem[]>([])
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(300) // 5분
  const [isQuizActive, setIsQuizActive] = useState(false)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [currentQuizType, setCurrentQuizType] = useState<'basic' | 'blank' | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [preGeneratedQuizzes, setPreGeneratedQuizzes] = useState<any[]>([])
  const [currentQuizData, setCurrentQuizData] = useState<any>(null)
  const [generationProgress, setGenerationProgress] = useState(0)
  const [wrongWords, setWrongWords] = useState<VocabItem[]>([])
  const [learnedWords, setLearnedWords] = useState<VocabItem[]>([])
  const [srsData, setSrsData] = useState<{[key: string]: {level: number, nextReview: Date}}>({})

  // SRS 간격 (일 단위)
  const SRS_INTERVALS = [0, 1, 3, 7] // D0, D1, D3, D7

  // SRS 레벨 업데이트
  const updateSRSLevel = (word: string, isCorrect: boolean) => {
    setSrsData(prev => {
      const current = prev[word] || { level: 0, nextReview: new Date() }
      
      if (isCorrect) {
        // 정답이면 레벨 업
        const newLevel = Math.min(current.level + 1, SRS_INTERVALS.length - 1)
        const nextReview = new Date()
        nextReview.setDate(nextReview.getDate() + SRS_INTERVALS[newLevel])
        
        return {
          ...prev,
          [word]: { level: newLevel, nextReview }
        }
      } else {
        // 틀리면 레벨 다운 (최소 0)
        const newLevel = Math.max(current.level - 1, 0)
        const nextReview = new Date()
        nextReview.setDate(nextReview.getDate() + SRS_INTERVALS[newLevel])
        
        return {
          ...prev,
          [word]: { level: newLevel, nextReview }
        }
      }
    })
  }

  // 퀴즈 타입 랜덤 선택 (기본 50%, 빈칸 50%)
  const getRandomQuizType = (): 'basic' | 'blank' => {
    return Math.random() < 0.5 ? 'basic' : 'blank'
  }

  // 4지선다형 옵션 생성 (정답 위치 랜덤)
  const generateOptions = (correctWord: string, allWords: VocabItem[]) => {
    const correctAnswer = correctWord
    const wrongAnswers = allWords
      .filter(word => word.word !== correctAnswer)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3)
      .map(word => word.word)
    
    const allOptions = [correctAnswer, ...wrongAnswers]
    const shuffled = allOptions.sort(() => 0.5 - Math.random())
    
    console.log('generateOptions:', {
      correctAnswer,
      wrongAnswers,
      allOptions,
      shuffled,
      correctIndex: shuffled.indexOf(correctAnswer)
    })
    
    return {
      options: shuffled,
      correctIndex: shuffled.indexOf(correctAnswer)
    }
  }

  // 모든 퀴즈 미리 생성
  const generateAllQuizzes = async () => {
    const quizzes = []
    const usedWords = new Set()
    
    for (let i = 0; i < 15; i++) {
      // 중복되지 않은 단어 선택
      let word
      let attempts = 0
      do {
        word = vocabList[Math.floor(Math.random() * vocabList.length)]
        attempts++
      } while (usedWords.has(word.word) && attempts < 50)
      
      if (attempts >= 50) {
        usedWords.clear()
        word = vocabList[Math.floor(Math.random() * vocabList.length)]
      }
      
      usedWords.add(word.word)
      const quizType = getRandomQuizType()
      
      // 진행률 업데이트
      setGenerationProgress(Math.round(((i + 1) / 15) * 100))
      
      let quizData: any = {
        type: quizType,
        word: word,
        correctAnswer: word.word,
        correctIndex: 0,
        options: [] as string[],
        sentence: ''
      }
      
      if (quizType === 'basic') {
        // 기본 퀴즈: 의미 → 단어
        const optionData = generateOptions(word.word, vocabList)
        quizData.options = optionData.options
        quizData.correctIndex = optionData.correctIndex
      } else if (quizType === 'blank') {
        // 빈칸 퀴즈: AI로 문장 생성
        // 오답 3개 생성
        const wrongAnswers = vocabList
          .filter(w => w.word !== word.word)
          .sort(() => 0.5 - Math.random())
          .slice(0, 3)
          .map(w => w.word)
        
        try {
          const response = await fetch('/api/ai-quiz', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'generateBlank',
              word: word.word,
              meaning: word.meaning,
              example: word.example,
              wrongOptions: wrongAnswers
            })
          })
          
          const result = await response.json()
          if (result.success) {
            const data = JSON.parse(result.data)
            quizData.sentence = data.sentence
            
            // 선택지 구성 (정답 + 오답)
            const allOptions = [word.word, ...wrongAnswers]
            const shuffled = allOptions.sort(() => 0.5 - Math.random())
            quizData.options = shuffled
            quizData.correctIndex = shuffled.indexOf(word.word)
            
            console.log('Blank quiz generated:', {
              word: word.word,
              wrongAnswers,
              allOptions,
              shuffled,
              correctIndex: shuffled.indexOf(word.word)
            })
          }
        } catch (error) {
          console.error('빈칸 퀴즈 생성 실패:', error)
          // API 실패 시 기본 선택지 생성
          const allOptions = [word.word, ...wrongAnswers]
          const shuffled = allOptions.sort(() => 0.5 - Math.random())
          quizData.options = shuffled
          quizData.correctIndex = shuffled.indexOf(word.word)
          quizData.sentence = `이 문장에서 [빈칸]에 들어갈 단어를 선택하세요: "${word.meaning}"의 의미를 가진 단어는?`
        }
      }
      
      quizzes.push(quizData)
    }
    
    return quizzes
  }

  // 컴포넌트 마운트 시 랜덤 어휘 로드
  useEffect(() => {
    const randomVocabs = getRandomVocabs(15)
    setVocabList(randomVocabs)
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

  // 시간 포맷팅
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // 퀴즈 시작
  const startQuiz = async () => {
    setIsLoading(true)
    setCurrentStep(1)
    
    try {
      // 모든 퀴즈 미리 생성
      const quizzes = await generateAllQuizzes()
      setPreGeneratedQuizzes(quizzes)
      
      // 첫 번째 퀴즈 설정
      setCurrentQuizData(quizzes[0])
      setCurrentQuizType(quizzes[0].type)
      setCurrentWordIndex(0)
      setShowAnswer(false)
      setSelectedOption(null)
      setScore(0)
      setQuizCompleted(false)
      setIsCorrect(null)
      setWrongWords([])
      setLearnedWords([])
      
      setIsQuizActive(true)
      setTimeLeft(300)
    } catch (error) {
      console.error('퀴즈 생성 실패:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // 답안 확인
  const checkAnswer = () => {
    if (!showAnswer) {
      if (!selectedOption) {
        alert('답을 선택해주세요!')
        return
      }
      
      const currentQuiz = preGeneratedQuizzes[currentWordIndex]
      if (currentQuiz) {
        const selectedIndex = currentQuiz.options.indexOf(selectedOption)
        const correct = selectedIndex === currentQuiz.correctIndex
        
        setIsCorrect(correct)
        setShowAnswer(true)
        
        if (correct) {
          setScore(score + 1)
          setLearnedWords(prev => [...prev, currentQuiz.word])
        } else {
          setWrongWords(prev => [...prev, currentQuiz.word])
        }
        
        // SRS 레벨 업데이트
        updateSRSLevel(currentQuiz.word.word, correct)
      }
      return
    }

    // 다음 문제로
    if (currentWordIndex < preGeneratedQuizzes.length - 1) {
      const nextIndex = currentWordIndex + 1
      const nextQuiz = preGeneratedQuizzes[nextIndex]
      
      setCurrentWordIndex(nextIndex)
      setCurrentQuizData(nextQuiz)
      setCurrentQuizType(nextQuiz.type)
      setShowAnswer(false)
      setSelectedOption(null)
      setIsCorrect(null)
    } else {
      // 퀴즈 완료
      setIsQuizActive(false)
      setQuizCompleted(true)
    }
  }

  // currentWord는 이제 currentQuizData.word로 사용

  return (
    <div className="vocab-challenge-page">
      <div className="challenge-container">
        {/* 헤더 */}
        <div className="challenge-header">
          <h1>📚 수능 어휘 마스터 챌린지</h1>
          <p>KICE 필수 어휘 150개 중 랜덤 15개</p>
        </div>

        {/* 단계 0: 단어 미리보기 */}
        {currentStep === 0 && (
          <div className="word-preview">
            <h2>🎯 오늘의 어휘 15개</h2>
            <div className="word-grid">
              {vocabList.map((word, index) => (
                <div key={index} className="word-card">
                  <h3>{word.word}</h3>
                  <p className="meaning">{word.meaning}</p>
                  <span className="level-badge">{word.level}</span>
                  <span className="category-badge">{word.category}</span>
                </div>
              ))}
            </div>
            <div className="preview-actions">
              <button className="start-quiz-btn" onClick={startQuiz}>
                🚀 퀴즈 시작
              </button>
            </div>
          </div>
        )}

        {/* 로딩 화면 */}
        {isLoading && (
          <div className="loading-screen">
            <div className="loading-content">
              <div className="loading-spinner"></div>
              <h2>퀴즈를 생성하고 있습니다...</h2>
              <div className="progress-container">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${generationProgress}%` }}
                  ></div>
                </div>
                <p className="progress-text">{generationProgress}%</p>
              </div>
              <p>잠시만 기다려주세요!</p>
            </div>
          </div>
        )}

        {/* 단계 1: 퀴즈 */}
        {currentStep === 1 && !isLoading && (
          <div className="quiz-section">
            {/* 기본 퀴즈 (의미 → 단어) */}
            {currentQuizType === 'basic' && (
              <div className="basic-quiz">
                <div className="quiz-header">
                  <div className="progress-info">
                    <span>문제 {currentWordIndex + 1}/15 ({Math.round(((currentWordIndex + 1) / 15) * 100)}%)</span>
                    <span>점수: {score}</span>
                  </div>
                  <div className="timer">
                    ⏰ {formatTime(timeLeft)}
                  </div>
                </div>

                <div className="quiz-question">
                  <div className="meaning-info">
                    <h3 className="question-meaning">{currentQuizData?.word.meaning}</h3>
                    <span className="difficulty-badge">{currentQuizData?.word.level}</span>
                  </div>
                  
                  <div className="answer-section">
                    {!showAnswer ? (
                      <div className="multiple-choice">
                        <h4 className="choice-title">이 뜻에 해당하는 단어를 선택하세요:</h4>
                        <div className="choice-options">
                          {currentQuizData?.options.map((option: string, index: number) => (
                            <button
                              key={index}
                              className={`choice-option ${selectedOption === option ? 'selected' : ''}`}
                              onClick={() => setSelectedOption(option)}
                            >
                              {String.fromCharCode(65 + index)}. {option}
                            </button>
                          ))}
                        </div>
                        <button className="check-btn" onClick={checkAnswer}>
                          확인
                        </button>
                      </div>
                    ) : (
                      <div className="answer-reveal">
                        <div className={`result-message ${isCorrect ? 'correct' : 'incorrect'}`}>
                          <div className="result-icon">
                            {isCorrect ? '✅' : '❌'}
                          </div>
                          <div className="result-text">
                            <strong>{isCorrect ? '정답입니다!' : '틀렸습니다!'}</strong>
                          </div>
                        </div>
                        
                        <div className="correct-answer">
                          <strong>정답: {currentQuizData?.word.word}</strong>
                        </div>
                        
                        <div className="example-section">
                          <h4 className="example-title">📝 예문</h4>
                          <p className="question-example">"{currentQuizData?.word.example}"</p>
                        </div>
                        
                        <button className="next-btn" onClick={checkAnswer}>
                          {currentWordIndex < 14 ? '다음 문제' : '퀴즈 완료'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 빈칸 채우기 퀴즈 */}
            {currentQuizType === 'blank' && (
              <div className="blank-quiz">
                <div className="quiz-header">
                  <div className="progress-info">
                    <span>문제 {currentWordIndex + 1}/15 ({Math.round(((currentWordIndex + 1) / 15) * 100)}%)</span>
                    <span>점수: {score}</span>
                  </div>
                  <div className="timer">
                    ⏰ {formatTime(timeLeft)}
                  </div>
                </div>

                <div className="quiz-question">
                  <h3 className="quiz-title">📝 빈칸에 들어갈 단어를 선택하세요</h3>
                  <p className="blank-sentence">{currentQuizData?.sentence}</p>
                  
                  <div className="answer-section">
                    {!showAnswer ? (
                      <div className="multiple-choice">
                        <div className="choice-options">
                          {currentQuizData?.options.map((option: string, index: number) => (
                            <button
                              key={index}
                              className={`choice-option ${selectedOption === option ? 'selected' : ''}`}
                              onClick={() => setSelectedOption(option)}
                            >
                              {String.fromCharCode(65 + index)}. {option}
                            </button>
                          ))}
                        </div>
                        <button className="check-btn" onClick={checkAnswer}>
                          확인
                        </button>
                      </div>
                    ) : (
                      <div className="answer-reveal">
                        <div className={`result-message ${isCorrect ? 'correct' : 'incorrect'}`}>
                          <div className="result-icon">
                            {isCorrect ? '✅' : '❌'}
                          </div>
                          <div className="result-text">
                            <strong>{isCorrect ? '정답입니다!' : '틀렸습니다!'}</strong>
                          </div>
                        </div>
                        
                        <div className="correct-answer">
                          <strong>정답: {currentQuizData?.options[currentQuizData?.correctIndex]}</strong>
                        </div>
                        
                        <button className="next-btn" onClick={checkAnswer}>
                          {currentWordIndex < 14 ? '다음 문제' : '퀴즈 완료'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 퀴즈 완료 화면 */}
        {quizCompleted && (
          <div className="quiz-completed">
            <div className="completion-header">
              <h2>🎉 퀴즈 완료!</h2>
              <p>수고하셨습니다!</p>
            </div>
            
            <div className="completion-stats">
              <div className="stat-card">
                <div className="stat-number">{score}</div>
                <div className="stat-label">정답</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{15 - score}</div>
                <div className="stat-label">오답</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{Math.round((score / 15) * 100)}%</div>
                <div className="stat-label">정답률</div>
              </div>
            </div>

            {/* 틀린 단어들 */}
            {wrongWords.length > 0 && (
              <div className="wrong-words-section">
                <h3>❌ 틀린 단어들 ({wrongWords.length}개)</h3>
                <div className="wrong-words-grid">
                  {wrongWords.map((word, index) => (
                    <div key={index} className="wrong-word-card">
                      <h4>{word.word}</h4>
                      <p className="meaning">{word.meaning}</p>
                      <p className="example">"{word.example}"</p>
                      <div className="srs-info">
                        <span className="srs-level">SRS 레벨: {srsData[word.word]?.level || 0}</span>
                        <span className="next-review">
                          다음 복습: {srsData[word.word]?.nextReview?.toLocaleDateString() || '오늘'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SRS 복습 일정 */}
            <div className="srs-schedule">
              <h3>📅 SRS 복습 일정</h3>
              <div className="srs-timeline">
                <div className="srs-item">
                  <span className="srs-day">D0</span>
                  <span className="srs-desc">오늘 학습 완료</span>
                </div>
                <div className="srs-item">
                  <span className="srs-day">D1</span>
                  <span className="srs-desc">내일 복습</span>
                </div>
                <div className="srs-item">
                  <span className="srs-day">D3</span>
                  <span className="srs-desc">3일 후 복습</span>
                </div>
                <div className="srs-item">
                  <span className="srs-day">D7</span>
                  <span className="srs-desc">1주일 후 최종 복습</span>
                </div>
              </div>
              
              {/* 학습한 단어들의 SRS 상태 */}
              {learnedWords.length > 0 && (
                <div className="learned-words-srs">
                  <h4>✅ 학습한 단어들의 복습 일정</h4>
                  <div className="learned-words-list">
                    {learnedWords.map((word, index) => (
                      <div key={index} className="learned-word-item">
                        <span className="word">{word.word}</span>
                        <span className="srs-level">레벨 {srsData[word.word]?.level || 0}</span>
                        <span className="next-review">
                          {srsData[word.word]?.nextReview?.toLocaleDateString() || '오늘'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="completion-actions">
              <button 
                className="retry-btn" 
                onClick={() => {
                  setQuizCompleted(false)
                  setCurrentStep(0)
                  const newVocabs = getRandomVocabs(15)
                  setVocabList(newVocabs)
                  setCurrentWordIndex(0)
                  setScore(0)
                  setSelectedOption(null)
                  setIsCorrect(null)
                  setWrongWords([])
                  setLearnedWords([])
                }}
              >
                다시 도전하기
              </button>
              <button 
                className="home-btn" 
                onClick={() => window.close()}
              >
                홈으로 돌아가기
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
