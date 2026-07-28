'use client'

// 전시 페이지 기간 동안 Footer를 최소화(copyright만) 함.
// 이전 링크/SNS/회사정보 블록 원복이 필요하면 git 히스토리에서 이전 버전 참조.
export default function Footer() {
  return (
    <footer className="bg-gray-50/50 border-t border-gray-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-center">
        <p className="text-xs text-gray-400 tracking-wide">
          &copy; {new Date().getFullYear()} PLES (주) 플레스. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
