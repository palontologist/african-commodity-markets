import Groq from 'groq-sdk'
import pRetry from 'p-retry'

const DEFAULT_MODEL = 'qwen/qwen3-32b'
const DEFAULT_MAX_TOKENS = 2048

export interface GroqChatParams {
  prompt: string
  temperature?: number
  maxTokens?: number
  responseFormat?: Record<string, unknown>
}

export interface GroqChatResult {
  content: string
  usage?: {
    promptTokens?: number
    completionTokens?: number
    totalTokens?: number
  }
}

// Type aliases for backward compatibility
export type GroqChatOptions = GroqChatParams
export type GroqChatResponse = GroqChatResult

let groqClient: Groq | null = null

function assertEnv(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

export function getGroqClient(): Groq {
  if (!groqClient) {
    const apiKey = assertEnv('GROQ_API_KEY', process.env.GROQ_API_KEY)
    groqClient = new Groq({ apiKey })
  }
  return groqClient
}

export async function runGroqChat({
  prompt,
  temperature = 0.3,
  maxTokens = DEFAULT_MAX_TOKENS,
  responseFormat,
}: GroqChatParams): Promise<GroqChatResult> {
  const client = getGroqClient()

  const result = await pRetry(
    async () => {
      const completion = await client.chat.completions.create({
        model: process.env.GROQ_MODEL ?? DEFAULT_MODEL,
        temperature,
        max_tokens: maxTokens,
        messages: [
          {
            role: 'system',
            content:
              'You are an expert agricultural commodities analyst producing structured forecasts with confidence scoring.',
          },
          { role: 'user', content: prompt },
        ],
        response_format: responseFormat,
      } as any)

      const choice = completion.choices?.[0]
      const content = choice?.message?.content

      if (!content) {
        throw new Error('Groq completion returned empty content')
      }

      return {
        content,
        usage: {
          promptTokens: completion.usage?.prompt_tokens,
          completionTokens: completion.usage?.completion_tokens,
          totalTokens: completion.usage?.total_tokens,
        },
      }
    },
    {
      retries: 2,
      minTimeout: 500,
      maxTimeout: 2000,
      onFailedAttempt: (error) => {
        console.warn('Groq chat attempt failed', error)
      },
    },
  )

  return result
}
