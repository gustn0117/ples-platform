// Toss Payments Configuration
// 테스트 키 — 실서비스 시 토스페이먼츠 대시보드에서 발급받은 라이브 키로 교체하세요.

export const TOSS_CLIENT_KEY = 'test_gck_docs_Ovk5rk1EwkEbP0W23n07xlzm'
export const TOSS_SECRET_KEY = 'test_gsk_docs_OaPz8L5KdmQXkzRz3y47BMw6'

export function generateOrderId(prefix: string = 'ORDER'): string {
  const now = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  return `${prefix}_${now}_${random}`
}
