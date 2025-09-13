'use client'

import { useState } from 'react'

export default function ContextService() {
  const [isActive, setIsActive] = useState(false)

  return (
    <div className="context-service">
      <div className="container">
        <div className="service-header">
          <h2 className="service-title">문맥 파악 스킬업</h2>
          <p className="service-subtitle">문해력 향상 챌린지</p>
        </div>

        <div className="service-card">
        <div className="card-header">
          <h3 className="card-title">📚 지문을 한 문장으로 요약 → AI가 부족한 부분 보완</h3>
          <div className="user-stats">
            <div className="stat-item">
              <span>난이도</span>
              <span className="stat-value">수능 수준</span>
            </div>
            <div className="stat-item">
              <span>소요시간</span>
              <span className="stat-value">10분 내외</span>
            </div>
          </div>
        </div>

        <div className="service-description">
          <h4>수능 비문학 지문의 핵심을 파악하고, 갈등 구조와 가치 논의를 포함한 완성도 높은 요약문을 작성해보세요.</h4>
          <p>KICE 비문학 텍스트 20개를 활용하여 문해력을 향상시키는 AI 기반 학습 서비스입니다.</p>
        </div>

        <div className="service-features">
          <div className="feature-item">
            <span className="feature-icon">📚</span>
            <span>KICE 비문학 텍스트 20개</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">🤖</span>
            <span>AI 실시간 피드백</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">✨</span>
            <span>개선된 요약문 제안</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">📈</span>
            <span>문해력 향상</span>
          </div>
        </div>

        <div className="service-info">
          <div className="info-item">
            <span className="info-label">목표</span>
            <span className="info-value">문맥 파악 능력 향상</span>
          </div>
        </div>

        <button 
          className="start-btn" 
          onClick={() => window.open('/context-challenge', '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes')}
        >
          📝 문맥 파악 챌린지 시작하기
        </button>
        </div>
      </div>
    </div>
  )
}
