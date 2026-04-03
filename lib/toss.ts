// Toss Payments Configuration
// 환경변수에서 키를 로드합니다. 실서비스 시 라이브 키로 교체하세요.

export const TOSS_CLIENT_KEY = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY!
export const TOSS_SECRET_KEY = process.env.TOSS_SECRET_KEY!
export const TOSS_WEBHOOK_SECRET = process.env.TOSS_WEBHOOK_SECRET || ''

export function getTossAuthHeader(): string {
  return `Basic ${Buffer.from(TOSS_SECRET_KEY + ':').toString('base64')}`
}

export function generateOrderId(prefix: string = 'ORDER'): string {
  const now = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  return `${prefix}_${now}_${random}`
}
