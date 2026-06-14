import { Router, type IRouter } from "express";
import { logger } from "../lib/logger";

const router: IRouter = Router();

// ─── Name maps ─────────────────────────────────────────────────────────────

const FD_TO_CANONICAL: Record<string, string> = {
  "Czechia": "Czech Republic",
  "United States": "USA",
  "Cape Verde Islands": "Cape Verde",
  "Côte d'Ivoire": "Ivory Coast",
};
function canonical(fdName: string): string {
  return FD_TO_CANONICAL[fdName] ?? fdName;
}

function sdbEventKey(home: string, away: string): string {
  return `${canonical(home)}|${canonical(away)}`;
}

const PT_NAME: Record<string, string> = {
  "Algeria": "Argélia", "Argentina": "Argentina", "Australia": "Austrália",
  "Austria": "Áustria", "Belgium": "Bélgica", "Bosnia-Herzegovina": "Bósnia-Herzegovina",
  "Brazil": "Brasil", "Canada": "Canadá", "Cape Verde Islands": "Cabo Verde",
  "Colombia": "Colômbia", "Congo DR": "Congo RD", "Croatia": "Croácia",
  "Curaçao": "Curaçao", "Czechia": "Tchéquia", "Ecuador": "Equador",
  "Egypt": "Egito", "England": "Inglaterra", "France": "França",
  "Germany": "Alemanha", "Ghana": "Gana", "Haiti": "Haiti",
  "Iran": "Irã", "Iraq": "Iraque", "Ivory Coast": "Costa do Marfim",
  "Japan": "Japão", "Jordan": "Jordânia", "Mexico": "México",
  "Morocco": "Marrocos", "Netherlands": "Países Baixos", "New Zealand": "Nova Zelândia",
  "Norway": "Noruega", "Panama": "Panamá", "Paraguay": "Paraguai",
  "Portugal": "Portugal", "Qatar": "Qatar", "Saudi Arabia": "Arábia Saudita",
  "Scotland": "Escócia", "Senegal": "Senegal", "South Africa": "África do Sul",
  "South Korea": "Coreia do Sul", "Spain": "Espanha", "Sweden": "Suécia",
  "Switzerland": "Suíça", "Tunisia": "Tunísia", "Turkey": "Turquia",
  "United States": "Estados Unidos", "Uruguay": "Uruguai", "Uzbekistan": "Uzbequistão",
};

const FLAG: Record<string, string> = {
  "Algeria": "🇩🇿", "Argentina": "🇦🇷", "Australia": "🇦🇺", "Austria": "🇦🇹",
  "Belgium": "🇧🇪", "Bosnia-Herzegovina": "🇧🇦", "Brazil": "🇧🇷", "Canada": "🇨🇦",
  "Cape Verde Islands": "🇨🇻", "Colombia": "🇨🇴", "Congo DR": "🇨🇩", "Croatia": "🇭🇷",
  "Curaçao": "🇨🇼", "Czechia": "🇨🇿", "Ecuador": "🇪🇨", "Egypt": "🇪🇬",
  "England": "🏴󠁧󠁢󠁥󠁮󠁧󠁿", "France": "🇫🇷", "Germany": "🇩🇪", "Ghana": "🇬🇭",
  "Haiti": "🇭🇹", "Iran": "🇮🇷", "Iraq": "🇮🇶", "Ivory Coast": "🇨🇮",
  "Japan": "🇯🇵", "Jordan": "🇯🇴", "Mexico": "🇲🇽", "Morocco": "🇲🇦",
  "Netherlands": "🇳🇱", "New Zealand": "🇳🇿", "Norway": "🇳🇴", "Panama": "🇵🇦",
  "Paraguay": "🇵🇾", "Portugal": "🇵🇹", "Qatar": "🇶🇦", "Saudi Arabia": "🇸🇦",
  "Scotland": "🏴󠁧󠁢󠁳󠁣󠁴󠁿", "Senegal": "🇸🇳", "South Africa": "🇿🇦",
  "South Korea": "🇰🇷", "Spain": "🇪🇸", "Sweden": "🇸🇪", "Switzerland": "🇨🇭",
  "Tunisia": "🇹🇳", "Turkey": "🇹🇷", "United States": "🇺🇸", "Uruguay": "🇺🇾",
  "Uzbekistan": "🇺🇿",
};

const STAT_PT: Record<string, string> = {
  "Shots on Goal": "Chutes a Gol",
  "Shots off Goal": "Fora do Gol",
  "Total Shots": "Total de Chutes",
  "Blocked Shots": "Chutes Bloqueados",
  "Shots insidebox": "Chutes na Área",
  "Shots outsidebox": "Chutes de Fora",
  "Ball Possession": "Posse de Bola",
  "Corner Kicks": "Escanteios",
  "Fouls": "Faltas",
  "Offsides": "Impedimentos",
  "Yellow Cards": "Cartões Amarelos",
  "Red Cards": "Cartões Vermelhos",
  "Yellow_Red Cards": "Duplo Amarelo",
  "Goal Kicks": "Cobranças de Meta",
  "Free Kicks": "Cobranças de Falta",
  "Goalkeeper Saves": "Defesas do Goleiro",
  "Throw-ins": "Arremessos Laterais",
  "Total passes": "Total de Passes",
  "Passes accurate": "Passes Certos",
  "Passes %": "Precisão de Passes",
  "expected_goals": "Gols Esperados (xG)",
};

const POSITION_PT: Record<string, string> = {
  "Goalkeeper": "GOL", "Right-Back": "LD", "Left-Back": "LE",
  "Centre-Back": "ZAG", "Right Midfield": "MD", "Left Midfield": "ME",
  "Central Midfield": "MC", "Defensive Midfield": "VOL",
  "Attacking Midfield": "MAT", "Left Wing": "PE", "Right Wing": "PD",
  "Centre-Forward": "CA", "Secondary Striker": "SS", "Forward": "AT",
};

const STAGE_PT: Record<string, string> = {
  "LAST_32": "Rodada de 32",
  "ROUND_OF_32": "Rodada de 32",
  "LAST_16": "Oitavas de Final",
  "ROUND_OF_16": "Oitavas de Final",
  "QUARTER_FINALS": "Quartas de Final",
  "SEMI_FINALS": "Semifinais",
  "THIRD_PLACE": "3º Lugar",
  "FINAL": "Final",
};

const STAGE_ORDER: Record<string, number> = {
  "LAST_32": 1, "ROUND_OF_32": 1,
  "LAST_16": 2, "ROUND_OF_16": 2,
  "QUARTER_FINALS": 3,
  "SEMI_FINALS": 4,
  "THIRD_PLACE": 5,
  "FINAL": 6,
};

// ─── Types ─────────────────────────────────────────────────────────────────

interface Match {
  id: string;
  matchNumber: number;
  group: string;
  round: string;
  date: string;
  venue: string;
  homeTeam: { name: string; flag: string; badge: string | null };
  awayTeam: { name: string; flag: string; badge: string | null };
  homeScore: number | null;
  awayScore: number | null;
  status: "PENDING" | "LIVE" | "FINISHED";
  theSportsDbId: string | null;
  thumbnail: string | null;
  minute: string | null;
  goalScorers: { home: string[]; away: string[] } | null;
  liveStats?: {
    shotsOnGoal: [number, number];
    totalShots: [number, number];
    cornerKicks: [number, number];
    yellowCards: [number, number];
  } | null;
}

