// Mock Data for PLES Platform

export interface Artist {
  id: number;
  name: string;
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

// 10 Artists
export const artists: Artist[] = [
  { id: 1, name: '김수현', likes: 1523, genre: '보컬', description: '감성적인 목소리로 많은 팬을 사로잡은 보컬리스트' },
  { id: 2, name: '이지은', likes: 1389, genre: '싱어송라이터', description: '작사, 작곡, 보컬까지 완벽한 올라운더 아티스트' },
  { id: 3, name: '박서준', likes: 1245, genre: '기타', description: '어쿠스틱 기타의 따뜻한 감성을 전하는 뮤지션' },
  { id: 4, name: '전소미', likes: 1102, genre: '댄스', description: '에너지 넘치는 무대 퍼포먼스의 대명사' },
  { id: 5, name: '정국', likes: 2450, genre: '보컬', description: '글로벌 팬덤을 보유한 올라운더 보컬리스트' },
  { id: 6, name: '카리나', likes: 2100, genre: '댄스', description: '비주얼과 실력을 겸비한 차세대 아이콘' },
  { id: 7, name: '임영웅', likes: 1980, genre: '트로트', description: '세대를 아우르는 국민 가수' },
  { id: 8, name: '아이유', likes: 2380, genre: '싱어송라이터', description: '대한민국 대표 솔로 아티스트' },
  { id: 9, name: '뷔', likes: 2200, genre: '보컬', description: '독보적인 음색과 감성을 가진 아티스트' },
  { id: 10, name: '장원영', likes: 2300, genre: '댄스', description: '럭키 비키의 아이콘, 글로벌 IT걸' },
];

// 2 Votes
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
];

// 4 Artworks
export const artworks: Artwork[] = [
  { id: 1, title: '봄의 선율', artist: '김수현', category: '포스터', price: 50000, pointPrice: 45000, description: '봄을 주제로 한 한정판 아트워크 포스터', soldOut: false, stock: 50, isNew: true },
  { id: 2, title: '별빛 아래서', artist: '이지은', category: '앨범', price: 35000, pointPrice: 31000, description: '밤하늘의 감성을 담은 미니앨범 스페셜 에디션', soldOut: false, stock: 30 },
  { id: 3, title: '도시의 밤', artist: '박서준', category: '포토카드', price: 15000, pointPrice: 13000, description: '도시 야경 배경의 포토카드 세트 (8장)', soldOut: false, stock: 100 },
  { id: 4, title: '여름 바다', artist: '정국', category: '머천다이즈', price: 55000, pointPrice: 49000, description: '여름 시즌 스페셜 굿즈 세트', soldOut: false, stock: 20, isNew: true },
];

// 5 Videos
export const videos: Video[] = [
  { id: 1, title: 'PLES 아티스트 비하인드 EP.1', duration: '4:32', pointReward: 20, watched: false },
  { id: 2, title: '세계시민 프로듀서 현장 스케치', duration: '5:01', pointReward: 20, watched: false },
  { id: 3, title: '아티스트 연습실 브이로그', duration: '3:45', pointReward: 20, watched: false },
  { id: 4, title: '콘서트 리허설 현장', duration: '4:15', pointReward: 20, watched: false },
  { id: 5, title: '팬미팅 준비 과정', duration: '4:50', pointReward: 20, watched: false },
];

export const pointHistory: PointHistory[] = [];
