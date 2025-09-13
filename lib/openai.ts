import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function generateAiQuiz(word: string, meaning: string) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "당신은 수능 국어 어휘 학습을 도와주는 AI 튜터입니다. 주어진 단어를 활용한 창의적이고 교육적인 문장 작성 퀴즈를 만들어주세요."
        },
        {
          role: "user",
          content: `단어: "${word}" (의미: ${meaning})\n\n이 단어를 활용한 문장 작성 퀴즈를 만들어주세요. 다음 형식으로 응답해주세요:\n\n퀴즈: [창의적이고 구체적인 상황을 제시하는 질문]\n힌트: [단어를 사용할 수 있는 맥락이나 상황]\n예시: [올바른 사용 예시 문장]`
        }
      ],
      max_tokens: 300,
      temperature: 0.7,
    })

    return completion.choices[0]?.message?.content || "퀴즈를 생성할 수 없습니다."
  } catch (error) {
    console.error('OpenAI API Error:', error)
    return "AI 퀴즈 생성 중 오류가 발생했습니다."
  }
}

export async function evaluateSentence(word: string, meaning: string, userSentence: string) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "당신은 수능 국어 어휘 학습을 도와주는 AI 튜터입니다. 학생이 작성한 문장이 주어진 단어를 올바르게 사용했는지 간단히 평가해주세요."
        },
        {
          role: "user",
          content: `단어: "${word}" (의미: ${meaning})\n학생 문장: "${userSentence}"\n\n이 문장이 주어진 단어를 올바르게 사용했는지 평가해주세요. 다음 형식으로 응답해주세요:\n\n정답/오답: [정답 또는 오답]\n이유: [간단한 이유 설명]`
        }
      ],
      max_tokens: 200,
      temperature: 0.3,
    })

    return completion.choices[0]?.message?.content || "평가를 완료할 수 없습니다."
  } catch (error) {
    console.error('OpenAI API Error:', error)
    return "문장 평가 중 오류가 발생했습니다."
  }
}

// 빈칸 채우기 퀴즈 생성
export async function generateBlankQuiz(word: string, meaning: string, example: string, wrongOptions: string[]) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "당신은 수능 국어 어휘 학습을 도와주는 AI 튜터입니다. 주어진 단어를 활용한 빈칸 채우기 퀴즈를 만들어주세요. 반드시 한국어 문장과 어휘만 사용하고, 수능 수준에 맞는 내용을 작성해주세요."
        },
        {
          role: "user",
          content: `정답 단어: "${word}" (의미: ${meaning})\n틀린 선지들: ${wrongOptions.join(', ')}\n예문: "${example}"\n\n이 정답 단어만이 들어갈 수 있는 빈칸 채우기 퀴즈를 만들어주세요.\n\n중요한 규칙:\n1. 정답은 반드시 "${word}"여야 합니다\n2. 틀린 선지들(${wrongOptions.join(', ')})은 문맥상 들어갈 수 없어야 합니다\n3. 문장은 자연스럽고 수능 수준이어야 합니다\n4. 정답 단어만이 문맥상 완벽하게 맞아야 합니다\n5. 틀린 선지들은 문맥상 어색하거나 의미가 맞지 않아야 합니다\n\n다음 형식의 JSON으로 반환해주세요:\n{\n  "sentence": "문장에서 단어 부분을 [빈칸]으로 표시한 문장"\n}\n\n예시:\n{\n  "sentence": "그는 매우 [빈칸]한 사람이어서 항상 신중하게 행동한다."\n}`
        }
      ],
      max_tokens: 200,
      temperature: 0.3,
    })

    return completion.choices[0]?.message?.content || "빈칸 퀴즈를 생성할 수 없습니다."
  } catch (error) {
    console.error('OpenAI API Error:', error)
    return "빈칸 퀴즈 생성 중 오류가 발생했습니다."
  }
}

// 문맥 파악 요약 평가
export async function generateContextEvaluation(originalText: string, userSummary: string, title: string, category: string) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "당신은 수능 국어 문해력 평가 전문가입니다. 학생의 요약문을 평가하고 개선 방향을 제시해주세요. 수능 비문학 지문의 핵심을 정확히 파악하고, 갈등 구조와 가치 논의를 포함한 완성도 높은 요약문을 만들어주세요."
        },
        {
          role: "user",
          content: `제목: "${title}"
카테고리: ${category}

원본 지문:
${originalText}

사용자 요약:
${userSummary}

위 지문에 대한 사용자의 요약을 평가하고 개선된 요약문을 제안해주세요.

평가 기준:
1. 핵심 내용의 정확성
2. 갈등 구조나 대립 관계 파악
3. 가치 논의나 시사점 포함
4. 문장의 완성도와 간결성

다음 형식의 JSON으로 반환해주세요:
{
  "feedback": "사용자 요약에 대한 구체적인 피드백 (칭찬과 개선점 포함)",
  "improvedSummary": "개선된 요약문 (갈등 구조와 가치 논의 포함)"
}

예시 피드백:
- "👍 좋습니다! 핵심을 잘 짚었어요. 다만 지문에서는 A와 B의 갈등, 그리고 C의 필요성과 한계까지 강조하고 있으니 그 부분을 보완하면 더 완성도가 높아져요."

예시 개선된 요약:
- "A는 B의 문제를 해결하기 위해 C를 도입하고 있지만, D와 E 사이의 갈등과 F의 한계로 인해 G라는 사회적 과제를 안고 있다."`
        }
      ],
      max_tokens: 500,
      temperature: 0.3,
    })

    return completion.choices[0]?.message?.content || "문맥 평가를 생성할 수 없습니다."
  } catch (error) {
    console.error('OpenAI API Error:', error)
    return "문맥 평가 생성 중 오류가 발생했습니다."
  }
}

