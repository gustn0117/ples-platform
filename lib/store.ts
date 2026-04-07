// Data store for PLES Platform
// Shared data (admin-managed) syncs with server via /api/store
// User-specific data syncs with DB via /api/user-data

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
  type StarHistory,
  type Banner,
} from './mock-data';

// ============ In-memory cache for server data ============
let serverCache: Record<string, any> = {};

// ============ Current user tracking ============
let _currentUserId: string | null = null;

export function setCurrentUserId(userId: string | null) {
  _currentUserId = userId;
  if (userId) {
    // Load user data from DB
    loadUserDataFromDB(userId);
  }
}

// User data cache (loaded from DB)
let _userDataCache: Record<string, any> = {};
let _userDataLoaded = false;

async function loadUserDataFromDB(userId: string) {
  try {
    const res = await fetch(`/api/user-data?userId=${userId}`);
    if (res.ok) {
      const data = await res.json();
      _userDataCache = data;
      _userDataLoaded = true;

      // Also sync to localStorage as fallback
      if (data.watched) setItem(KEYS.USER_WATCHED, data.watched);
      if (data.voted) setItem(KEYS.USER_VOTED, data.voted);
      if (data.purchased) setItem(KEYS.USER_PURCHASED, data.purchased);
      if (data.star_sent) setItem(KEYS.USER_STAR_SENT, data.star_sent);
      if (data.star_sent_dates) setItem('ples_star_sent_dates', data.star_sent_dates);
      if (data.watch_today) setItem(KEYS.USER_WATCH_TODAY, data.watch_today);
    }
  } catch {
    // Fall back to localStorage
  }
}

function saveUserData(key: string, value: any) {
  if (!_currentUserId) return;
  _userDataCache[key] = value;

  fetch('/api/user-data', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: _currentUserId, key, value }),
    keepalive: true,
  }).catch(() => {});
}

function getUserData<T>(key: string, fallback: T): T {
  if (_userDataCache[key] !== undefined) return _userDataCache[key];
  return getItem(key, fallback);
}

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
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn(`[setItem] localStorage error for ${key}:`, e);
  }
}

function getShared<T>(cacheKey: string, localKey: string, fallback: T): T {
  if (serverCache[cacheKey] !== undefined) return serverCache[cacheKey];
  return getItem(localKey, fallback);
}

// ============ Server sync ============

function syncKeyToServer(serverKey: string, value: any) {
  fetch('/api/store', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key: serverKey, value }),
  }).catch((e) => console.error(`[syncKey] ${serverKey} error:`, e));
}

export async function syncFromServer(): Promise<void> {
  try {
    const res = await fetch('/api/store');
    if (!res.ok) return;
    const data = await res.json();
    serverCache = data;
    setItem('ples_artists', data.artists ?? defaultArtists);
    setItem('ples_votes', data.votes ?? defaultVotes);
    setItem('ples_artworks', data.artworks ?? defaultArtworks);
    setItem('ples_videos', data.videos ?? defaultVideos);
    setItem('ples_banners', data.banners ?? defaultBanners);
    setItem('ples_charge_rate', data.chargeRate ?? 1.2);
    // Notify all pages that fresh data is available
    window.dispatchEvent(new Event('ples-data-synced'));
  } catch {
    if (typeof window !== 'undefined') {
      if (!localStorage.getItem('ples_videos')) setItem('ples_videos', defaultVideos);
      if (!localStorage.getItem('ples_artists')) setItem('ples_artists', defaultArtists);
      if (!localStorage.getItem('ples_votes')) setItem('ples_votes', defaultVotes);
      if (!localStorage.getItem('ples_artworks')) setItem('ples_artworks', defaultArtworks);
      if (!localStorage.getItem('ples_banners')) setItem('ples_banners', defaultBanners);
      if (!localStorage.getItem('ples_charge_rate')) setItem('ples_charge_rate', 1.2);
    }
  }
}

// ============ Keys ============

const KEYS = {
  ARTISTS: 'ples_artists',
  VOTES: 'ples_votes',
  ARTWORKS: 'ples_artworks',
  VIDEOS: 'ples_videos',
  STAR_HISTORY: 'ples_star_history',
  USER_STARS: 'ples_user_stars',
  USER_VOTED: 'ples_user_voted',
  USER_STAR_SENT: 'ples_user_star_sent',
  USER_WATCHED: 'ples_user_watched',
  USER_PURCHASED: 'ples_user_purchased',
  USER_WATCH_TODAY: 'ples_user_watch_today',
  CHARGE_RATE: 'ples_charge_rate',
  BANNERS: 'ples_banners',
  INIT_DONE: 'ples_init_done',
};

