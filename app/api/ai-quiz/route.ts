import { NextRequest, NextResponse } from 'next/server'
import { generateAiQuiz, evaluateSentence, generateBlankQuiz, generateSynonymQuiz, generateSentenceQuiz } from '@/lib/openai'

export async function POST(request: NextRequest) {
  try {
    const { action, word, meaning, userSentence, example, type, wrongOptions } = await request.json()

    if (action === 'generate') {
      const result = await generateAiQuiz(word, meaning)
      return NextResponse.json({ success: true, data: result })
    } else if (action === 'generateBlank') {
      const result = await generateBlankQuiz(word, meaning, example, wrongOptions || [])
      return NextResponse.json({ success: true, data: result })
    } else if (action === 'generateSynonym') {
      const result = await generateSynonymQuiz(word, meaning, type)
      return NextResponse.json({ success: true, data: result })
    } else if (action === 'generateSentence') {
      const result = await generateSentenceQuiz(word, meaning)
      return NextResponse.json({ success: true, data: result })
    } else if (action === 'evaluate') {
      const result = await evaluateSentence(word, meaning, userSentence)
      return NextResponse.json({ success: true, data: result })
    } else {
      return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
