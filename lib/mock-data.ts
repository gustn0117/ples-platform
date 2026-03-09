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

// 30 Artists
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
  { id: 2, title: '국민 프로듀서 현장 스케치', thumbnail: '📹', duration: '5:01', pointReward: 20, watched: false },
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