// ============ Initialize ============

const DATA_VERSION = '10';

export function initStore() {
  if (typeof window === 'undefined') return;
  if (localStorage.getItem(KEYS.INIT_DONE) === DATA_VERSION) return;

  Object.values(KEYS).forEach((key) => localStorage.removeItem(key));
  setItem(KEYS.STAR_HISTORY, []);
  setItem(KEYS.USER_STARS, 0);
  setItem(KEYS.USER_VOTED, {});
  setItem(KEYS.USER_STAR_SENT, {});
  setItem(KEYS.USER_WATCHED, []);
  setItem(KEYS.USER_PURCHASED, []);
  setItem(KEYS.USER_WATCH_TODAY, { date: '', count: 0 });
  localStorage.setItem(KEYS.INIT_DONE, DATA_VERSION);
}

// ============ Artists ============

export function getArtists(): Artist[] {
  return getShared('artists', KEYS.ARTISTS, defaultArtists);
}

export function setArtists(artists: Artist[]) {
  serverCache.artists = artists;
  setItem(KEYS.ARTISTS, artists);
}

export function getArtist(id: number): Artist | undefined {
  return getArtists().find((a) => a.id === id);
}

// ============ Star Sending ============

function getUserStarSent(): Record<number, number> {
  return getUserData(KEYS.USER_STAR_SENT, getItem(KEYS.USER_STAR_SENT, {}));
}

function getStarSentDates(): Record<string, string> {
  return getUserData('star_sent_dates', getItem('ples_star_sent_dates', {}));
}

export function hasSentStarToday(artistId: number): boolean {
  const dates = getStarSentDates();
  const today = new Date().toISOString().slice(0, 10);
  return dates[artistId] === today;
}

export function getSupportedArtistIds(): number[] {
  const data = getUserStarSent();
  return Object.keys(data).map(Number);
}

export function getStarsSentToArtist(artistId: number): number {
  const data = getUserStarSent();
  return data[artistId] || 0;
}

function syncStarToServer(artistId: number, amount: number) {
  fetch('/api/store/like', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ artistId, delta: amount }),
    keepalive: true,
  }).catch((e) => console.error('[syncStar] error:', e));
}

export function sendStarToArtist(artistId: number, amount: 1 | 2 | 3): { success: boolean; error?: string } {
  const stars = getUserStars();
  if (stars < amount) {
    return { success: false, error: '스타가 부족합니다.' };
  }

  const artist = getArtist(artistId);
  useStars(amount, '아티스트 응원', artist?.name || '');

  const sent = getUserStarSent();
  sent[artistId] = (sent[artistId] || 0) + amount;
  setItem(KEYS.USER_STAR_SENT, sent);
  saveUserData('star_sent', sent);

  const dates = getStarSentDates();
  dates[artistId] = new Date().toISOString().slice(0, 10);
  setItem('ples_star_sent_dates', dates);
  saveUserData('star_sent_dates', dates);

  const artists = getArtists();
  const updated = artists.map((a) =>
    a.id === artistId ? { ...a, likes: a.likes + amount } : a
  );
  setArtists(updated);
  syncStarToServer(artistId, amount);

  return { success: true };
}

// ============ Votes ============

export function getVotes(): Vote[] {
  return getShared('votes', KEYS.VOTES, defaultVotes);
}

export function setVotes(votes: Vote[]) {
  serverCache.votes = votes;
  setItem(KEYS.VOTES, votes);
}

export function getUserVoted(): Record<number, { optionId: number; date: string }> {
  return getUserData(KEYS.USER_VOTED, getItem(KEYS.USER_VOTED, {}));
}

export function hasVotedToday(voteId: number): boolean {
  const voted = getUserVoted();
  if (!voted[voteId]) return false;
  const today = new Date().toISOString().slice(0, 10);
  return voted[voteId].date === today;
}