interface FdMatch {
  id: number;
  utcDate: string;
  status: string;
  matchday: number;
  stage: string;
  group: string;
  venue: string;
  homeTeam: { id: number; name: string };
  awayTeam: { id: number; name: string };
  score: { fullTime: { home: number | null; away: number | null } };
}

interface SdbEvent {
  idEvent: string;
  strHomeTeam: string;
  strAwayTeam: string;
  strLeague?: string;
  intHomeScore: string | null;
  intAwayScore: string | null;
  strStatus: string;
  dateEvent: string;
  strTime: string;
  strVenue: string;
  intRound: string | number;
  strHomeTeamBadge: string | null;
  strAwayTeamBadge: string | null;
  strThumb: string | null;
  strProgress?: string | null;
  strHomeGoalDetails?: string | null;
  strAwayGoalDetails?: string | null;
}

// ─── Goal scorer helpers ────────────────────────────────────────────────────

function parseGoalScorers(details: string | null | undefined): string[] {
  if (!details) return [];
  return details
    .split(";")
    .map(s => s.trim())
    .filter(Boolean);
}

function parsePlayerNameFromGoalDetail(detail: string): string {
  return detail.trim().replace(/\s+\d+(?:\+\d+)?['′]?\s*$/, "");
}

interface SdbTimelineEntry {
  strTimeline: string;
  strTimelineDetail?: string | null;
  strHome: string;
  strPlayer: string;
  strAssist?: string | null;
  strCutout?: string | null;
  intTime: string;
  strTeam: string;
}

interface TimelineCache {
  data: SdbTimelineEntry[];
  expiresAt: number;
}
const timelineCacheMap = new Map<string, TimelineCache>();
const TIMELINE_TTL = 3_600_000;

async function fetchSdbTimeline(eventId: string, ttl = TIMELINE_TTL): Promise<SdbTimelineEntry[]> {
  const now = Date.now();
  const cached = timelineCacheMap.get(eventId);
  if (cached && now < cached.expiresAt) return cached.data;

  try {
    const res = await fetch(
      `https://www.thesportsdb.com/api/v1/json/3/lookuptimeline.php?id=${eventId}`,
      { signal: AbortSignal.timeout(5000) }
    );
    if (!res.ok) return [];
    const json = await res.json() as { timeline?: SdbTimelineEntry[] };
    const timeline = json.timeline ?? [];
    timelineCacheMap.set(eventId, { data: timeline, expiresAt: now + ttl });
    return timeline;
  } catch {
    return [];
  }
}

function goalScorersFromTimeline(timeline: SdbTimelineEntry[]): { home: string[]; away: string[] } {
  const home: string[] = [];
  const away: string[] = [];
  for (const e of timeline) {
    if (e.strTimeline !== "Goal") continue;
    if (e.strTimelineDetail === "Own Goal") continue;
    const player = e.strPlayer?.trim();
    if (!player) continue;
    const minute = e.intTime ? `${e.intTime}'` : "";
    const detail = minute ? `${player} ${minute}` : player;
    if (e.strHome === "Yes") home.push(detail);
    else away.push(detail);
  }
  return { home, away };
}

function buildTopScorersFromMatches(matches: Match[]): TopScorer[] {
  const playerMap = new Map<string, { team: string; teamFlag: string; goals: number }>();

  for (const m of matches) {
    if (!m.goalScorers) continue;
    for (const detail of m.goalScorers.home) {
      const name = parsePlayerNameFromGoalDetail(detail);
      if (!name) continue;
      const existing = playerMap.get(name);
      if (existing) existing.goals++;
      else playerMap.set(name, { team: m.homeTeam.name, teamFlag: m.homeTeam.flag, goals: 1 });
    }
    for (const detail of m.goalScorers.away) {
      const name = parsePlayerNameFromGoalDetail(detail);
      if (!name) continue;
      const existing = playerMap.get(name);
      if (existing) existing.goals++;
      else playerMap.set(name, { team: m.awayTeam.name, teamFlag: m.awayTeam.flag, goals: 1 });
    }
  }

  return [...playerMap.entries()]
    .map(([player, info]) => ({
      rank: 0,
      player,
      photo: null,
      team: info.team,
      teamFlag: info.teamFlag,
      goals: info.goals,
      assists: 0,
      appearances: 0,
    }))
    .sort((a, b) => b.goals - a.goals || a.player.localeCompare(b.player))
    .map((s, i) => ({ ...s, rank: i + 1 }));
}

interface SdbEventDetail {
  idEvent: string;
  idAPIfootball?: string | null;
  strProgress?: string | null;
  strHomeGoalDetails?: string | null;
  strAwayGoalDetails?: string | null;
}

interface LiveDetailCache {
  data: SdbEventDetail;
  expiresAt: number;
}
const liveDetailCacheMap = new Map<string, LiveDetailCache>();
const LIVE_DETAIL_TTL = 30_000;
const FINISHED_DETAIL_TTL = 3_600_000; // 1 hour — finished matches never change

async function fetchLiveEventDetail(eventId: string, ttl = LIVE_DETAIL_TTL): Promise<SdbEventDetail | null> {
  const now = Date.now();
  const cached = liveDetailCacheMap.get(eventId);
  if (cached && now < cached.expiresAt) return cached.data;

  try {
    const res = await fetch(
      `https://www.thesportsdb.com/api/v1/json/3/lookupevent.php?id=${eventId}`,
      { signal: AbortSignal.timeout(4000) }
    );
    if (!res.ok) return null;
    const json = await res.json() as { events?: SdbEventDetail[] };
    const detail = json.events?.[0] ?? null;
    if (!detail) return null;
    liveDetailCacheMap.set(eventId, { data: detail, expiresAt: now + ttl });
    return detail;
  } catch {
    return null;
  }
}

// ─── Caches ─────────────────────────────────────────────────────────────────

interface MainCache {
  data: { matches: Match[]; updatedAt: string; source: "live" | "cache" | "static" };
  expiresAt: number;
}
let mainCache: MainCache | null = null;
let staleMainCache: MainCache | null = null;
const MAIN_TTL = 55_000;
const STALE_TTL = 1_800_000; // 30 min — last good payload when live fetch fails

interface StatsCache {
  data: unknown;
  expiresAt: number;
}
const statsCacheMap = new Map<string, StatsCache>();
const STATS_TTL = 120_000;

interface StandingsCache {
  data: GroupStanding[];
  expiresAt: number;
}
let standingsCache: StandingsCache | null = null;
const STANDINGS_TTL = 120_000;

interface TopScorersCache {
  data: TopScorer[];
  expiresAt: number;
}
let topScorersCache: TopScorersCache | null = null;
const TOPSCORERS_TTL = 300_000;

interface BracketCache {
  data: BracketMatch[];
  expiresAt: number;
}
let bracketCache: BracketCache | null = null;
const BRACKET_TTL = 300_000;

// ─── Standings types ─────────────────────────────────────────────────────────

interface StandingEntry {
  team: string;
  flag: string;
  badge: string | null;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  ga: number;
  gd: number;
  pts: number;
}

interface GroupStanding {
  group: string;
  entries: StandingEntry[];
}

interface TopScorer {
  rank: number;
  player: string;
  photo: string | null;
  team: string;
  teamFlag: string;
  goals: number;
  assists: number;
  appearances: number;
}

interface BracketMatch {
  id: string;
  stage: string;
  date: string;
  homeTeam: string;
  homeFlag: string;
  awayTeam: string;
  awayFlag: string;
  homeScore: number | null;
  awayScore: number | null;
  status: "PENDING" | "LIVE" | "FINISHED";
}

// ─── Data fetching ──────────────────────────────────────────────────────────

async function mapPool<T, R>(
  items: T[],
  fn: (item: T) => Promise<R>,
  concurrency = 6
): Promise<R[]> {
  if (items.length === 0) return [];
  const results = new Array<R>(items.length);
  let cursor = 0;
  const workers = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (cursor < items.length) {
      const idx = cursor++;
      results[idx] = await fn(items[idx]);
    }
  });
  await Promise.all(workers);
  return results;
}

