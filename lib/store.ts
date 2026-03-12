// localStorage-based data store for PLES Platform
// All data persists in localStorage, initialized from mock-data on first load

import {
  artists as defaultArtists,
  votes as defaultVotes,
  artworks as defaultArtworks,
  videos as defaultVideos,
  banners as defaultBanners,
  type Artist,
  type Vote,
  type Artwork,
  type Video,
  type PointHistory,
  type Banner,
} from './mock-data';

// ============ Generic helpers ============

function getItem<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function setItem<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

// ============ Keys ============

const KEYS = {
  ARTISTS: 'ples_artists',
  VOTES: 'ples_votes',
  ARTWORKS: 'ples_artworks',
  VIDEOS: 'ples_videos',
  POINT_HISTORY: 'ples_point_history',
  USER_POINTS: 'ples_user_points',
  USER_VOTED: 'ples_user_voted',        // { [voteId]: optionId }
  USER_LIKED: 'ples_user_liked',        // number[] (artist ids)
  USER_WATCHED: 'ples_user_watched',    // number[] (video ids)
  USER_PURCHASED: 'ples_user_purchased', // { artworkId, date, method, amount }[]
  USER_WATCH_TODAY: 'ples_user_watch_today', // { date: string, count: number }
  CHARGE_RATE: 'ples_charge_rate',      // bonus rate (e.g., 1.2 = 20% bonus)
  BANNERS: 'ples_banners',
  INIT_DONE: 'ples_init_done',
};

// ============ Initialize ============

const DATA_VERSION = '5';

export function initStore() {
  if (typeof window === 'undefined') return;
  if (localStorage.getItem(KEYS.INIT_DONE) === DATA_VERSION) return;

  // Clear old data and re-initialize with latest mock data
  Object.values(KEYS).forEach((key) => localStorage.removeItem(key));

  setItem(KEYS.ARTISTS, defaultArtists);
  setItem(KEYS.VOTES, defaultVotes);
  setItem(KEYS.ARTWORKS, defaultArtworks);
  setItem(KEYS.VIDEOS, defaultVideos);
  setItem(KEYS.POINT_HISTORY, []);
  setItem(KEYS.USER_POINTS, 0);
  setItem(KEYS.USER_VOTED, {});
  setItem(KEYS.USER_LIKED, []);
  setItem(KEYS.USER_WATCHED, []);
  setItem(KEYS.USER_PURCHASED, []);
  setItem(KEYS.USER_WATCH_TODAY, { date: '', count: 0 });
  setItem(KEYS.CHARGE_RATE, 1.2);
  setItem(KEYS.BANNERS, defaultBanners);
  localStorage.setItem(KEYS.INIT_DONE, DATA_VERSION);
}

// ============ Artists ============

export function getArtists(): Artist[] {
  return getItem(KEYS.ARTISTS, defaultArtists);
}

export function setArtists(artists: Artist[]) {
  setItem(KEYS.ARTISTS, artists);
}

export function getArtist(id: number): Artist | undefined {
  return getArtists().find((a) => a.id === id);
}

export function addArtist(artist: Omit<Artist, 'id'>) {
  const artists = getArtists();
  const newId = artists.length > 0 ? Math.max(...artists.map((a) => a.id)) + 1 : 1;
  artists.push({ ...artist, id: newId });
  setArtists(artists);
  return newId;
}

export function updateArtist(id: number, data: Partial<Artist>) {
  const artists = getArtists().map((a) => (a.id === id ? { ...a, ...data } : a));
  setArtists(artists);
}

export function deleteArtist(id: number) {
  setArtists(getArtists().filter((a) => a.id !== id));
}

// ============ Likes ============

export function getUserLiked(): number[] {
  return getItem(KEYS.USER_LIKED, []);
}

export function toggleLike(artistId: number): boolean {
  const liked = getUserLiked();
  const artists = getArtists();
  const isLiked = liked.includes(artistId);

  if (isLiked) {
    setItem(KEYS.USER_LIKED, liked.filter((id) => id !== artistId));
    setArtists(artists.map((a) => (a.id === artistId ? { ...a, likes: Math.max(0, a.likes - 1) } : a)));
    return false;
  } else {
    setItem(KEYS.USER_LIKED, [...liked, artistId]);
    setArtists(artists.map((a) => (a.id === artistId ? { ...a, likes: a.likes + 1 } : a)));
    return true;
  }
}

// ============ Votes ============

export function getVotes(): Vote[] {
  return getItem(KEYS.VOTES, defaultVotes);
}

export function setVotes(votes: Vote[]) {
  setItem(KEYS.VOTES, votes);
}