export function castVote(voteId: number, optionId: number): { success: boolean; error?: string } {
  const today = new Date().toISOString().slice(0, 10);
  const voted = getUserVoted();

  if (voted[voteId]?.date === today) {
    return { success: false, error: '오늘 이미 참여한 투표입니다. 내일 다시 투표해주세요!' };
  }

  const votes = getVotes();
  const vote = votes.find((v) => v.id === voteId);
  if (!vote) return { success: false, error: '존재하지 않는 투표입니다.' };
  if (!vote.isActive) return { success: false, error: '종료된 투표입니다.' };

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
  syncKeyToServer('votes', updated);

  voted[voteId] = { optionId, date: today };
  setItem(KEYS.USER_VOTED, voted);
  saveUserData('voted', voted);

  addStars(vote.pointReward, '투표 참여', `${vote.title}`);

  return { success: true };
}

// ============ Artworks ============

export function getArtworks(): Artwork[] {
  return getShared('artworks', KEYS.ARTWORKS, defaultArtworks);
}

export function setArtworks(artworks: Artwork[]) {
  serverCache.artworks = artworks;
  setItem(KEYS.ARTWORKS, artworks);
}

export function purchaseArtwork(
  artworkId: number,
  method: 'cash' | 'stars'
): { success: boolean; error?: string } {
  const artworks = getArtworks();
  const artwork = artworks.find((a) => a.id === artworkId);
  if (!artwork) return { success: false, error: '존재하지 않는 작품입니다.' };
  if (artwork.soldOut) return { success: false, error: '품절된 작품입니다.' };

  if (method === 'stars') {
    const stars = getUserStars();
    if (stars < artwork.pointPrice) {
      return { success: false, error: '스타가 부족합니다.' };
    }
    useStars(artwork.pointPrice, '작품 구매', artwork.title);
  }

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
  saveUserData('purchased', purchases);

  return { success: true };
}

export interface Purchase {
  artworkId: number;
  title: string;
  artist: string;
  date: string;
  method: 'cash' | 'stars' | 'points';
  amount: number;
}

export function getUserPurchases(): Purchase[] {
  return getUserData(KEYS.USER_PURCHASED, getItem(KEYS.USER_PURCHASED, []));
}

// ============ Videos ============

export function getVideos(): Video[] {
  return getShared('videos', KEYS.VIDEOS, defaultVideos);
}

export function setVideos(videos: Video[]) {
  serverCache.videos = videos;
  setItem(KEYS.VIDEOS, videos);
}

export function getUserWatched(): number[] {
  const watched: number[] = getUserData(KEYS.USER_WATCHED, getItem(KEYS.USER_WATCHED, []));
  const videoIds = new Set(getVideos().map((v) => v.id));
  return watched.filter((id) => videoIds.has(id));
}

export function getTodayWatchCount(): number {
  const data = getUserData(KEYS.USER_WATCH_TODAY, getItem(KEYS.USER_WATCH_TODAY, { date: '', count: 0 }));
  const today = new Date().toISOString().slice(0, 10);
  if (data.date !== today) return 0;
  return data.count;
}

export function watchVideo(videoId: number): { success: boolean; error?: string; stars?: number } {
  const watched = getUserWatched();
  const alreadyWatched = watched.includes(videoId);

  const today = new Date().toISOString().slice(0, 10);
  const todayData = getUserData(KEYS.USER_WATCH_TODAY, getItem(KEYS.USER_WATCH_TODAY, { date: '', count: 0 }));
  const todayCount = todayData.date === today ? todayData.count : 0;

  const videoTotal = getVideos().length;
  if (todayCount >= videoTotal) {
    return { success: false, error: '오늘 모든 미디어를 시청했습니다.' };
  }

  if (alreadyWatched) {
    return { success: true, stars: 0 };
  }

  const videos = getVideos();
  const video = videos.find((v) => v.id === videoId);
  if (!video) return { success: false, error: '존재하지 않는 영상입니다.' };

  const newWatched = [...watched, videoId];
  setItem(KEYS.USER_WATCHED, newWatched);
  saveUserData('watched', newWatched);

  const newTodayData = { date: today, count: todayCount + 1 };
  setItem(KEYS.USER_WATCH_TODAY, newTodayData);
  saveUserData('watch_today', newTodayData);

  addStars(video.pointReward, '영상 시청', video.title);

  return { success: true, stars: video.pointReward };
}

// ============ Stars ============