function persistMainCache(matches: Match[], source: "live" | "cache" | "static"): void {
  if (matches.length === 0) return;
  const now = Date.now();
  const data = { matches, updatedAt: new Date().toISOString(), source };
  mainCache = { data, expiresAt: now + MAIN_TTL };
  staleMainCache = { data, expiresAt: now + STALE_TTL };
}

function getStaleScoresResponse(): { matches: Match[]; updatedAt: string; source: "cache" } | null {
  const now = Date.now();
  if (staleMainCache && now < staleMainCache.expiresAt && staleMainCache.data.matches.length > 0) {
    return { ...staleMainCache.data, source: "cache" };
  }
  if (mainCache && mainCache.data.matches.length > 0) {
    return { ...mainCache.data, source: "cache" };
  }
  return null;
}

async function fetchFdFixtures(allStages = false): Promise<FdMatch[]> {
  const key = process.env.FOOTBALL_DATA_API_KEY ?? "";
  if (!key) throw new Error("FOOTBALL_DATA_API_KEY not set");
  const res = await fetch(
    "https://api.football-data.org/v4/competitions/WC/matches?season=2026",
    { headers: { "X-Auth-Token": key }, signal: AbortSignal.timeout(8000) }
  );
  if (!res.ok) throw new Error(`FD HTTP ${res.status}`);
  const json = await res.json() as { matches?: FdMatch[] };
  if (allStages) return json.matches ?? [];
  return (json.matches ?? []).filter(m => m.stage === "GROUP_STAGE");
}

async function fetchFdFixturesSafe(allStages = false): Promise<FdMatch[] | null> {
  try {
    const matches = await fetchFdFixtures(allStages);
    return matches.length > 0 ? matches : null;
  } catch (err) {
    logger.warn({ err }, "FD fixtures fetch failed");
    return null;
  }
}

async function fetchSdbScores(): Promise<Map<string, SdbEvent>> {
  const res = await fetch(
    "https://www.thesportsdb.com/api/v1/json/3/eventsseason.php?id=4429&s=2026",
    { signal: AbortSignal.timeout(6000) }
  );
  if (!res.ok) throw new Error(`SDB HTTP ${res.status}`);
  const json = await res.json() as { events?: SdbEvent[] };
  const map = new Map<string, SdbEvent>();
  for (const ev of (json.events ?? [])) {
    if (ev.strHomeTeam && ev.strAwayTeam) {
      map.set(sdbEventKey(ev.strHomeTeam, ev.strAwayTeam), ev);
    }
  }
  return map;
}

async function fetchSdbScoresSafe(): Promise<Map<string, SdbEvent>> {
  try {
    return await fetchSdbScores();
  } catch (err) {
    logger.warn({ err }, "SDB season fetch failed");
    return new Map();
  }
}

async function enrichSdbMapSafe(map: Map<string, SdbEvent>, fdMatches: FdMatch[]): Promise<void> {
  try {
    const fixtureDates = fdMatches.map(m => (m.utcDate ?? "").slice(0, 10));
    await supplementSdbMap(map, fixtureDates);
    await resolveMissingSdbEvents(map, fdMatches);
  } catch (err) {
    logger.warn({ err }, "SDB map enrichment failed — continuing with partial data");
  }
}

/** Season bulk feed is often incomplete — merge per-day World Cup events. */
async function supplementSdbMap(map: Map<string, SdbEvent>, dates: string[]): Promise<void> {
  const now = new Date();
  const from = new Date(now);
  from.setDate(from.getDate() - 14);
  const to = new Date(now);
  to.setDate(to.getDate() + 7);

  const unique = [...new Set(dates.filter(d => {
    const t = new Date(d).getTime();
    return t >= from.getTime() && t <= to.getTime();
  }))];
  if (unique.length === 0) return;

  const batchSize = 6;
  for (let i = 0; i < unique.length; i += batchSize) {
    const batch = unique.slice(i, i + batchSize);
    const results = await Promise.all(
      batch.map(async (date) => {
        try {
          const r = await fetch(
            `https://www.thesportsdb.com/api/v1/json/3/eventsday.php?d=${date}&s=Soccer`,
            { signal: AbortSignal.timeout(5000) }
          );
          if (!r.ok) return [] as SdbEvent[];
          const j = await r.json() as { events?: SdbEvent[] };
          return (j.events ?? []).filter(
            ev => ev.strLeague === "FIFA World Cup" || (ev as { idLeague?: string }).idLeague === "4429"
          );
        } catch {
          return [] as SdbEvent[];
        }
      })
    );
    for (const events of results) {
      for (const ev of events) {
        if (!ev.strHomeTeam || !ev.strAwayTeam) continue;
        const key = sdbEventKey(ev.strHomeTeam, ev.strAwayTeam);
        if (!map.has(key)) map.set(key, ev);
      }
    }
  }
}

async function searchSdbEvent(homeEn: string, awayEn: string): Promise<SdbEvent | null> {
  const query = `${canonical(homeEn)}_vs_${canonical(awayEn)}`;
  try {
    const r = await fetch(
      `https://www.thesportsdb.com/api/v1/json/3/searchevents.php?e=${encodeURIComponent(query)}`,
      { signal: AbortSignal.timeout(4000) }
    );
    if (!r.ok) return null;
    const j = await r.json() as { event?: SdbEvent[] };
    const ev = (j.event ?? []).find(e => e.strLeague === "FIFA World Cup" || (e as { idLeague?: string }).idLeague === "4429");
    return ev ?? null;
  } catch {
    return null;
  }
}

/** Resolve SDB events missing from season/day feeds via per-match search. */
async function resolveMissingSdbEvents(map: Map<string, SdbEvent>, fdMatches: FdMatch[]): Promise<void> {
  const now = Date.now();
  const needsSearch = fdMatches.filter(m => {
    const key = sdbEventKey(m.homeTeam.name ?? "", m.awayTeam.name ?? "");
    if (map.has(key)) return false;
    const t = new Date(m.utcDate ?? 0).getTime();
    return Math.abs(t - now) <= 10 * 24 * 60 * 60 * 1000;
  }).slice(0, 16);
  if (needsSearch.length === 0) return;

  const batchSize = 8;
  for (let i = 0; i < needsSearch.length; i += batchSize) {
    const batch = needsSearch.slice(i, i + batchSize);
    const found = await Promise.all(
      batch.map(async m => {
        const home = m.homeTeam.name ?? "";
        const away = m.awayTeam.name ?? "";
        const ev = await searchSdbEvent(home, away);
        return ev ? { key: sdbEventKey(home, away), ev } : null;
      })
    );
    for (const item of found) {
      if (item && !map.has(item.key)) map.set(item.key, item.ev);
    }
  }
}

function parseScore(val: string | number | null | undefined): number | null {
  if (val == null || val === "") return null;
  const n = typeof val === "number" ? val : parseInt(String(val), 10);
  return Number.isNaN(n) ? null : n;
}

