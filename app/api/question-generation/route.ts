import { NextRequest, NextResponse } from 'next/server'
import { generateQuestions } from '@/lib/openai'

export async function POST(request: NextRequest) {
  try {
    const { originalText, title, category } = await request.json()
    
    if (!originalText) {
      return NextResponse.json(
        { error: '원본 텍스트가 필요합니다.' },
        { status: 400 }
      )
    }
    
    const result = await generateQuestions(originalText, title, category)
    
    return NextResponse.json({
      success: true,
      data: result
    })
  } catch (error) {
    console.error('문제 생성 실패:', error)
    return NextResponse.json(
      { error: '문제 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