export function addVote(vote: Omit<Vote, 'id'>) {
  const votes = getVotes();
  const newId = votes.length > 0 ? Math.max(...votes.map((v) => v.id)) + 1 : 1;
  votes.push({ ...vote, id: newId });
  setVotes(votes);
  return newId;
}

export function updateVote(id: number, data: Partial<Vote>) {
  setVotes(getVotes().map((v) => (v.id === id ? { ...v, ...data } : v)));
}

export function deleteVote(id: number) {
  setVotes(getVotes().filter((v) => v.id !== id));
}

export function getUserVoted(): Record<number, number> {
  return getItem(KEYS.USER_VOTED, {});
}

export function castVote(voteId: number, optionId: number): { success: boolean; error?: string } {
  const voted = getUserVoted();
  if (voted[voteId] !== undefined) {
    return { success: false, error: '이미 참여한 투표입니다.' };
  }

  const votes = getVotes();
  const vote = votes.find((v) => v.id === voteId);
  if (!vote) return { success: false, error: '존재하지 않는 투표입니다.' };
  if (!vote.isActive) return { success: false, error: '종료된 투표입니다.' };

  // Update option vote count
  const updated = votes.map((v) => {
    if (v.id !== voteId) return v;
    return {
      ...v,
      options: v.options.map((o) =>
        o.id === optionId ? { ...o, votes: o.votes + 1 } : o
      ),
    };
  });
  setVotes(updated);

  // Record user vote
  voted[voteId] = optionId;
  setItem(KEYS.USER_VOTED, voted);

  // Reward points
  addPoints(vote.pointReward, '투표 참여', `${vote.title}`);

  return { success: true };
}

// ============ Artworks ============

export function getArtworks(): Artwork[] {
  return getItem(KEYS.ARTWORKS, defaultArtworks);
}

export function setArtworks(artworks: Artwork[]) {
  setItem(KEYS.ARTWORKS, artworks);
}

export function addArtwork(artwork: Omit<Artwork, 'id'>) {
  const artworks = getArtworks();
  const newId = artworks.length > 0 ? Math.max(...artworks.map((a) => a.id)) + 1 : 1;
  artworks.push({ ...artwork, id: newId });
  setArtworks(artworks);
  return newId;
}

export function updateArtwork(id: number, data: Partial<Artwork>) {
  setArtworks(getArtworks().map((a) => (a.id === id ? { ...a, ...data } : a)));
}

export function deleteArtwork(id: number) {
  setArtworks(getArtworks().filter((a) => a.id !== id));
}

export function purchaseArtwork(
  artworkId: number,
  method: 'cash' | 'points'
): { success: boolean; error?: string } {
  const artworks = getArtworks();
  const artwork = artworks.find((a) => a.id === artworkId);
  if (!artwork) return { success: false, error: '존재하지 않는 작품입니다.' };
  if (artwork.soldOut) return { success: false, error: '품절된 작품입니다.' };

  if (method === 'points') {
    const points = getUserPoints();
    if (points < artwork.pointPrice) {
      return { success: false, error: '포인트가 부족합니다.' };
    }
    // Deduct points
    usePoints(artwork.pointPrice, '작품 구매', artwork.title);
  }

  // Record purchase
  const purchases = getUserPurchases();
  purchases.push({
    artworkId,
    title: artwork.title,
    artist: artwork.artist,
    date: new Date().toISOString(),
    method,
    amount: method === 'cash' ? artwork.price : artwork.pointPrice,
  });
  setItem(KEYS.USER_PURCHASED, purchases);

  return { success: true };
}

export interface Purchase {
  artworkId: number;
  title: string;
  artist: string;
  date: string;
  method: 'cash' | 'points';
  amount: number;
}

export function getUserPurchases(): Purchase[] {
  return getItem(KEYS.USER_PURCHASED, []);
}

// ============ Videos ============

export function getVideos(): Video[] {
  return getItem(KEYS.VIDEOS, defaultVideos);
}

export function setVideos(videos: Video[]) {
  setItem(KEYS.VIDEOS, videos);
}

export function addVideo(video: Omit<Video, 'id'>) {
  const videos = getVideos();
  const newId = videos.length > 0 ? Math.max(...videos.map((v) => v.id)) + 1 : 1;
  videos.push({ ...video, id: newId });
  setVideos(videos);
  return newId;
}

export function updateVideo(id: number, data: Partial<Video>) {
  setVideos(getVideos().map((v) => (v.id === id ? { ...v, ...data } : v)));
}

export function deleteVideo(id: number) {
  setVideos(getVideos().filter((v) => v.id !== id));
}

export function getUserWatched(): number[] {
  return getItem(KEYS.USER_WATCHED, []);
}