function toStatus(
  fdStatus: string,
  utcDate: string,
  sdbStatus?: string,
  hasScore = false
): "PENDING" | "LIVE" | "FINISHED" {
  const liveSdb = new Set(["1H", "2H", "HT", "ET", "BT", "P", "LIVE", "INT"]);
  if (sdbStatus === "FT" || sdbStatus === "AET" || sdbStatus === "PEN") return "FINISHED";
  if (liveSdb.has(sdbStatus ?? "")) return "LIVE";
  if (fdStatus === "FINISHED") return "FINISHED";
  if (fdStatus === "IN_PLAY" || fdStatus === "PAUSED" || fdStatus === "SUSPENDED") return "LIVE";

  const diffMins = (Date.now() - new Date(utcDate).getTime()) / 60000;
  if (diffMins < -10) return "PENDING";

  if (fdStatus === "TIMED" || fdStatus === "SCHEDULED") {
    if (diffMins >= 0 && diffMins < 130) return "LIVE";
    if (diffMins >= 130 && hasScore) return "FINISHED";
    return "PENDING";
  }

  if (diffMins < 130) return "LIVE";
  return hasScore ? "FINISHED" : "PENDING";
}

function extractMinute(sdbEv: SdbEvent | undefined, detail: SdbEventDetail | null): string | null {
  const progress = detail?.strProgress ?? sdbEv?.strProgress;
  if (progress && progress.trim()) return progress.trim();
  const status = sdbEv?.strStatus ?? "";
  if (/^\d+['′]?$/.test(status.trim())) return status.trim().endsWith("'") ? status.trim() : `${status.trim()}'`;
  if (status === "HT") return "HT";
  if (status === "ET") return "ET";
  return null;
}

async function fetchSdbStatsOnly(sdbId: string): Promise<Match["liveStats"]> {
  try {
    const r = await fetch(
      `https://www.thesportsdb.com/api/v1/json/3/lookupeventstats.php?id=${sdbId}`,
      { signal: AbortSignal.timeout(5000) }
    );
    if (!r.ok) return null;
    const json = await r.json() as {
      eventstats?: Array<{ strStat: string; intHome: string; intAway: string }>
    };
    const stats = json.eventstats ?? [];
    const getVal = (statName: string): number => {
      const s = stats.find(x => x.strStat === statName);
      return (parseInt(s?.intHome ?? "0", 10) || 0) - (parseInt(s?.intAway ?? "0", 10) || 0);
      // Note: TheSportsDB returns per-team values, but we need both
      // Actually let me parse both separately
    };
    // Parse each separately
    const getHome = (statName: string) => {
      const s = stats.find(x => x.strStat === statName);
      return parseInt(s?.intHome ?? "0", 10) || 0;
    };
    const getAway = (statName: string) => {
      const s = stats.find(x => x.strStat === statName);
      return parseInt(s?.intAway ?? "0", 10) || 0;
    };

    return {
      shotsOnGoal: [getHome("Shots on Goal"), getAway("Shots on Goal")],
      totalShots: [getHome("Total Shots"), getAway("Total Shots")],
      cornerKicks: [getHome("Corner Kicks"), getAway("Corner Kicks")],
      yellowCards: [getHome("Yellow Cards"), getAway("Yellow Cards")],
    };
  } catch {
    return null;
  }
}

async function fetchLiveStatsOnly(afId: string, afKey: string): Promise<Match["liveStats"]> {
  try {
    const r = await fetch(
      `https://v3.football.api-sports.io/fixtures/statistics?fixture=${afId}`,
      { headers: { "x-apisports-key": afKey }, signal: AbortSignal.timeout(5000) }
    );
    if (!r.ok) return null;
    const json = await r.json() as { response?: Array<{ team: { id: number }; statistics: Array<{ type: string; value: string | number | null }> }> };
    const home = json.response?.[0];
    const away = json.response?.[1];
    if (!home || !away) return null;

    const getVal = (stats: Array<{ type: string; value: string | number | null }>, type: string): number => {
      const v = stats.find(s => s.type === type)?.value ?? null;
      if (v === null) return 0;
      if (typeof v === "number") return v;
      return parseInt(v.replace("%", "").trim(), 10) || 0;
    };

    return {
      shotsOnGoal: [
        getVal(home.statistics, "Shots on Goal"),
        getVal(away.statistics, "Shots on Goal"),
      ],
      totalShots: [
        getVal(home.statistics, "Total Shots"),
        getVal(away.statistics, "Total Shots"),
      ],
      cornerKicks: [
        getVal(home.statistics, "Corner Kicks"),
        getVal(away.statistics, "Corner Kicks"),
      ],
      yellowCards: [
        getVal(home.statistics, "Yellow Cards"),
        getVal(away.statistics, "Yellow Cards"),
      ],
    };
  } catch {
    return null;
  }
}

async function mergeStats(
  sdbId: string,
  afId: string | null,
  afKey: string
): Promise<Match["liveStats"]> {
  // Fetch from both sources in parallel
  const [sdbStats, afStats] = await Promise.all([
    fetchSdbStatsOnly(sdbId),
    afId ? fetchLiveStatsOnly(afId, afKey) : Promise.resolve(null),
  ]);

  // If neither has data, return null
  if (!sdbStats && !afStats) return null;

  // Prefer SDB for shots-on-goal (more reliable), fallback to api-sports
  // Prefer api-sports for corners and yellow cards (if available)
  const sdb = sdbStats || { shotsOnGoal: [0, 0], totalShots: [0, 0], cornerKicks: [0, 0], yellowCards: [0, 0] };
  const af = afStats || { shotsOnGoal: [0, 0], totalShots: [0, 0], cornerKicks: [0, 0], yellowCards: [0, 0] };

  return {
    shotsOnGoal: sdbStats ? sdb.shotsOnGoal : af.shotsOnGoal,
    totalShots: sdbStats ? sdb.totalShots : af.totalShots,
    cornerKicks: afStats ? af.cornerKicks : sdb.cornerKicks,
    yellowCards: afStats ? af.yellowCards : sdb.yellowCards,
  };
}

async function buildAllMatches(): Promise<{ matches: Match[]; source: "live" | "cache" | "static" }> {
  const stale = getStaleScoresResponse();
  try {
    const [fdMatches, sdbMap] = await Promise.all([
      fetchFdFixturesSafe(),
      fetchSdbScoresSafe(),
    ]);

    if (!fdMatches || fdMatches.length === 0) {
      const sdbOnly = await buildSdbOnlyMatches(sdbMap);
      if (sdbOnly.length > 0) return { matches: sdbOnly, source: "live" };
      if (stale) return { matches: stale.matches, source: "cache" };
      return { matches: [], source: "static" };
    }

    await enrichSdbMapSafe(sdbMap, fdMatches);

    const initialMatches = fdMatches.map((fdm, idx) => {
      const homeEn = fdm.homeTeam.name ?? "";
      const awayEn = fdm.awayTeam.name ?? "";
      const sdbEv = sdbMap.get(sdbEventKey(homeEn, awayEn));

      const sdbHs = parseScore(sdbEv?.intHomeScore);
      const sdbAs = parseScore(sdbEv?.intAwayScore);
      const fdHs = fdm.score?.fullTime?.home ?? null;
      const fdAs = fdm.score?.fullTime?.away ?? null;
      const rawHs = sdbHs ?? fdHs;
      const rawAs = sdbAs ?? fdAs;
      const hasScore = rawHs !== null && rawAs !== null;
      const status = toStatus(fdm.status ?? "", fdm.utcDate ?? "", sdbEv?.strStatus, hasScore);

      return {
        idx,
        fdm,
        sdbEv,
        homeEn,
        awayEn,
        rawHs,
        rawAs,
        status,
        theSportsDbId: sdbEv?.idEvent ?? null,
      };
    });

    const liveMatches = initialMatches.filter(m => m.status === "LIVE" && m.theSportsDbId);
    const statsMatches = initialMatches.filter(m => (m.status === "LIVE" || m.status === "FINISHED") && m.theSportsDbId);
    // Finished/live matches without goal scorer strings in the bulk season feed —
    // enrich via lookupevent (minute/progress) and lookuptimeline (goals).
    const matchesNeedingGoalEnrichment = initialMatches.filter(m =>
      (m.status === "FINISHED" || m.status === "LIVE") &&
      m.theSportsDbId &&
      (!m.sdbEv?.strHomeGoalDetails && !m.sdbEv?.strAwayGoalDetails)
    );
    const finishedMissingScorers = matchesNeedingGoalEnrichment.filter(m => m.status === "FINISHED");
    const liveDetails = new Map<string, SdbEventDetail | null>();
    const timelineGoalsMap = new Map<string, { home: string[]; away: string[] }>();
    const liveStatsMap = new Map<string, Match["liveStats"]>();

    try {
      const [liveDetailResults, finishedDetailResults, timelineResults] = await Promise.all([
        liveMatches.length > 0
          ? mapPool(liveMatches, async m => ({
              id: m.theSportsDbId!,
              detail: await fetchLiveEventDetail(m.theSportsDbId!, LIVE_DETAIL_TTL),
            }), 6)
          : Promise.resolve([] as { id: string; detail: SdbEventDetail | null }[]),
        finishedMissingScorers.length > 0
          ? mapPool(finishedMissingScorers, async m => ({
              id: m.theSportsDbId!,
              detail: await fetchLiveEventDetail(m.theSportsDbId!, FINISHED_DETAIL_TTL),
            }), 6)
          : Promise.resolve([] as { id: string; detail: SdbEventDetail | null }[]),
        matchesNeedingGoalEnrichment.length > 0
          ? mapPool(matchesNeedingGoalEnrichment, async m => ({
              id: m.theSportsDbId!,
              goals: goalScorersFromTimeline(
                await fetchSdbTimeline(m.theSportsDbId!, m.status === "LIVE" ? LIVE_DETAIL_TTL : FINISHED_DETAIL_TTL)
              ),
            }), 6)
          : Promise.resolve([] as { id: string; goals: { home: string[]; away: string[] } }[]),
      ]);

      for (const { id, detail } of liveDetailResults) liveDetails.set(id, detail);
      for (const { id, detail } of finishedDetailResults) liveDetails.set(id, detail);
      for (const { id, goals } of timelineResults) {
        if (goals.home.length > 0 || goals.away.length > 0) timelineGoalsMap.set(id, goals);
      }

      if (statsMatches.length > 0) {
        const sdbStatsResults = await mapPool(
          statsMatches,
          async m => ({ id: m.theSportsDbId!, stats: await fetchSdbStatsOnly(m.theSportsDbId!) }),
          6
        );
        for (const r of sdbStatsResults) {
          if (r.stats) liveStatsMap.set(r.id, r.stats);
        }

        const afKey = process.env.API_FOOTBALL_KEY ?? "";
        if (afKey) {
          const liveWithAf = statsMatches.filter(x => x.status === "LIVE").slice(0, 6);
          for (const m of liveWithAf) {
            try {
              const afId = await fetchSdbApiFootballId(m.theSportsDbId!);
              if (!afId) continue;
              const afStats = await fetchLiveStatsOnly(afId, afKey);
              const existing = liveStatsMap.get(m.theSportsDbId!);
              if (existing && afStats) {
                liveStatsMap.set(m.theSportsDbId!, {
                  ...existing,
                  cornerKicks: afStats.cornerKicks,
                  yellowCards: afStats.yellowCards,
                });
              }
            } catch { /* non-fatal */ }
          }
        }
      }
    } catch (err) {
      logger.warn({ err }, "Match enrichment failed — returning base scores");
    }

    const matches: Match[] = initialMatches.map(({ idx, sdbEv, homeEn, awayEn, rawHs, rawAs, status, theSportsDbId, fdm }) => {
      const detail = theSportsDbId ? (liveDetails.get(theSportsDbId) ?? null) : null;
      const goalHomeDetails = detail?.strHomeGoalDetails ?? sdbEv?.strHomeGoalDetails;
      const goalAwayDetails = detail?.strAwayGoalDetails ?? sdbEv?.strAwayGoalDetails;
      let homeGoals = parseGoalScorers(goalHomeDetails);
      let awayGoals = parseGoalScorers(goalAwayDetails);
      if (homeGoals.length === 0 && awayGoals.length === 0 && theSportsDbId) {
        const fromTimeline = timelineGoalsMap.get(theSportsDbId);
        if (fromTimeline) {
          homeGoals = fromTimeline.home;
          awayGoals = fromTimeline.away;
        }
      }
      const hasGoalData = homeGoals.length > 0 || awayGoals.length > 0;

      return {
        id: `fd-${fdm.id}`,
        matchNumber: idx + 1,
        group: (fdm.group ?? "").replace("GROUP_", ""),
        round: `Rodada ${fdm.matchday ?? 1}`,
        date: fdm.utcDate ?? "",
        venue: fdm.venue || sdbEv?.strVenue || "",
        homeTeam: { name: PT_NAME[homeEn] ?? homeEn, flag: FLAG[homeEn] ?? "🏳️", badge: sdbEv?.strHomeTeamBadge ?? null },
        awayTeam: { name: PT_NAME[awayEn] ?? awayEn, flag: FLAG[awayEn] ?? "🏳️", badge: sdbEv?.strAwayTeamBadge ?? null },
        homeScore: rawHs !== null && !isNaN(rawHs) ? rawHs : null,
        awayScore: rawAs !== null && !isNaN(rawAs) ? rawAs : null,
        status,
        theSportsDbId,
        thumbnail: sdbEv?.strThumb ?? null,
        minute: status === "LIVE" ? extractMinute(sdbEv, detail) : null,
        goalScorers: hasGoalData ? { home: homeGoals, away: awayGoals } : null,
        liveStats: (status === "LIVE" || status === "FINISHED") ? (liveStatsMap.get(theSportsDbId ?? "") ?? null) : null,
      };
    });

    return { matches, source: "live" };
  } catch (err) {
    logger.warn({ err }, "Primary fetch failed, falling back to SDB only");
    try {
      const sdbMap = await fetchSdbScores();
      const today = new Date();
      const recentDates = Array.from({ length: 14 }, (_, i) => {
        const d = new Date(today);
        d.setDate(d.getDate() - 7 + i);
        return d.toISOString().slice(0, 10);
      });
      await supplementSdbMap(sdbMap, recentDates);
      const now = new Date();
      const matchesBase: Match[] = [...sdbMap.values()].map((ev, idx) => {
        const homeEn = ev.strHomeTeam;
        const awayEn = ev.strAwayTeam;
        const hs = ev.intHomeScore != null ? parseInt(ev.intHomeScore, 10) : null;
        const as_ = ev.intAwayScore != null ? parseInt(ev.intAwayScore, 10) : null;
        const matchDate = new Date(`${ev.dateEvent}T${ev.strTime ?? "00:00:00"}Z`);
        const diffMins = (now.getTime() - matchDate.getTime()) / 60000;
        let status: "PENDING" | "LIVE" | "FINISHED" = "PENDING";
        if (ev.strStatus === "FT" || ev.strStatus === "AET") status = "FINISHED";
        else if (diffMins > 0 && diffMins < 120) status = "LIVE";
        else if (diffMins >= 120) status = "FINISHED";
        const homeGoals = parseGoalScorers(ev.strHomeGoalDetails);
        const awayGoals = parseGoalScorers(ev.strAwayGoalDetails);
        const hasGoalData = homeGoals.length > 0 || awayGoals.length > 0;
        return {
          id: ev.idEvent,
          matchNumber: idx + 1,
          group: "?",
          round: `Rodada ${ev.intRound ?? 1}`,
          date: `${ev.dateEvent}T${ev.strTime ?? "00:00:00"}Z`,
          venue: ev.strVenue ?? "",
          homeTeam: { name: PT_NAME[homeEn] ?? homeEn, flag: FLAG[homeEn] ?? "🏳️", badge: ev.strHomeTeamBadge ?? null },
          awayTeam: { name: PT_NAME[awayEn] ?? awayEn, flag: FLAG[awayEn] ?? "🏳️", badge: ev.strAwayTeamBadge ?? null },
          homeScore: hs !== null && !isNaN(hs) ? hs : null,
          awayScore: as_ !== null && !isNaN(as_) ? as_ : null,
          status,
          theSportsDbId: ev.idEvent,
          thumbnail: ev.strThumb ?? null,
          minute: status === "LIVE" ? extractMinute(ev, null) : null,
          goalScorers: hasGoalData ? { home: homeGoals, away: awayGoals } : null,
          liveStats: null,
        };
      });

      const statsMatches = matchesBase.filter(
        (m) => (m.status === "LIVE" || m.status === "FINISHED") && m.theSportsDbId
      );
      const [statsResults, fallbackTimelineResults] = await Promise.all([
        Promise.all(
          statsMatches.map(async (m) => ({
            id: m.theSportsDbId!,
            stats: await fetchSdbStatsOnly(m.theSportsDbId!),
          }))
        ),
        Promise.all(
          matchesBase
            .filter(m => (m.status === "FINISHED" || m.status === "LIVE") && m.theSportsDbId && !m.goalScorers)
            .map(async m => ({
              id: m.theSportsDbId!,
              goals: goalScorersFromTimeline(await fetchSdbTimeline(m.theSportsDbId!)),
            }))
        ),
      ]);
      const statsById = new Map(statsResults.filter((r) => r.stats).map((r) => [r.id, r.stats!]));
      const fallbackGoalsById = new Map(
        fallbackTimelineResults
          .filter(r => r.goals.home.length > 0 || r.goals.away.length > 0)
          .map(r => [r.id, r.goals])
      );

      const matches = matchesBase.map((m) => {
        const fromTimeline = m.theSportsDbId ? fallbackGoalsById.get(m.theSportsDbId) : undefined;
        const goalScorers = m.goalScorers ?? (
          fromTimeline && (fromTimeline.home.length > 0 || fromTimeline.away.length > 0)
            ? fromTimeline
            : null
        );
        return {
          ...m,
          goalScorers,
          liveStats:
            m.status === "LIVE" || m.status === "FINISHED"
              ? statsById.get(m.theSportsDbId ?? "") ?? null
              : null,
        };
      });

      return { matches, source: "live" };
    } catch (err2) {
      logger.error({ err2 }, "All fetches failed");
      return { matches: [], source: "static" };
    }
  }
}

// ─── Standings computation ──────────────────────────────────────────────────

function computeStandings(matches: Match[]): GroupStanding[] {
  const groupMap = new Map<string, Map<string, StandingEntry>>();

  for (const m of matches) {
    if (!m.group || m.group === "?") continue;
    if (!groupMap.has(m.group)) groupMap.set(m.group, new Map());
    const teams = groupMap.get(m.group)!;

    const homeKey = m.homeTeam.name;
    const awayKey = m.awayTeam.name;

    if (!teams.has(homeKey)) {
      teams.set(homeKey, { team: homeKey, flag: m.homeTeam.flag, badge: m.homeTeam.badge, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 });
    }
    if (!teams.has(awayKey)) {
      teams.set(awayKey, { team: awayKey, flag: m.awayTeam.flag, badge: m.awayTeam.badge, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 });
    }

    if (m.status === "FINISHED" && m.homeScore !== null && m.awayScore !== null) {
      const home = teams.get(homeKey)!;
      const away = teams.get(awayKey)!;
      home.played++;
      away.played++;
      home.gf += m.homeScore;
      home.ga += m.awayScore;
      away.gf += m.awayScore;
      away.ga += m.homeScore;
      home.gd = home.gf - home.ga;
      away.gd = away.gf - away.ga;

      if (m.homeScore > m.awayScore) {
        home.won++;
        home.pts += 3;
        away.lost++;
      } else if (m.homeScore < m.awayScore) {
        away.won++;
        away.pts += 3;
        home.lost++;
      } else {
        home.drawn++;
        home.pts += 1;
        away.drawn++;
        away.pts += 1;
      }
    }
  }

  const groups: GroupStanding[] = [];
  for (const [group, teamsMap] of [...groupMap.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    const entries = [...teamsMap.values()].sort((a, b) => {
      if (b.pts !== a.pts) return b.pts - a.pts;
      if (b.gd !== a.gd) return b.gd - a.gd;
      if (b.gf !== a.gf) return b.gf - a.gf;
      return a.team.localeCompare(b.team);
    });
    groups.push({ group, entries });
  }
  return groups;
}

// ─── Routes ─────────────────────────────────────────────────────────────────

router.get("/copa2026/scores", async (_req, res) => {
  const now = Date.now();
  if (mainCache && now < mainCache.expiresAt && mainCache.data.matches.length > 0) {
    res.json({ ...mainCache.data, source: "cache" });
    return;
  }
  const { matches, source } = await buildAllMatches();
  const responseData = { matches, updatedAt: new Date().toISOString(), source };
  if (matches.length > 0) {
    mainCache = { data: responseData, expiresAt: now + MAIN_TTL };
  }
  res.json(responseData);
});

router.get("/copa2026/standings", async (_req, res) => {
  const now = Date.now();
  if (standingsCache && now < standingsCache.expiresAt) {
    res.json(standingsCache.data);
    return;
  }

  let matches: Match[];
  if (mainCache && now < mainCache.expiresAt) {
    matches = mainCache.data.matches;
  } else {
    const result = await buildAllMatches();
    matches = result.matches;
    const responseData = { matches, updatedAt: new Date().toISOString(), source: result.source };
    mainCache = { data: responseData, expiresAt: now + MAIN_TTL };
  }

  const standings = computeStandings(matches);
  standingsCache = { data: standings, expiresAt: now + STANDINGS_TTL };
  res.json(standings);
});

// ─── Top-scorer helpers ──────────────────────────────────────────────────────

async function fetchSdbApiFootballId(sdbEventId: string): Promise<string | null> {
  // Reuse the live-detail cache which already stores idAPIfootball
  const detail = await fetchLiveEventDetail(sdbEventId);
  return detail?.idAPIfootball ?? null;
}

interface AfGoalEvent {
  player: { name: string };
  team: { name: string };
  detail: string; // "Normal Goal" | "Own Goal" | "Penalty" etc.
}

async function fetchGoalsFromApiSports(fixtureId: string): Promise<AfGoalEvent[]> {
  const key = process.env.API_FOOTBALL_KEY ?? "";
  if (!key) return [];
  try {
    const r = await fetch(
      `https://v3.football.api-sports.io/fixtures/events?fixture=${fixtureId}`,
      { headers: { "x-apisports-key": key }, signal: AbortSignal.timeout(6000) }
    );
    if (!r.ok) return [];
    const json = await r.json() as { response?: Array<{
      type: string; detail: string;
      player: { name: string }; team: { name: string };
    }> };
    return (json.response ?? [])
      .filter(e => e.type === "Goal" && e.detail !== "Own Goal") as AfGoalEvent[];
  } catch {
    return [];
  }
}

// Team name normaliser: api-sports uses English names, match uses PT names
const AF_TO_PT: Record<string, string> = {
  "USA": "Estados Unidos",
  "South Korea": "Coreia do Sul",
  "Czech Republic": "Tchéquia",
  "Bosnia & Herzegovina": "Bósnia-Herzegovina",
  "South Africa": "África do Sul",
  "Mexico": "México",
  "Canada": "Canadá",
  "Paraguay": "Paraguai",
};
const AF_TO_FLAG: Record<string, string> = {
  "USA": "🇺🇸", "South Korea": "🇰🇷", "Czech Republic": "🇨🇿",
  "Bosnia & Herzegovina": "🇧🇦", "South Africa": "🇿🇦", "Mexico": "🇲🇽",
  "Canada": "🇨🇦", "Paraguay": "🇵🇾",
};
function afTeamPt(name: string): string { return AF_TO_PT[name] ?? PT_NAME[name] ?? name; }
function afTeamFlag(name: string): string { return AF_TO_FLAG[name] ?? FLAG[name] ?? "🏳️"; }

async function buildTopScorersFromSdbTimelines(matches: Match[]): Promise<TopScorer[]> {
  const relevant = matches.filter(
    m => (m.status === "FINISHED" || m.status === "LIVE") && m.theSportsDbId
  );
  const timelines = await Promise.all(
    relevant.map(m => fetchSdbTimeline(m.theSportsDbId!).then(t => ({ match: m, timeline: t })))
  );

  const playerMap = new Map<string, { team: string; teamFlag: string; goals: number; assists: number; photo: string | null }>();
  for (const { timeline } of timelines) {
    for (const e of timeline) {
      if (e.strTimeline !== "Goal" || e.strTimelineDetail === "Own Goal") continue;
      const name = e.strPlayer?.trim();
      if (!name) continue;
      const team = afTeamPt(e.strTeam);
      const flag = afTeamFlag(e.strTeam);
      const photo = e.strCutout?.trim() || null;
      const assist = e.strAssist?.trim() && e.strAssist !== "0" ? e.strAssist.trim() : null;
      const existing = playerMap.get(name);
      if (existing) {
        existing.goals++;
        if (assist) existing.assists++;
        if (!existing.photo && photo) existing.photo = photo;
      } else {
        playerMap.set(name, { team, teamFlag: flag, goals: 1, assists: assist ? 1 : 0, photo });
      }
    }
  }

  return [...playerMap.entries()]
    .map(([player, info]) => ({
      rank: 0,
      player,
      photo: info.photo,
      team: info.team,
      teamFlag: info.teamFlag,
      goals: info.goals,
      assists: info.assists,
      appearances: 0,
    }))
    .sort((a, b) => b.goals - a.goals || b.assists - a.assists || a.player.localeCompare(b.player))
    .map((s, i) => ({ ...s, rank: i + 1 }));
}

router.get("/copa2026/topscorers", async (_req, res) => {
  const now = Date.now();
  if (topScorersCache && now < topScorersCache.expiresAt) {
    res.json(topScorersCache.data);
    return;
  }

  try {
    // Use warm main cache; otherwise fetch fresh
    let matches: Match[];
    if (mainCache && now < mainCache.expiresAt) {
      matches = mainCache.data.matches;
    } else {
      const result = await buildAllMatches();
      matches = result.matches;
      const responseData = { matches, updatedAt: new Date().toISOString(), source: result.source };
      mainCache = { data: responseData, expiresAt: now + MAIN_TTL };
    }

    const finishedWithSdbId = matches.filter(
      m => (m.status === "FINISHED" || m.status === "LIVE") && m.theSportsDbId
    );

    // Step 1: resolve api-sports fixture IDs from TheSportsDB in parallel
    const fixtureIdResults = await Promise.all(
      finishedWithSdbId.map(async m => ({
        match: m,
        fixtureId: await fetchSdbApiFootballId(m.theSportsDbId!),
      }))
    );

    // Step 2: fetch goal events from api-sports in parallel
    const goalResults = await Promise.all(
      fixtureIdResults
        .filter(r => r.fixtureId)
        .map(async r => ({
          match: r.match,
          goals: await fetchGoalsFromApiSports(r.fixtureId!),
        }))
    );

    // Step 3: aggregate goals per player
    const playerMap = new Map<string, { team: string; teamFlag: string; goals: number }>();

    for (const { goals } of goalResults) {
      for (const g of goals) {
        const name = g.player.name;
        if (!name) continue;
        const team = afTeamPt(g.team.name);
        const flag = afTeamFlag(g.team.name);
        const existing = playerMap.get(name);
        if (existing) {
          existing.goals++;
        } else {
          playerMap.set(name, { team, teamFlag: flag, goals: 1 });
        }
      }
    }

    const scorers: TopScorer[] = [...playerMap.entries()]
      .map(([player, info]) => ({
        rank: 0,
        player,
        photo: null,
        team: info.team,
        teamFlag: info.teamFlag,
        goals: info.goals,
        assists: 0,
        appearances: 0,
      }))
      .sort((a, b) => b.goals - a.goals || a.player.localeCompare(b.player))
      .map((s, i) => ({ ...s, rank: i + 1 }));

    const timelineScorers = await buildTopScorersFromSdbTimelines(matches);
    const finalScorers = scorers.length > 0
      ? scorers
      : timelineScorers.length > 0
        ? timelineScorers
        : buildTopScorersFromMatches(matches);

    topScorersCache = { data: finalScorers, expiresAt: now + TOPSCORERS_TTL };
    res.json(finalScorers);
  } catch (err) {
    logger.warn({ err }, "top scorers fetch failed");
    try {
      const result = await buildAllMatches();
      const timelineScorers = await buildTopScorersFromSdbTimelines(result.matches);
      res.json(timelineScorers.length > 0 ? timelineScorers : buildTopScorersFromMatches(result.matches));
    } catch {
      res.json([]);
    }
  }
});

router.get("/copa2026/bracket", async (_req, res) => {
  const now = Date.now();
  if (bracketCache && now < bracketCache.expiresAt) {
    res.json(bracketCache.data);
    return;
  }

  try {
    const allMatches = await fetchFdFixtures(true);
    const knockout = allMatches
      .filter(m => m.stage !== "GROUP_STAGE" && m.stage !== "PLAYOFF_ROUND_ONE" && m.stage !== "PRELIMINARY_ROUND")
      .map(m => {
        const homeEn = m.homeTeam?.name ?? "TBD";
        const awayEn = m.awayTeam?.name ?? "TBD";
        const stageOrder = STAGE_ORDER[m.stage] ?? 99;
        return {
          id: `fd-${m.id}`,
          stage: STAGE_PT[m.stage] ?? m.stage,
          stageOrder,
          date: m.utcDate ?? "",
          homeTeam: homeEn === "TBD" ? "A definir" : (PT_NAME[canonical(homeEn)] ?? PT_NAME[homeEn] ?? homeEn),
          homeFlag: FLAG[homeEn] ?? "🏳️",
          awayTeam: awayEn === "TBD" ? "A definir" : (PT_NAME[canonical(awayEn)] ?? PT_NAME[awayEn] ?? awayEn),
          awayFlag: FLAG[awayEn] ?? "🏳️",
          homeScore: m.score?.fullTime?.home ?? null,
          awayScore: m.score?.fullTime?.away ?? null,
          status: toStatus(m.status ?? "", m.utcDate ?? ""),
        };
      })
      .sort((a, b) => a.stageOrder - b.stageOrder || new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(({ stageOrder: _so, ...rest }) => rest) as BracketMatch[];

    bracketCache = { data: knockout, expiresAt: now + BRACKET_TTL };
    res.json(knockout);
  } catch (err) {
    logger.warn({ err }, "bracket fetch failed");
    res.json([]);
  }
});

// ─── api-sports.io helpers ───────────────────────────────────────────────────

interface AfStat { type: string; value: string | number | null }
interface AfEvent {
  time: { elapsed: number; extra: number | null };
  team: { id: number; name: string };
  player: { id: number; name: string };
  assist: { id: number | null; name: string | null } | null;
  type: string;
  detail: string;
  comments: string | null;
}

function parseStatVal(v: string | number | null): number {
  if (v === null) return 0;
  if (typeof v === "number") return v;
  return parseInt(v.replace("%", "").trim(), 10) || 0;
}

async function fetchApiSportsStats(fixtureId: string): Promise<{
  stats: Array<{ name: string; home: number; away: number }>;
  timeline: Array<{ minute: number; type: string; team: "home" | "away"; player: string; assist?: string }>;
} | null> {
  const key = process.env.API_FOOTBALL_KEY ?? "";
  if (!key) return null;

  try {
    const headers = { "x-apisports-key": key };
    const base = "https://v3.football.api-sports.io";
    const [sRes, eRes] = await Promise.all([
      fetch(`${base}/fixtures/statistics?fixture=${fixtureId}`, { headers, signal: AbortSignal.timeout(6000) }),
      fetch(`${base}/fixtures/events?fixture=${fixtureId}`, { headers, signal: AbortSignal.timeout(6000) }),
    ]);

    const sJson = await sRes.json() as { response?: Array<{ team: { id: number }; statistics: AfStat[] }> };
    const eJson = await eRes.json() as { response?: AfEvent[] };

    if (!sJson.response?.length) return null;

    const home = sJson.response[0];
    const away = sJson.response[1];
    const homeTeamId = home?.team.id;

    const statsMap = new Map<string, { home: number; away: number }>();
    for (const s of (home?.statistics ?? [])) {
      if (STAT_PT[s.type]) statsMap.set(s.type, { home: parseStatVal(s.value), away: 0 });
    }
    for (const s of (away?.statistics ?? [])) {
      if (STAT_PT[s.type]) {
        const existing = statsMap.get(s.type);
        if (existing) existing.away = parseStatVal(s.value);
        else statsMap.set(s.type, { home: 0, away: parseStatVal(s.value) });
      }
    }

    const stats = [...statsMap.entries()].map(([type, v]) => ({ name: STAT_PT[type]!, ...v }));

    const timeline = (eJson.response ?? [])
      .filter(ev => ev.type !== "subst")
      .map(ev => {
        const isHome = ev.team.id === homeTeamId;
        let type = "GOAL";
        if (ev.type === "Card") {
          if (ev.detail === "Yellow Card") type = "YELLOW";
          else if (ev.detail === "Red Card") type = "RED";
          else type = "YELLOW_RED";
        } else if (ev.type === "Var") {
          type = "VAR";
        }
        return {
          minute: ev.time.elapsed + (ev.time.extra ?? 0),
          type,
          team: (isHome ? "home" : "away") as "home" | "away",
          player: ev.player.name,
          assist: ev.assist?.name ?? undefined,
        };
      })
      .sort((a, b) => a.minute - b.minute);

    return { stats, timeline };
  } catch (err) {
    logger.warn({ err }, "api-sports fetch failed");
    return null;
  }
}

router.get("/copa2026/match/:eventId/stats", async (req, res) => {
  const { eventId } = req.params;
  const now = Date.now();

  const cached = statsCacheMap.get(eventId);
  if (cached && now < cached.expiresAt) {
    res.json(cached.data);
    return;
  }

  try {
    const [statsRes, lineupRes] = await Promise.all([
      fetch(`https://www.thesportsdb.com/api/v1/json/3/lookupeventstats.php?id=${eventId}`, {
        signal: AbortSignal.timeout(5000),
      }),
      fetch(`https://www.thesportsdb.com/api/v1/json/3/lookuplineup.php?id=${eventId}`, {
        signal: AbortSignal.timeout(5000),
      }),
    ]);

    const statsJson = await statsRes.json() as {
      eventstats?: Array<{ strStat: string; intHome: string; intAway: string; idApiFootball?: string }>;
    };
    const lineupJson = await lineupRes.json() as {
      lineup?: Array<{
        strPlayer: string; intSquadNumber: string; strPosition: string;
        strHome: string; strSubstitute: string;
      }>;
    };

    let stats = (statsJson.eventstats ?? []).map(s => ({
      name: STAT_PT[s.strStat] ?? s.strStat,
      home: parseInt(s.intHome ?? "0", 10) || 0,
      away: parseInt(s.intAway ?? "0", 10) || 0,
    }));

    let timeline: Array<{ minute: number; type: string; team: "home" | "away"; player: string; assist?: string }> = [];

    const apiFootballId = statsJson.eventstats?.[0]?.idApiFootball;
    if (apiFootballId) {
      const enriched = await fetchApiSportsStats(apiFootballId);
      if (enriched) {
        stats = enriched.stats;
        timeline = enriched.timeline;
      }
    }

    const lineup = {
      home: (lineupJson.lineup ?? [])
        .filter(p => p.strHome === "Yes")
        .map(p => ({
          name: p.strPlayer,
          number: parseInt(p.intSquadNumber ?? "0", 10) || 0,
          position: POSITION_PT[p.strPosition] ?? p.strPosition ?? "",
          isSub: p.strSubstitute === "Yes",
        }))
        .sort((a, b) => (a.isSub ? 1 : 0) - (b.isSub ? 1 : 0)),
      away: (lineupJson.lineup ?? [])
        .filter(p => p.strHome !== "Yes")
        .map(p => ({
          name: p.strPlayer,
          number: parseInt(p.intSquadNumber ?? "0", 10) || 0,
          position: POSITION_PT[p.strPosition] ?? p.strPosition ?? "",
          isSub: p.strSubstitute === "Yes",
        }))
        .sort((a, b) => (a.isSub ? 1 : 0) - (b.isSub ? 1 : 0)),
    };

    const data = { stats, lineup, timeline };
    statsCacheMap.set(eventId, { data, expiresAt: now + STATS_TTL });
    res.json(data);
  } catch (err) {
    logger.warn({ err }, "Stats fetch failed");
    res.json({ stats: [], lineup: { home: [], away: [] }, timeline: [] });
  }
});

export default router;
