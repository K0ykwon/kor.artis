'use client'

import { useState, useEffect } from 'react'

interface KICEText {
  id: number
  title: string
  category: string
  word_count: number
  content: string
}

interface KICEData {
  metadata: {
    title: string
    description: string
    version: string
    created: string
    total_texts: number
  }
  texts: KICEText[]
}

interface GeneratedQuestion {
  id: number
  type: 'theme' | 'appreciation' | 'example'
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

export default function QuestionGeneration() {
  const [kiceData, setKiceData] = useState<KICEData | null>(null)
  const [currentText, setCurrentText] = useState<KICEText | null>(null)
  const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuestion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedAnswers, setSelectedAnswers] = useState<{[key: number]: number}>({})
  const [showResults, setShowResults] = useState(false)
  const [score, setScore] = useState(0)

  // KICE 데이터 로드
  useEffect(() => {
    const loadKICEData = async () => {
      try {
        // URL 파라미터에서 지문 정보 확인
        const urlParams = new URLSearchParams(window.location.search)
        const title = urlParams.get('title')
        const category = urlParams.get('category')
        const content = urlParams.get('content')
        
        if (title && category && content) {
          // URL에서 받은 지문 사용
          setCurrentText({
            id: 0,
            title,
            category,
            word_count: content.length,
            content
          })
        } else {
          // 랜덤 지문 로드
          const response = await fetch('/api/kice-data')
          const data = await response.json()
          setKiceData(data)
          
          if (data.texts && data.texts.length > 0) {
            const randomIndex = Math.floor(Math.random() * data.texts.length)
            setCurrentText(data.texts[randomIndex])
          }
        }
      } catch (error) {
        console.error('KICE 데이터 로드 실패:', error)
      }
    }
    
    loadKICEData()
  }, [])

  // 파생 문제 생성
  const generateQuestions = async () => {
    if (!currentText) return
    
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/question-generation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalText: currentText.content,
          title: currentText.title,
          category: currentText.category
        })
      })
      
      const result = await response.json()
      if (result.success) {
        setGeneratedQuestions(result.data.questions)
        setSelectedAnswers({})
        setShowResults(false)
        setScore(0)
      }
    } catch (error) {
      console.error('문제 생성 실패:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // 답안 선택
  const selectAnswer = (questionId: number, optionIndex: number) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }))
  }

  // 답안 확인
  const checkAnswers = () => {
    let correctCount = 0
    generatedQuestions.forEach(question => {
      if (selectedAnswers[question.id] === question.correctAnswer) {
        correctCount++
      }
    })
    setScore(correctCount)
    setShowResults(true)
  }

  // 새로운 지문으로 다시 시작
  const startNewChallenge = () => {
    if (!kiceData) return
    
    const randomIndex = Math.floor(Math.random() * kiceData.texts.length)
    setCurrentText(kiceData.texts[randomIndex])
    setGeneratedQuestions([])
    setSelectedAnswers({})
    setShowResults(false)
    setScore(0)
  }

  if (!currentText) {
    return (
      <div className="question-generation-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>지문을 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="question-generation-page">
      <div className="challenge-container">
        {/* 헤더 */}
        <div className="challenge-header">
          <h1>🎯 지문에서 파생 문제 3개 생성</h1>
          <p>AI가 지문을 분석해서 수능 스타일 문제를 생성합니다</p>
          {window.location.search && (
            <div className="source-info">
              <span className="source-badge">문맥 파악 챌린지에서 이어짐</span>
            </div>
          )}
        </div>

        {/* 지문 표시 */}
        <div className="passage-section">
          <div className="passage-header">
            <h2>{currentText.title}</h2>
            <div className="passage-meta">
              <span className="category">{currentText.category}</span>
              <span className="word-count">{currentText.word_count}자</span>
            </div>
          </div>
          <div className="passage-content">
            {currentText.content}
          </div>
        </div>

        {/* 문제 생성 버튼 */}
        {generatedQuestions.length === 0 && (
          <div className="generate-section">
            <button 
              className="generate-btn"
              onClick={generateQuestions}
              disabled={isLoading}
            >
              {isLoading ? 'AI가 문제를 생성하는 중...' : '🎯 파생 문제 3개 생성하기'}
            </button>
          </div>
        )}

        {/* 생성된 문제들 */}
        {generatedQuestions.length > 0 && !showResults && (
          <div className="questions-section">
            <h3>📝 생성된 문제들</h3>
            {generatedQuestions.map((question, index) => (
              <div key={question.id} className="question-card">
                <div className="question-header">
                  <span className="question-number">{index + 1}.</span>
                  <span className="question-type">
                    {question.type === 'theme' && '주제 파악'}
                    {question.type === 'appreciation' && '지문 감상'}
                    {question.type === 'example' && '사례 매칭'}
                  </span>
                </div>
                
                <div className="question-content">
                  <p className="question-text">{question.question}</p>
                  
                  <div className="options">
                    {question.options.map((option, optionIndex) => (
                      <button
                        key={optionIndex}
                        className={`option-btn ${selectedAnswers[question.id] === optionIndex ? 'selected' : ''}`}
                        onClick={() => selectAnswer(question.id, optionIndex)}
                      >
                        {String.fromCharCode(9312 + optionIndex)}. {option}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
            
            <div className="check-answers-section">
              <button 
                className="check-answers-btn"
                onClick={checkAnswers}
                disabled={Object.keys(selectedAnswers).length !== generatedQuestions.length}
              >
                답안 확인하기
              </button>
            </div>
          </div>
        )}

        {/* 결과 화면 */}
        {showResults && (
          <div className="results-section">
            <div className="score-display">
              <h3>🎉 채점 결과</h3>
              <div className="score-info">
                <span className="score">{score}/{generatedQuestions.length}</span>
                <span className="percentage">{Math.round((score / generatedQuestions.length) * 100)}%</span>
              </div>
            </div>

            {generatedQuestions.map((question, index) => (
              <div key={question.id} className="result-question-card">
                <div className="result-question-header">
                  <span className="question-number">{index + 1}.</span>
                  <span className={`result-badge ${selectedAnswers[question.id] === question.correctAnswer ? 'correct' : 'incorrect'}`}>
                    {selectedAnswers[question.id] === question.correctAnswer ? '정답' : '오답'}
                  </span>
                </div>
                
                <div className="result-question-content">
                  <p className="question-text">{question.question}</p>
                  
                  <div className="result-options">
                    {question.options.map((option, optionIndex) => (
                      <div
                        key={optionIndex}
                        className={`result-option ${
                          optionIndex === question.correctAnswer ? 'correct-answer' : 
                          optionIndex === selectedAnswers[question.id] && optionIndex !== question.correctAnswer ? 'wrong-answer' : ''
                        }`}
                      >
                        {String.fromCharCode(9312 + optionIndex)}. {option}
                        {optionIndex === question.correctAnswer && <span className="correct-mark">✓</span>}
                        {optionIndex === selectedAnswers[question.id] && optionIndex !== question.correctAnswer && <span className="wrong-mark">✗</span>}
                      </div>
                    ))}
                  </div>
                  
                  <div className="explanation">
                    <strong>해설:</strong> {question.explanation}
                  </div>
                </div>
              </div>
            ))}

            <div className="new-challenge-section">
              <button className="new-challenge-btn" onClick={startNewChallenge}>
                🚀 새로운 지문으로 도전하기
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