export function getTodayWatchCount(): number {
  const data = getItem(KEYS.USER_WATCH_TODAY, { date: '', count: 0 });
  const today = new Date().toISOString().slice(0, 10);
  if (data.date !== today) return 0;
  return data.count;
}

export function watchVideo(videoId: number): { success: boolean; error?: string; points?: number } {
  const watched = getUserWatched();
  const alreadyWatched = watched.includes(videoId);

  // Check daily limit
  const today = new Date().toISOString().slice(0, 10);
  const todayData = getItem(KEYS.USER_WATCH_TODAY, { date: '', count: 0 });
  const todayCount = todayData.date === today ? todayData.count : 0;

  if (todayCount >= 5) {
    return { success: false, error: '오늘 일일 시청 한도(5개)를 초과했습니다.' };
  }

  if (alreadyWatched) {
    return { success: true, points: 0 }; // Can rewatch but no additional points
  }

  const videos = getVideos();
  const video = videos.find((v) => v.id === videoId);
  if (!video) return { success: false, error: '존재하지 않는 영상입니다.' };

  // Mark as watched
  setItem(KEYS.USER_WATCHED, [...watched, videoId]);

  // Update daily count
  setItem(KEYS.USER_WATCH_TODAY, { date: today, count: todayCount + 1 });

  // Reward points
  addPoints(video.pointReward, '영상 시청', video.title);

  return { success: true, points: video.pointReward };
}

// ============ Points ============

export function getUserPoints(): number {
  return getItem(KEYS.USER_POINTS, 0);
}

export function setUserPoints(points: number) {
  setItem(KEYS.USER_POINTS, points);
}

export function getPointHistory(): PointHistory[] {
  return getItem(KEYS.POINT_HISTORY, []);
}

export function addPoints(amount: number, category: string, detail?: string) {
  const points = getUserPoints();
  const newBalance = points + amount;
  setUserPoints(newBalance);

  const history = getPointHistory();
  const newEntry: PointHistory = {
    id: history.length > 0 ? Math.max(...history.map((h) => h.id)) + 1 : 1,
    date: new Date().toISOString().slice(0, 10),
    type: 'earn',
    category: detail ? `${category} - ${detail}` : category,
    amount,
    balance: newBalance,
  };
  setItem(KEYS.POINT_HISTORY, [newEntry, ...history]);
}

export function usePoints(amount: number, category: string, detail?: string) {
  const points = getUserPoints();
  const newBalance = points - amount;
  setUserPoints(newBalance);

  const history = getPointHistory();
  const newEntry: PointHistory = {
    id: history.length > 0 ? Math.max(...history.map((h) => h.id)) + 1 : 1,
    date: new Date().toISOString().slice(0, 10),
    type: 'use',
    category: detail ? `${category} - ${detail}` : category,
    amount: -amount,
    balance: newBalance,
  };
  setItem(KEYS.POINT_HISTORY, [newEntry, ...history]);
}

export function chargePoints(cashAmount: number): number {
  const rate = getItem(KEYS.CHARGE_RATE, 1.2);
  const pointsToAdd = Math.floor(cashAmount * rate);
  addPoints(pointsToAdd, '포인트 충전', `${cashAmount.toLocaleString()}원`);
  return pointsToAdd;
}

export function getChargeRate(): number {
  return getItem(KEYS.CHARGE_RATE, 1.2);
}

export function setChargeRate(rate: number) {
  setItem(KEYS.CHARGE_RATE, rate);
}

// ============ Admin helpers ============

export function adminAdjustPoints(amount: number, reason: string) {
  if (amount > 0) {
    addPoints(amount, '관리자 지급', reason);
  } else {
    usePoints(Math.abs(amount), '관리자 차감', reason);
  }
}

// ============ Banners ============

export function getBanners(): Banner[] {
  return getItem(KEYS.BANNERS, defaultBanners);
}

export function getActiveBanners(): Banner[] {
  return getBanners()
    .filter((b) => b.isActive)
    .sort((a, b) => a.order - b.order);
}

export function setBanners(banners: Banner[]) {
  setItem(KEYS.BANNERS, banners);
}

export function addBanner(banner: Omit<Banner, 'id'>) {
  const banners = getBanners();
  const newId = banners.length > 0 ? Math.max(...banners.map((b) => b.id)) + 1 : 1;
  banners.push({ ...banner, id: newId });
  setBanners(banners);
  return newId;
}

export function updateBanner(id: number, data: Partial<Banner>) {
  setBanners(getBanners().map((b) => (b.id === id ? { ...b, ...data } : b)));
}

export function deleteBanner(id: number) {
  setBanners(getBanners().filter((b) => b.id !== id));
}

// ============ Reset (for testing) ============

export function resetStore() {
  Object.values(KEYS).forEach((key) => localStorage.removeItem(key));
  initStore();
}