// 파생 문제 생성
export async function generateQuestions(originalText: string, title: string, category: string) {
  try {
    const completion = await openai.beta.chat.completions.parse({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "당신은 수능 국어 문제 출제 전문가입니다. 주어진 지문을 분석하여 수능 스타일의 3가지 유형 문제를 생성해주세요. 각 문제는 4지선다형이며, 정답과 해설을 포함해야 합니다."
        },
        {
          role: "user",
          content: `제목: "${title}"
카테고리: ${category}

원본 지문:
${originalText}

위 지문을 바탕으로 다음 3가지 유형의 문제를 생성해주세요:

1. 주제 파악 문제: "이 지문에서 저자가 말하고자 하는 바는?"
2. 지문 감상 문제: "지문을 감상한 내용으로 가장 적절한 것은?"
3. 사례 매칭 문제: "윗글의 주제와 부합하는 사례로 가장 적절한 것은?"

각 문제는 4지선다형이며, 수능 수준의 난이도로 출제해주세요.

중요한 규칙:
- correctAnswer는 0부터 3까지의 인덱스입니다
- 정답은 지문의 내용을 정확히 반영해야 합니다
- 오답들은 반드시 지문의 내용과 명확히 다른 부분을 근거로 해야 합니다
- 오답 생성 시 "지문에 언급되지 않은 내용", "지문과 반대되는 내용", "지문의 범위를 벗어난 내용" 등을 근거로 사용하세요
- 각 선택지는 구체적이고 현실적인 내용이어야 합니다
- 해설은 왜 그 답이 정답인지, 왜 다른 선택지들이 틀렸는지 명확히 설명해야 합니다
- 수능 비문학 지문의 특성을 반영한 문제를 만들어주세요`
        }
      ],
      max_tokens: 2000,
      temperature: 0.3,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "question_generation",
          schema: {
            type: "object",
            properties: {
              questions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "number" },
                    type: { type: "string", enum: ["theme", "appreciation", "example"] },
                    question: { type: "string" },
                    options: {
                      type: "array",
                      items: { type: "string" },
                      minItems: 4,
                      maxItems: 4
                    },
                    correctAnswer: { type: "number", minimum: 0, maximum: 3 },
                    explanation: { type: "string" }
                  },
                  required: ["id", "type", "question", "options", "correctAnswer", "explanation"]
                },
                minItems: 3,
                maxItems: 3
              }
            },
            required: ["questions"]
          }
        }
      }
    })

    return completion.choices[0]?.message?.parsed || { questions: [] }
  } catch (error) {
    console.error('OpenAI API Error:', error)
    return { questions: [] }
  }
}

// 유의어/반의어 퀴즈 생성
export async function generateSynonymQuiz(word: string, meaning: string, type: 'synonym' | 'antonym') {
  try {
    const typeNames = {
      synonym: '유의어',
      antonym: '반의어'
    }
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "당신은 수능 국어 어휘 학습을 도와주는 AI 튜터입니다. 주어진 단어의 정확한 유의어, 반의어를 찾아 4지선다형 퀴즈를 만들어주세요. 반드시 한국어 어휘만 사용하고, 수능 수준에 맞는 어휘를 선택해주세요."
        },
        {
          role: "user",
          content: `단어: "${word}" (의미: ${meaning})\n\n이 단어의 ${typeNames[type]}를 찾아서 4지선다형 퀴즈를 만들어주세요.\n\n중요한 규칙:\n1. 정답은 반드시 "${word}"의 정확한 ${typeNames[type]}여야 합니다\n2. 오답들은 비슷한 의미이지만 정확하지 않은 단어들이어야 합니다\n3. 모든 선택지는 한국어 단어여야 합니다\n4. 수능 수준의 어휘를 사용해주세요\n5. 정답은 첫 번째 옵션에 배치해주세요\n\n다음 형식의 JSON으로 반환해주세요:\n{\n  "options": ["정답", "오답1", "오답2", "오답3"]\n}\n\n예시:\n- 유의어: "아름답다" → {"options": ["예쁘다", "추하다", "못생기다", "보기싫다"]}\n- 반의어: "크다" → {"options": ["작다", "거대하다", "넓다", "높다"]}`
        }
      ],
      max_tokens: 200,
      temperature: 0.3,
    })

    return completion.choices[0]?.message?.content || "유의어 퀴즈를 생성할 수 없습니다."
  } catch (error) {
    console.error('OpenAI API Error:', error)
    return "유의어 퀴즈 생성 중 오류가 발생했습니다."
  }
}

// 문장 만들기 퀴즈 생성
export async function generateSentenceQuiz(word: string, meaning: string) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "당신은 수능 국어 어휘 학습을 도와주는 AI 튜터입니다. 주어진 단어를 활용한 문장 작성 퀴즈를 만들어주세요."
        },
        {
          role: "user",
          content: `단어: "${word}" (의미: ${meaning})\n\n다음 형식으로 문장 작성 퀴즈를 만들어주세요:\n\n"다음 단어를 활용하여 문장을 만들어보세요: [단어] (의미: [의미])"`
        }
      ],
      max_tokens: 100,
      temperature: 0.7,
    })

    return completion.choices[0]?.message?.content || "문장 퀴즈를 생성할 수 없습니다."
  } catch (error) {
    console.error('OpenAI API Error:', error)
    return "문장 퀴즈 생성 중 오류가 발생했습니다."
  }
}
