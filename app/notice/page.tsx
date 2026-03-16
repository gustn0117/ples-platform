export default function NoticePage() {
  const notices = [
    { id: 1, title: 'PLES 플랫폼 정식 오픈', date: '2025-05-26', content: 'PLES 플랫폼이 정식 오픈되었습니다. 투표, 아티스트 응원, 갤러리, 미디어 등 다양한 서비스를 이용해보세요.' },
    { id: 2, title: '스타 시스템 안내', date: '2025-06-01', content: '투표, 미디어 시청 등 활동을 통해 스타를 적립할 수 있으며, 적립한 스타로 아티스트를 응원하거나 갤러리 작품을 구매할 수 있습니다.' },
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">공지사항</h1>
        {notices.length === 0 ? (
          <div className="text-center py-20 border border-gray-100 rounded-2xl">
            <p className="text-gray-400">공지사항이 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notices.map((notice) => (
              <div key={notice.id} className="border border-gray-100 rounded-xl p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h2 className="text-base font-semibold text-gray-900">{notice.title}</h2>
                  <span className="text-xs text-gray-400 shrink-0">{notice.date}</span>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed">{notice.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
