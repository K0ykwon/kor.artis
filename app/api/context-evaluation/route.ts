import { NextRequest, NextResponse } from 'next/server'
import { generateContextEvaluation } from '@/lib/openai'

export async function POST(request: NextRequest) {
  try {
    const { originalText, userSummary, title, category } = await request.json()
    
    if (!originalText || !userSummary) {
      return NextResponse.json(
        { error: '원본 텍스트와 사용자 요약이 필요합니다.' },
        { status: 400 }
      )
    }
    
    const result = await generateContextEvaluation(originalText, userSummary, title, category)
    
    return NextResponse.json({
      success: true,
      data: result
    })
  } catch (error) {
    console.error('문맥 평가 실패:', error)
    return NextResponse.json(
      { error: '문맥 평가 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
