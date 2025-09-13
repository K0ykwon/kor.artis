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

export default function ContextChallenge() {
  const [kiceData, setKiceData] = useState<KICEData | null>(null)
  const [currentText, setCurrentText] = useState<KICEText | null>(null)
  const [userSummary, setUserSummary] = useState('')
  const [aiFeedback, setAiFeedback] = useState('')
  const [improvedSummary, setImprovedSummary] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isEvaluating, setIsEvaluating] = useState(false)
  const [showResults, setShowResults] = useState(false)

  // KICE 데이터 로드
  useEffect(() => {
    const loadKICEData = async () => {
      try {
        const response = await fetch('/api/kice-data')
        const data = await response.json()
        setKiceData(data)
        
        // 랜덤 텍스트 선택
        if (data.texts && data.texts.length > 0) {
          const randomIndex = Math.floor(Math.random() * data.texts.length)
          setCurrentText(data.texts[randomIndex])
        }
      } catch (error) {
        console.error('KICE 데이터 로드 실패:', error)
      }
    }
    
    loadKICEData()
  }, [])

  // 요약 평가 및 피드백 생성
  const evaluateSummary = async () => {
    if (!userSummary.trim() || !currentText) return
    
    setIsEvaluating(true)
    
    try {
      const response = await fetch('/api/context-evaluation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalText: currentText.content,
          userSummary: userSummary,
          title: currentText.title,
          category: currentText.category
        })
      })
      
      const result = await response.json()
      if (result.success) {
        const data = JSON.parse(result.data)
        setAiFeedback(data.feedback)
        setImprovedSummary(data.improvedSummary)
        setShowResults(true)
      }
    } catch (error) {
      console.error('요약 평가 실패:', error)
    } finally {
      setIsEvaluating(false)
    }
  }

  // 새로운 텍스트로 다시 시작
  const startNewChallenge = () => {
    if (!kiceData) return
    
    const randomIndex = Math.floor(Math.random() * kiceData.texts.length)
    setCurrentText(kiceData.texts[randomIndex])
    setUserSummary('')
    setAiFeedback('')
    setImprovedSummary('')
    setShowResults(false)
  }

  if (!currentText) {
    return (
      <div className="context-challenge-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>지문을 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="context-challenge-page">
      <div className="challenge-container">
        {/* 헤더 */}
        <div className="challenge-header">
          <h1>① '문맥 파악' 스킬업</h1>
          <p>▼ 문해력 향상 챌린지</p>
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

        {/* 사용자 요약 입력 */}
        {!showResults && (
          <div className="summary-input-section">
            <h3>📝 지문을 한 문장으로 요약해보세요</h3>
            <div className="input-container">
              <textarea
                value={userSummary}
                onChange={(e) => setUserSummary(e.target.value)}
                placeholder="지문의 핵심 내용을 한 문장으로 요약해주세요..."
                className="summary-input"
                rows={3}
              />
              <button 
                className="evaluate-btn"
                onClick={evaluateSummary}
                disabled={!userSummary.trim() || isEvaluating}
              >
                {isEvaluating ? 'AI가 평가 중...' : '요약 평가하기'}
              </button>
            </div>
          </div>
        )}

        {/* 결과 표시 */}
        {showResults && (
          <div className="results-section">
            {/* 사용자 요약 */}
            <div className="user-summary-box">
              <h4>📝 당신의 요약</h4>
              <p>{userSummary}</p>
            </div>

            {/* AI 피드백 */}
            <div className="feedback-box">
              <h4>🤖 AI 피드백</h4>
              <p>{aiFeedback}</p>
            </div>

            {/* 개선된 요약 */}
            <div className="improved-summary-box">
              <h4>✨ 보완한 요약문 제안</h4>
              <p>{improvedSummary}</p>
            </div>

            {/* 설명 */}
            <div className="explanation-box">
              <h4>💡 개선 포인트</h4>
              <p>이렇게 하면 단순히 핵심 내용만 나열하지 않고, 지문이 강조하는 갈등 구조와 가치 논의까지 담을 수 있어요.</p>
            </div>

            {/* 액션 버튼들 */}
            <div className="action-buttons">
              <button className="keep-original-btn">
                원래 문장에 살만 붙이기
              </button>
              <button className="use-improved-btn">
                정리된 형태로 바꾸기
              </button>
            </div>

            {/* 새로운 챌린지 버튼 */}
            <div className="action-buttons">
              <button className="keep-original-btn">
                원래 문장에 살만 붙이기
              </button>
              <button className="use-improved-btn">
                정리된 형태로 바꾸기
              </button>
            </div>

            <div className="new-challenge-section">
              <button className="new-challenge-btn" onClick={startNewChallenge}>
                🚀 새로운 지문으로 도전하기
              </button>
              
              <button 
                className="question-generation-btn" 
                onClick={() => {
                  const params = new URLSearchParams({
                    title: currentText.title,
                    category: currentText.category,
                    content: currentText.content
                  })
                  window.open(`/question-generation?${params.toString()}`, '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes')
                }}
              >
                🎯 이 지문으로 파생 문제 생성하기
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