export function getUserStars(): number {
  if (_currentUserId && _userDataLoaded) {
    // Points are stored in users table, use session cache
    const session = typeof window !== 'undefined' ? localStorage.getItem('ples_mock_session') : null;
    if (session) {
      try {
        const parsed = JSON.parse(session);
        if (parsed.points !== undefined) return parsed.points;
      } catch {}
    }
  }
  return getItem(KEYS.USER_STARS, 0);
}

export function setUserStars(stars: number) {
  setItem(KEYS.USER_STARS, stars);
  // Update session cache
  if (typeof window !== 'undefined') {
    try {
      const session = localStorage.getItem('ples_mock_session');
      if (session) {
        const parsed = JSON.parse(session);
        parsed.points = stars;
        localStorage.setItem('ples_mock_session', JSON.stringify(parsed));
      }
    } catch {}
  }
}

export function getStarHistory(): StarHistory[] {
  return getUserData('star_history', getItem(KEYS.STAR_HISTORY, []));
}

export function addStars(amount: number, category: string, detail?: string) {
  const stars = getUserStars();
  const newBalance = stars + amount;
  setUserStars(newBalance);

  const fullCategory = detail ? `${category} - ${detail}` : category;

  const history = getStarHistory();
  const newEntry: StarHistory = {
    id: history.length > 0 ? Math.max(...history.map((h) => h.id)) + 1 : 1,
    date: new Date().toISOString().slice(0, 10),
    type: 'earn',
    category: fullCategory,
    amount,
    balance: newBalance,
  };
  const newHistory = [newEntry, ...history];
  setItem(KEYS.STAR_HISTORY, newHistory);
  saveUserData('star_history', newHistory);

  // Sync to DB
  if (_currentUserId) {
    fetch('/api/user-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: _currentUserId,
        type: 'earn',
        category: fullCategory,
        amount,
      }),
      keepalive: true,
    }).catch(() => {});
  }
}

export function useStars(amount: number, category: string, detail?: string) {
  const stars = getUserStars();
  const newBalance = stars - amount;
  setUserStars(newBalance);

  const fullCategory = detail ? `${category} - ${detail}` : category;

  const history = getStarHistory();
  const newEntry: StarHistory = {
    id: history.length > 0 ? Math.max(...history.map((h) => h.id)) + 1 : 1,
    date: new Date().toISOString().slice(0, 10),
    type: 'use',
    category: fullCategory,
    amount: -amount,
    balance: newBalance,
  };
  const newHistory = [newEntry, ...history];
  setItem(KEYS.STAR_HISTORY, newHistory);
  saveUserData('star_history', newHistory);

  if (_currentUserId) {
    fetch('/api/user-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: _currentUserId,
        type: 'use',
        category: fullCategory,
        amount: -amount,
      }),
      keepalive: true,
    }).catch(() => {});
  }
}

export function chargeStars(cashAmount: number): number {
  const rate = getChargeRate();
  const starsToAdd = Math.floor(cashAmount * rate);
  addStars(starsToAdd, '스타 충전', `${cashAmount.toLocaleString()}원`);
  return starsToAdd;
}

export function getChargeRate(): number {
  return getShared('chargeRate', KEYS.CHARGE_RATE, 1.2);
}

export function setChargeRate(rate: number) {
  serverCache.chargeRate = rate;
  setItem(KEYS.CHARGE_RATE, rate);
}

// ============ Admin helpers ============

export function adminAdjustStars(amount: number, reason: string) {
  if (amount > 0) {
    addStars(amount, '관리자 지급', reason);
  } else {
    useStars(Math.abs(amount), '관리자 차감', reason);
  }
}

// ============ Backwards compatibility aliases ============
export const getUserPoints = getUserStars;
export const getPointHistory = getStarHistory;
export const addPoints = addStars;
export const chargePoints = chargeStars;

// ============ Banners ============

export function getBanners(): Banner[] {
  return getShared('banners', KEYS.BANNERS, defaultBanners);
}

export function getActiveBanners(): Banner[] {
  return getBanners()
    .filter((b) => b.isActive)
    .sort((a, b) => a.order - b.order);
}

// ============ Reset ============

export function resetStore() {
  serverCache = {};
  Object.values(KEYS).forEach((key) => localStorage.removeItem(key));
  initStore();
}
