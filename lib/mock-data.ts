// Mock Data for PLES Platform

export interface Artist {
  id: number;
  name: string;
  image: string;
  likes: number;
  genre: string;
}

export interface Vote {
  id: number;
  title: string;
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
  price: number;
  pointPrice: number;
  description: string;
  soldOut: boolean;
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

export const artists: Artist[] = [
  { id: 1, name: '김수현', image: '🎤', likes: 1523, genre: '보컬' },
  { id: 2, name: '이지은', image: '🎵', likes: 1389, genre: '싱어송라이터' },
  { id: 3, name: '박서준', image: '🎸', likes: 1245, genre: '기타' },
  { id: 4, name: '전소미', image: '💃', likes: 1102, genre: '댄스' },
  { id: 5, name: '정국', image: '🎤', likes: 2450, genre: '보컬' },
  { id: 6, name: '카리나', image: '💃', likes: 2100, genre: '댄스' },
  { id: 7, name: '임영웅', image: '🎵', likes: 1980, genre: '트로트' },
  { id: 8, name: '아이유', image: '🎹', likes: 2380, genre: '싱어송라이터' },
  { id: 9, name: '뷔', image: '🎤', likes: 2200, genre: '보컬' },
  { id: 10, name: '윈터', image: '💃', likes: 1650, genre: '댄스' },
  { id: 11, name: '이찬혁', image: '🎸', likes: 890, genre: '밴드' },
  { id: 12, name: '로제', image: '🎵', likes: 1870, genre: '보컬' },
  { id: 13, name: '지코', image: '🎤', likes: 760, genre: '래퍼' },
  { id: 14, name: '태연', image: '🎵', likes: 1540, genre: '보컬' },
  { id: 15, name: '민호', image: '🎤', likes: 920, genre: '보컬' },
  { id: 16, name: '설윤', image: '💃', likes: 680, genre: '댄스' },
  { id: 17, name: '도영', image: '🎤', likes: 1120, genre: '보컬' },
  { id: 18, name: '하니', image: '💃', likes: 1450, genre: '댄스' },
  { id: 19, name: '이승기', image: '🎵', likes: 830, genre: '발라드' },
  { id: 20, name: '제니', image: '🎤', likes: 2050, genre: '보컬' },
];

export const votes: Vote[] = [
  {
    id: 1,
    title: '다음 시즌 메인 보컬리스트를 선택하세요!',
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
    options: [
      { id: 1, label: '봄날의 피크닉', votes: 4120 },
      { id: 2, label: '밤하늘 아래서', votes: 3980 },
      { id: 3, label: '시간 여행자', votes: 2310 },
    ],
    endDate: '2026-02-28',
    isActive: false,
    pointReward: 10,
  },
];

export const artworks: Artwork[] = [
  { id: 1, title: '봄의 선율', artist: '김수현', image: '🖼️', price: 50000, pointPrice: 45000, description: '봄을 주제로 한 한정판 아트워크', soldOut: false },
  { id: 2, title: '별빛 아래서', artist: '이지은', image: '🎨', price: 65000, pointPrice: 58000, description: '밤하늘의 감성을 담은 포토북', soldOut: false },
  { id: 3, title: '도시의 밤', artist: '박서준', image: '📸', price: 45000, pointPrice: 40000, description: '도시 야경을 담은 포토 컬렉션', soldOut: false },
  { id: 4, title: '첫 만남', artist: '전소미', image: '💿', price: 35000, pointPrice: 31000, description: '데뷔 기념 한정 앨범', soldOut: true },
  { id: 5, title: '여름 바다', artist: '정국', image: '🖼️', price: 55000, pointPrice: 49000, description: '여름 시즌 스페셜 굿즈 세트', soldOut: false },
  { id: 6, title: '무대 뒤편', artist: '카리나', image: '📸', price: 42000, pointPrice: 37000, description: '비하인드 포토북 에디션', soldOut: false },
];

export const videos: Video[] = [
  { id: 1, title: 'PLES 아티스트 비하인드 EP.1', thumbnail: '🎬', duration: '4:32', pointReward: 20, watched: false },
  { id: 2, title: '국민 프로듀서 현장 스케치', thumbnail: '📹', duration: '5:01', pointReward: 20, watched: false },
  { id: 3, title: '아티스트 연습실 브이로그', thumbnail: '🎥', duration: '3:45', pointReward: 20, watched: false },
  { id: 4, title: '콘서트 리허설 현장', thumbnail: '🎬', duration: '4:15', pointReward: 20, watched: false },
  { id: 5, title: '팬미팅 준비 과정', thumbnail: '📹', duration: '4:50', pointReward: 20, watched: false },
  { id: 6, title: 'PLES 시즌2 예고편', thumbnail: '🎥', duration: '2:30', pointReward: 20, watched: false },
  { id: 7, title: '아티스트 인터뷰 스페셜', thumbnail: '🎬', duration: '5:00', pointReward: 20, watched: false },
  { id: 8, title: '무대 뒤 이야기', thumbnail: '📹', duration: '3:20', pointReward: 20, watched: false },
  { id: 9, title: '연습생 일상 브이로그', thumbnail: '🎥', duration: '4:40', pointReward: 20, watched: false },
  { id: 10, title: '스페셜 콜라보 영상', thumbnail: '🎬', duration: '3:55', pointReward: 20, watched: false },
];

export const pointHistory: PointHistory[] = [
  { id: 1, date: '2026-03-08', type: 'earn', category: '투표 참여', amount: 10, balance: 1260 },
  { id: 2, date: '2026-03-07', type: 'earn', category: '영상 시청', amount: 20, balance: 1250 },
  { id: 3, date: '2026-03-07', type: 'use', category: '작품 구매', amount: -45000, balance: 1230 },
  { id: 4, date: '2026-03-06', type: 'earn', category: '포인트 충전', amount: 60000, balance: 46230 },
  { id: 5, date: '2026-03-06', type: 'earn', category: '영상 시청', amount: 20, balance: -13770 },
  { id: 6, date: '2026-03-05', type: 'earn', category: '투표 참여', amount: 10, balance: -13790 },
  { id: 7, date: '2026-03-04', type: 'earn', category: '영상 시청', amount: 20, balance: -13800 },
  { id: 8, date: '2026-03-03', type: 'use', category: '작품 구매', amount: -31000, balance: -13820 },
];
