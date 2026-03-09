// Mock Data for PLES Platform

export interface Artist {
  id: number;
  name: string;
  image: string;
  likes: number;
  genre: string;
  description?: string;
}

export interface Vote {
  id: number;
  title: string;
  description?: string;
  options: { id: number; label: string; votes: number }[];
  endDate: string;
  isActive: boolean;
  pointReward: number;
}

export interface Artwork {
  id: number;
  title: string;
  artist: string;
  image: string;
  category: '앨범' | '포스터' | '포토카드' | '머천다이즈' | '디지털';
  price: number;
  pointPrice: number;
  description: string;
  soldOut: boolean;
  stock: number;
  isNew?: boolean;
}

export interface Video {
  id: number;
  title: string;
  thumbnail: string;
  duration: string;
  pointReward: number;
  watched: boolean;
}

export interface PointHistory {
  id: number;
  date: string;
  type: 'earn' | 'use';
  category: string;
  amount: number;
  balance: number;
}

// 101 Artists
export const artists: Artist[] = [
  { id: 1, name: '김수현', image: '🎤', likes: 1523, genre: '보컬', description: '감성적인 목소리로 많은 팬을 사로잡은 보컬리스트' },
  { id: 2, name: '이지은', image: '🎵', likes: 1389, genre: '싱어송라이터', description: '작사, 작곡, 보컬까지 완벽한 올라운더 아티스트' },
  { id: 3, name: '박서준', image: '🎸', likes: 1245, genre: '기타', description: '어쿠스틱 기타의 따뜻한 감성을 전하는 뮤지션' },
  { id: 4, name: '전소미', image: '💃', likes: 1102, genre: '댄스', description: '에너지 넘치는 무대 퍼포먼스의 대명사' },
  { id: 5, name: '정국', image: '🎤', likes: 2450, genre: '보컬', description: '글로벌 팬덤을 보유한 올라운더 보컬리스트' },
  { id: 6, name: '카리나', image: '💃', likes: 2100, genre: '댄스', description: '비주얼과 실력을 겸비한 차세대 아이콘' },
  { id: 7, name: '임영웅', image: '🎵', likes: 1980, genre: '트로트', description: '세대를 아우르는 국민 가수' },
  { id: 8, name: '아이유', image: '🎹', likes: 2380, genre: '싱어송라이터', description: '대한민국 대표 솔로 아티스트' },
  { id: 9, name: '뷔', image: '🎤', likes: 2200, genre: '보컬', description: '독보적인 음색과 감성을 가진 아티스트' },
  { id: 10, name: '윈터', image: '💃', likes: 1650, genre: '댄스', description: '칼군무의 정석, 파워풀한 퍼포머' },
  { id: 11, name: '이찬혁', image: '🎸', likes: 890, genre: '밴드', description: '독창적인 음악 세계를 구축한 프로듀서 겸 뮤지션' },
  { id: 12, name: '로제', image: '🎵', likes: 1870, genre: '보컬', description: '독보적인 음색으로 글로벌 무대를 사로잡은 아티스트' },
  { id: 13, name: '지코', image: '🎤', likes: 760, genre: '래퍼', description: '프로듀싱부터 래핑까지 다재다능한 뮤지션' },
  { id: 14, name: '태연', image: '🎵', likes: 1540, genre: '보컬', description: '대한민국 대표 보컬 퀸' },
  { id: 15, name: '민호', image: '🎤', likes: 920, genre: '보컬', description: '배우와 가수를 넘나드는 멀티 엔터테이너' },
  { id: 16, name: '설윤', image: '💃', likes: 680, genre: '댄스', description: '매혹적인 무대 매너의 신예 퍼포머' },
  { id: 17, name: '도영', image: '🎤', likes: 1120, genre: '보컬', description: '안정적인 라이브 실력의 보컬리스트' },
  { id: 18, name: '하니', image: '💃', likes: 1450, genre: '댄스', description: '글로벌 인기를 누리는 퍼포먼스 퀸' },
  { id: 19, name: '이승기', image: '🎵', likes: 830, genre: '발라드', description: '국민 남동생에서 국민 가수로 성장한 아티스트' },
  { id: 20, name: '제니', image: '🎤', likes: 2050, genre: '보컬', description: '패션과 음악을 아우르는 글로벌 아이콘' },
  { id: 21, name: '차은우', image: '🎤', likes: 1780, genre: '보컬', description: '비주얼 센터이자 매력적인 보컬리스트' },
  { id: 22, name: '안유진', image: '💃', likes: 1920, genre: '댄스', description: '다재다능한 4세대 대표 아이돌' },
  { id: 23, name: '성한빈', image: '🎤', likes: 1350, genre: '보컬', description: '서바이벌에서 탄생한 차세대 스타' },
  { id: 24, name: '장원영', image: '💃', likes: 2300, genre: '댄스', description: '럭키 비키의 아이콘, 글로벌 IT걸' },
  { id: 25, name: '이영지', image: '🎤', likes: 1100, genre: '래퍼', description: '자유로운 음악 세계의 젊은 래퍼' },
  { id: 26, name: '민지', image: '💃', likes: 1680, genre: '댄스', description: '글로벌 걸그룹의 리더이자 올라운더' },
  { id: 27, name: '황민현', image: '🎵', likes: 950, genre: '보컬', description: '감미로운 목소리의 배우 겸 가수' },
  { id: 28, name: '해린', image: '💃', likes: 1560, genre: '댄스', description: '독특한 매력으로 팬심을 사로잡는 아티스트' },
  { id: 29, name: '박재범', image: '🎤', likes: 1200, genre: '힙합', description: 'K-힙합의 선구자, 글로벌 아티스트' },
  { id: 30, name: '카즈하', image: '💃', likes: 1400, genre: '댄스', description: '발레에서 K-POP으로, 우아한 퍼포머' },
  { id: 31, name: '지민', image: '🎤', likes: 2520, genre: '보컬', description: '현대 무용과 보컬의 완벽한 조화' },
  { id: 32, name: '슈가', image: '🎵', likes: 2150, genre: '프로듀서', description: '작곡과 프로듀싱의 천재, 다작 아티스트' },
  { id: 33, name: 'RM', image: '🎤', likes: 2080, genre: '래퍼', description: '음악과 예술을 아우르는 지적 래퍼' },
  { id: 34, name: '진', image: '🎤', likes: 1950, genre: '보컬', description: '넓은 음역대의 감성 보컬리스트' },
  { id: 35, name: '제이홉', image: '💃', likes: 1880, genre: '댄스', description: '희망을 전파하는 에너제틱 퍼포머' },
  { id: 36, name: '리사', image: '💃', likes: 2350, genre: '댄스', description: '세계적인 댄스 퍼포먼스의 아이콘' },
  { id: 37, name: '지수', image: '🎵', likes: 1720, genre: '보컬', description: '우아한 비주얼과 감미로운 보컬' },
  { id: 38, name: '다니엘', image: '💃', likes: 1580, genre: '댄스', description: '호주 출신의 글로벌 퍼포머' },
  { id: 39, name: '혜인', image: '💃', likes: 1340, genre: '댄스', description: '막내 온 탑, 성장하는 차세대 스타' },
  { id: 40, name: '은채', image: '🎤', likes: 1260, genre: '보컬', description: '청아한 음색의 떠오르는 보컬리스트' },
  { id: 41, name: '사쿠라', image: '💃', likes: 1690, genre: '댄스', description: 'J-POP에서 K-POP으로, 글로벌 아이돌' },
  { id: 42, name: '김채원', image: '🎵', likes: 1570, genre: '보컬', description: '파워풀한 보컬과 리더십의 소유자' },
  { id: 43, name: '허윤진', image: '🎤', likes: 1310, genre: '보컬', description: '뮤지컬 출신의 실력파 보컬리스트' },
  { id: 44, name: '카즈하', image: '💃', likes: 1400, genre: '댄스', description: '클래식 발레의 우아함을 K-POP에 접목' },
  { id: 45, name: '홍은채', image: '💃', likes: 1150, genre: '댄스', description: '순수한 매력의 차세대 센터' },
  { id: 46, name: '웬디', image: '🎤', likes: 1430, genre: '보컬', description: '파워 보컬의 정석, 감성 보이스' },
  { id: 47, name: '슬기', image: '💃', likes: 1380, genre: '댄스', description: '댄스와 보컬을 겸비한 올라운더' },
  { id: 48, name: '아이린', image: '💃', likes: 1620, genre: '댄스', description: '시대를 초월하는 비주얼의 아이콘' },
  { id: 49, name: '조이', image: '🎵', likes: 1180, genre: '보컬', description: '매력적인 허스키 보이스의 소유자' },
  { id: 50, name: '예리', image: '💃', likes: 980, genre: '댄스', description: '다채로운 매력의 멀티 엔터테이너' },
  { id: 51, name: '나연', image: '💃', likes: 1750, genre: '댄스', description: '밝은 에너지로 무대를 장악하는 센터' },
  { id: 52, name: '정연', image: '🎤', likes: 1020, genre: '보컬', description: '파워풀한 보컬의 메인 보컬리스트' },
  { id: 53, name: '모모', image: '💃', likes: 1480, genre: '댄스', description: '일본 출신의 댄스 머신' },
  { id: 54, name: '사나', image: '🎵', likes: 1530, genre: '보컬', description: '밝은 매력과 달콤한 보이스' },
  { id: 55, name: '미나', image: '💃', likes: 1290, genre: '댄스', description: '발레 출신의 우아한 퍼포머' },
  { id: 56, name: '다현', image: '🎤', likes: 1160, genre: '래퍼', description: '위트 있는 래핑과 밝은 에너지' },
  { id: 57, name: '채영', image: '💃', likes: 1070, genre: '댄스', description: '작지만 강한 무대 장악력' },
  { id: 58, name: '쯔위', image: '💃', likes: 1640, genre: '댄스', description: '아시아를 대표하는 글로벌 비주얼' },
  { id: 59, name: '지효', image: '🎤', likes: 1350, genre: '보컬', description: '리더십과 실력을 겸비한 메인 보컬' },
  { id: 60, name: '한소희', image: '🎵', likes: 1420, genre: '보컬', description: '배우에서 아티스트로 변신한 멀티 플레이어' },
  { id: 61, name: '수지', image: '🎵', likes: 1590, genre: '보컬', description: '국민 첫사랑, 연기와 음악의 아이콘' },
  { id: 62, name: '송강', image: '🎤', likes: 1030, genre: '보컬', description: '비주얼과 감성을 겸비한 신예 아티스트' },
  { id: 63, name: '김세정', image: '🎵', likes: 1270, genre: '싱어송라이터', description: '서바이벌 출신의 실력파 싱어송라이터' },
  { id: 64, name: '이무진', image: '🎸', likes: 1140, genre: '싱어송라이터', description: '감성 기타와 독특한 작곡 스타일' },
  { id: 65, name: '비비', image: '🎤', likes: 980, genre: '보컬', description: '독특한 음악 세계관의 인디 아티스트' },
  { id: 66, name: '이찬원', image: '🎵', likes: 1360, genre: '트로트', description: '젊은 세대의 트로트 왕자' },
  { id: 67, name: '영탁', image: '🎵', likes: 1050, genre: '트로트', description: '파워풀한 가창력의 트로트 가수' },
  { id: 68, name: '선미', image: '💃', likes: 1410, genre: '댄스', description: '독보적 콘셉트의 퍼포먼스 퀸' },
  { id: 69, name: '현아', image: '💃', likes: 1230, genre: '댄스', description: '자유로운 표현의 아이콘' },
  { id: 70, name: '청하', image: '💃', likes: 1320, genre: '댄스', description: '댄스 퀸으로 불리는 솔로 아티스트' },
  { id: 71, name: '화사', image: '🎤', likes: 1460, genre: '보컬', description: '파워풀한 보컬과 퍼포먼스의 대명사' },
  { id: 72, name: '휘인', image: '🎵', likes: 1190, genre: '보컬', description: '감미로운 음색의 R&B 보컬리스트' },
  { id: 73, name: '솔라', image: '🎤', likes: 1380, genre: '보컬', description: '4옥타브 고음의 파워 보컬리스트' },
  { id: 74, name: '문별', image: '🎤', likes: 1050, genre: '래퍼', description: '카리스마 넘치는 걸크러시 래퍼' },
  { id: 75, name: '강다니엘', image: '💃', likes: 1670, genre: '댄스', description: '서바이벌 레전드, 퍼포먼스의 정석' },
  { id: 76, name: '옹성우', image: '🎤', likes: 1040, genre: '보컬', description: '배우와 가수를 넘나드는 아티스트' },
  { id: 77, name: '하성운', image: '🎵', likes: 870, genre: '싱어송라이터', description: '감성적인 자작곡의 싱어송라이터' },
  { id: 78, name: '박지훈', image: '💃', likes: 1130, genre: '댄스', description: '윙크 소년에서 성장한 퍼포머' },
  { id: 79, name: '배진영', image: '🎤', likes: 820, genre: '보컬', description: '깊은 감성의 보컬리스트' },
  { id: 80, name: '이대휘', image: '🎵', likes: 910, genre: '프로듀서', description: '10대 작곡가에서 프로듀서로 성장' },
  { id: 81, name: '수빈', image: '🎤', likes: 1250, genre: '보컬', description: '차분한 리더십의 보컬리스트' },
  { id: 82, name: '연준', image: '💃', likes: 1180, genre: '댄스', description: '비주얼과 퍼포먼스를 겸비한 아이돌' },
  { id: 83, name: '범규', image: '🎸', likes: 1060, genre: '밴드', description: '기타와 보컬을 겸비한 뮤지션' },
  { id: 84, name: '태현', image: '🎤', likes: 1140, genre: '보컬', description: '독보적인 음색의 4세대 보컬리스트' },
  { id: 85, name: '휴닝카이', image: '🎵', likes: 1090, genre: '보컬', description: '다국적 매력의 올라운더 아티스트' },
  { id: 86, name: '엔하이픈 희승', image: '💃', likes: 1210, genre: '댄스', description: '세련된 퍼포먼스의 센터' },
  { id: 87, name: '제이크', image: '💃', likes: 1300, genre: '댄스', description: '호주 출신의 글로벌 아이돌' },
  { id: 88, name: '성훈', image: '🎤', likes: 1070, genre: '보컬', description: '조용한 카리스마의 보컬리스트' },
  { id: 89, name: '선우', image: '💃', likes: 960, genre: '댄스', description: '에너지 넘치는 무대의 분위기 메이커' },
  { id: 90, name: '니키', image: '💃', likes: 1150, genre: '댄스', description: '일본 출신의 천재 댄서' },
  { id: 91, name: '한지민', image: '🎵', likes: 880, genre: '보컬', description: '배우 겸 가수, 다재다능한 아티스트' },
  { id: 92, name: '이도현', image: '🎤', likes: 940, genre: '보컬', description: '연기와 노래를 넘나드는 신예' },
  { id: 93, name: '고윤정', image: '💃', likes: 1280, genre: '댄스', description: '비주얼 여신, 차세대 스타' },
  { id: 94, name: '김유정', image: '🎵', likes: 1010, genre: '보컬', description: '국민 여동생의 음악적 도전' },
  { id: 95, name: '노홍철', image: '🎤', likes: 720, genre: '힙합', description: '예능과 음악을 넘나드는 엔터테이너' },
  { id: 96, name: '유재석', image: '🎵', likes: 850, genre: '보컬', description: '국민 MC의 숨겨진 음악적 재능' },
  { id: 97, name: '이효리', image: '💃', likes: 1550, genre: '댄스', description: '영원한 퀸, 한국 팝의 전설' },
  { id: 98, name: '비', image: '💃', likes: 1330, genre: '댄스', description: '월드스타, 아시아 퍼포먼스의 원조' },
  { id: 99, name: 'G-Dragon', image: '🎤', likes: 2180, genre: '래퍼', description: 'K-POP의 왕, 패션과 음악의 아이콘' },
  { id: 100, name: 'CL', image: '🎤', likes: 1470, genre: '래퍼', description: '걸크러시의 원조, 글로벌 아티스트' },
  { id: 101, name: '선재', image: '🎤', likes: 1600, genre: '보컬', description: '드라마에서 현실로, 팬들의 로망' },
];

