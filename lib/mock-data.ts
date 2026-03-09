// Mock Data for PLES Platform

export interface Artist {
  id: number;
  name: string;
  likes: number;
  genre: string;
  description?: string;
  sns?: { instagram?: string; youtube?: string; twitter?: string };
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

// 1 Artist
export const artists: Artist[] = [
  { id: 1, name: '김수현', likes: 1523, genre: '보컬', description: '감성적인 목소리로 많은 팬을 사로잡은 보컬리스트', sns: { instagram: 'https://instagram.com/kimsoohyun' } },
];

// 1 Vote
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
];

// 1 Artwork
export const artworks: Artwork[] = [
  { id: 1, title: '봄의 선율', artist: '김수현', category: '포스터', price: 50000, pointPrice: 45000, description: '봄을 주제로 한 한정판 아트워크 포스터', soldOut: false, stock: 50, isNew: true },
];

// 1 Video
export const videos: Video[] = [
  { id: 1, title: 'PLES 아티스트 비하인드 EP.1', duration: '4:32', pointReward: 20, watched: false },
];

export const pointHistory: PointHistory[] = [];