// 5 Votes
export const votes: Vote[] = [
  {
    id: 1,
    title: '다음 시즌 메인 보컬리스트를 선택하세요!',
    description: 'PLES 시즌2의 메인 보컬리스트를 팬 여러분이 직접 선택해주세요.',
    options: [
      { id: 1, label: '김수현', votes: 3420 },
      { id: 2, label: '이지은', votes: 2890 },
      { id: 3, label: '박서준', votes: 1560 },
    ],
    endDate: '2026-04-15',
    isActive: true,
    pointReward: 10,
  },
  {
    id: 2,
    title: '2026 봄 콘서트 장소를 투표해주세요',
    description: '올 봄 진행될 PLES 콘서트 장소를 투표로 결정합니다!',
    options: [
      { id: 1, label: '서울 올림픽홀', votes: 5230 },
      { id: 2, label: '부산 벡스코', votes: 3100 },
    ],
    endDate: '2026-03-20',
    isActive: true,
    pointReward: 10,
  },
  {
    id: 3,
    title: '팬미팅 컨셉을 골라주세요',
    description: '팬미팅의 테마를 투표해주세요! 가장 많은 표를 얻은 컨셉으로 진행됩니다.',
    options: [
      { id: 1, label: '봄날의 피크닉', votes: 4120 },
      { id: 2, label: '밤하늘 아래서', votes: 3980 },
      { id: 3, label: '시간 여행자', votes: 2310 },
    ],
    endDate: '2026-02-28',
    isActive: false,
    pointReward: 10,
  },
  {
    id: 4,
    title: '신규 앨범 타이틀곡을 선택해주세요',
    description: '아티스트의 다음 타이틀곡, 팬들이 직접 결정합니다!',
    options: [
      { id: 1, label: 'Moonlight', votes: 2150 },
      { id: 2, label: 'Bloom', votes: 1890 },
      { id: 3, label: 'Echo', votes: 1420 },
    ],
    endDate: '2026-05-01',
    isActive: true,
    pointReward: 10,
  },
  {
    id: 5,
    title: '여름 시즌 굿즈 디자인 투표',
    description: '올 여름 출시될 굿즈 디자인을 선택해주세요!',
    options: [
      { id: 1, label: '바다 컨셉', votes: 1560 },
      { id: 2, label: '레트로 컨셉', votes: 1320 },
    ],
    endDate: '2026-06-15',
    isActive: true,
    pointReward: 10,
  },
];

// 12 Artworks
export const artworks: Artwork[] = [
  { id: 1, title: '봄의 선율', artist: '김수현', image: '🖼️', category: '포스터', price: 50000, pointPrice: 45000, description: '봄을 주제로 한 한정판 아트워크 포스터', soldOut: false, stock: 50, isNew: true },
  { id: 2, title: '별빛 아래서', artist: '이지은', image: '🎨', category: '포스터', price: 65000, pointPrice: 58000, description: '밤하늘의 감성을 담은 프리미엄 포스터', soldOut: false, stock: 30 },
  { id: 3, title: '도시의 밤', artist: '박서준', image: '📸', category: '포토카드', price: 15000, pointPrice: 13000, description: '도시 야경 배경의 포토카드 세트 (8장)', soldOut: false, stock: 100 },
  { id: 4, title: '첫 만남', artist: '전소미', image: '💿', category: '앨범', price: 35000, pointPrice: 31000, description: '데뷔 기념 한정 앨범 (사인 포함)', soldOut: true, stock: 0 },
  { id: 5, title: '여름 바다', artist: '정국', image: '🖼️', category: '머천다이즈', price: 55000, pointPrice: 49000, description: '여름 시즌 스페셜 굿즈 세트', soldOut: false, stock: 20, isNew: true },
  { id: 6, title: '무대 뒤편', artist: '카리나', image: '📸', category: '포토카드', price: 12000, pointPrice: 10000, description: '비하인드 포토카드 에디션 (6장)', soldOut: false, stock: 80 },
  { id: 7, title: 'Dreaming', artist: '아이유', image: '💿', category: '앨범', price: 42000, pointPrice: 37000, description: '미니앨범 Dreaming 스페셜 에디션', soldOut: false, stock: 45 },
  { id: 8, title: '디지털 아트 #1', artist: '뷔', image: '🎨', category: '디지털', price: 25000, pointPrice: 22000, description: 'NFT 아트워크 디지털 에디션', soldOut: false, stock: 999, isNew: true },
  { id: 9, title: '콘서트 포스터', artist: '로제', image: '🖼️', category: '포스터', price: 30000, pointPrice: 27000, description: '2026 월드투어 기념 한정 포스터', soldOut: false, stock: 60 },
  { id: 10, title: '시즌 그리팅', artist: '장원영', image: '📸', category: '머천다이즈', price: 38000, pointPrice: 34000, description: '2026 시즌 그리팅 패키지', soldOut: false, stock: 35 },
  { id: 11, title: '미니 포토북', artist: '안유진', image: '📸', category: '포토카드', price: 18000, pointPrice: 16000, description: '셀프 촬영 미니 포토북', soldOut: false, stock: 70 },
  { id: 12, title: '한정 머치', artist: '민지', image: '🎨', category: '머천다이즈', price: 48000, pointPrice: 43000, description: '팬미팅 한정 머천다이즈 세트', soldOut: false, stock: 25 },
];

// 20 Videos
export const videos: Video[] = [
  { id: 1, title: 'PLES 아티스트 비하인드 EP.1', thumbnail: '🎬', duration: '4:32', pointReward: 20, watched: false },
  { id: 2, title: '세계시민 프로듀서 현장 스케치', thumbnail: '📹', duration: '5:01', pointReward: 20, watched: false },
  { id: 3, title: '아티스트 연습실 브이로그', thumbnail: '🎥', duration: '3:45', pointReward: 20, watched: false },
  { id: 4, title: '콘서트 리허설 현장', thumbnail: '🎬', duration: '4:15', pointReward: 20, watched: false },
  { id: 5, title: '팬미팅 준비 과정', thumbnail: '📹', duration: '4:50', pointReward: 20, watched: false },
  { id: 6, title: 'PLES 시즌2 예고편', thumbnail: '🎥', duration: '2:30', pointReward: 20, watched: false },
  { id: 7, title: '아티스트 인터뷰 스페셜', thumbnail: '🎬', duration: '5:00', pointReward: 20, watched: false },
  { id: 8, title: '무대 뒤 이야기', thumbnail: '📹', duration: '3:20', pointReward: 20, watched: false },
  { id: 9, title: '연습생 일상 브이로그', thumbnail: '🎥', duration: '4:40', pointReward: 20, watched: false },
  { id: 10, title: '스페셜 콜라보 영상', thumbnail: '🎬', duration: '3:55', pointReward: 20, watched: false },
  { id: 11, title: '보컬 트레이닝 비하인드', thumbnail: '📹', duration: '4:10', pointReward: 20, watched: false },
  { id: 12, title: '안무 연습 풀버전', thumbnail: '🎥', duration: '5:00', pointReward: 20, watched: false },
  { id: 13, title: '뮤직비디오 촬영 현장', thumbnail: '🎬', duration: '4:25', pointReward: 20, watched: false },
  { id: 14, title: '팬 서프라이즈 이벤트', thumbnail: '📹', duration: '3:50', pointReward: 20, watched: false },
  { id: 15, title: '아티스트 Q&A 라이브', thumbnail: '🎥', duration: '4:55', pointReward: 20, watched: false },
  { id: 16, title: '댄스 챌린지 모음', thumbnail: '🎬', duration: '3:30', pointReward: 20, watched: false },
  { id: 17, title: '녹음실 비하인드', thumbnail: '📹', duration: '4:20', pointReward: 20, watched: false },
  { id: 18, title: '시상식 비하인드', thumbnail: '🎥', duration: '3:40', pointReward: 20, watched: false },
  { id: 19, title: '해외 투어 브이로그', thumbnail: '🎬', duration: '5:00', pointReward: 20, watched: false },
  { id: 20, title: 'PLES 연말 시상식 풀영상', thumbnail: '📹', duration: '4:45', pointReward: 20, watched: false },
];

export const pointHistory: PointHistory[] = [];
