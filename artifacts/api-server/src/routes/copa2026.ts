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

const PT_TO_EN: Record<string, string> = Object.fromEntries(
  Object.entries(PT_NAME).map(([en, pt]) => [pt, en])
);

function ptToEn(name: string): string {
  if (PT_TO_EN[name]) return PT_TO_EN[name];
  if (PT_NAME[name]) return name;
  return name;
}

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
    redCards?: [number, number];
    possession?: [number, number];
    fouls?: [number, number];
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
    const json = await fetchSdbJson<{ timeline?: SdbTimelineEntry[] }>(`lookuptimeline.php?id=${eventId}`, 8000);
    if (!json) return [];
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

function mergeTopScorerLists(lists: TopScorer[][]): TopScorer[] {
  const map = new Map<string, TopScorer>();
  for (const list of lists) {
    for (const s of list) {
      const existing = map.get(s.player);
      if (!existing) {
        map.set(s.player, { ...s });
        continue;
      }
      const goals = Math.max(existing.goals, s.goals);
      const assists = Math.max(existing.assists, s.assists);
      const prefer = s.goals > existing.goals ? s : existing;
      map.set(s.player, {
        ...prefer,
        goals,
        assists,
        photo: existing.photo ?? s.photo ?? null,
      });
    }
  }
  return [...map.values()]
    .sort((a, b) => b.goals - a.goals || b.assists - a.assists || a.player.localeCompare(b.player))
    .map((s, i) => ({ ...s, rank: i + 1 }));
}

interface SdbEventDetail {
  idEvent: string;
  idAPIfootball?: string | null;
  strHomeTeam?: string | null;
  strAwayTeam?: string | null;
  dateEvent?: string | null;
  strTimestamp?: string | null;
  strProgress?: string | null;
  strHomeGoalDetails?: string | null;
  strAwayGoalDetails?: string | null;
}

interface LiveDetailCache {
  data: SdbEventDetail;
  expiresAt: number;
}
const liveDetailCacheMap = new Map<string, LiveDetailCache>();
const LIVE_DETAIL_TTL = 20_000;
const FINISHED_DETAIL_TTL = 3_600_000; // 1 hour — finished matches never change

async function fetchLiveEventDetail(eventId: string, ttl = LIVE_DETAIL_TTL): Promise<SdbEventDetail | null> {
  const now = Date.now();
  const cached = liveDetailCacheMap.get(eventId);
  if (cached && now < cached.expiresAt) return cached.data;

  try {
    const json = await fetchSdbJson<{ events?: SdbEventDetail[] }>(`lookupevent.php?id=${eventId}`, 8000);
    if (!json) return null;
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
const MAIN_TTL = 30_000;
const STALE_TTL = 1_800_000; // 30 min — last good payload when live fetch fails

interface StatsCache {
  data: unknown;
  expiresAt: number;
}
const statsCacheMap = new Map<string, StatsCache>();
const STATS_TTL = 45_000;
const STATS_EMPTY_TTL = 15_000;
const FINISHED_STATS_TTL = 3_600_000;

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
let staleTopScorersCache: TopScorersCache | null = null;
const TOPSCORERS_TTL = 300_000;
const STALE_TOPSCORERS_TTL = 1_800_000;

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

/** TheSportsDB: key 3 returns ~5 WC events; key 123 returns full 72-match season feed. */
const SDB_API_KEYS = (process.env.THESPORTSDB_API_KEYS ?? "123,3").split(",").map(k => k.trim()).filter(Boolean);
let activeSdbApiKey = SDB_API_KEYS[0] ?? "123";

function sdbApiUrl(path: string): string {
  return `https://www.thesportsdb.com/api/v1/json/${activeSdbApiKey}/${path}`;
}

async function fetchSdbJson<T>(path: string, timeoutMs = 10_000): Promise<T | null> {
  for (const apiKey of SDB_API_KEYS) {
    try {
      const res = await fetchWithRetry(
        `https://www.thesportsdb.com/api/v1/json/${apiKey}/${path}`,
        {
          signal: AbortSignal.timeout(timeoutMs),
          headers: { "User-Agent": "Mozilla/5.0 (compatible; seligaaqui.online/1.0)" },
        },
        2
      );
      if (!res.ok) continue;
      activeSdbApiKey = apiKey;
      return await res.json() as T;
    } catch (err) {
      logger.warn({ err, apiKey, path }, "SDB request failed for key");
    }
  }
  return null;
}

const ESPN_TO_CANONICAL: Record<string, string> = {
  "United States": "USA",
  "Czechia": "Czech Republic",
  "Türkiye": "Turkey",
  "Turkey": "Turkey",
  "Côte d'Ivoire": "Ivory Coast",
};

interface EspnScoreEntry {
  espnEventId: string | null;
  homeEspnTeamId: string | null;
  homeTeam: string;
  awayTeam: string;
  homeScore: number | null;
  awayScore: number | null;
  status: "PENDING" | "LIVE" | "FINISHED";
  minute: string | null;
  goalScorers: { home: string[]; away: string[] } | null;
  liveStats: Match["liveStats"] | null;
}

async function fetchWithRetry(url: string, init: RequestInit, attempts = 3): Promise<Response> {
  let lastErr: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fetch(url, init);
    } catch (err) {
      lastErr = err;
      if (i < attempts - 1) await new Promise(r => setTimeout(r, 400 * (i + 1)));
    }
  }
  throw lastErr;
}

function espnStatusToMatch(statusName: string, state?: string): "PENDING" | "LIVE" | "FINISHED" {
  const n = statusName.toUpperCase();
  if (n.includes("FULL_TIME") || n.includes("FINAL") || (n === "STATUS_POSTPONED" && state === "post")) return "FINISHED";
  if (n.includes("IN_PROGRESS") || n.includes("HALF") || n.includes("EXTRA") || n.includes("PENALT")) return "LIVE";
  if (state === "in") return "LIVE";
  if (state === "post") return "FINISHED";
  return "PENDING";
}

function goalScorersFromEspnDetails(
  details: Array<{
    type?: { text?: string };
    clock?: { displayValue?: string };
    scoringPlay?: boolean;
    ownGoal?: boolean;
    team?: { id?: string };
    athletesInvolved?: Array<{ displayName?: string }>;
  }>,
  homeTeamId: string
): { home: string[]; away: string[] } {
  const home: string[] = [];
  const away: string[] = [];
  for (const d of details) {
    if (!d.scoringPlay || d.ownGoal) continue;
    const text = d.type?.text ?? "";
    if (!/goal|penalty/i.test(text)) continue;
    const player = d.athletesInvolved?.[0]?.displayName?.trim();
    if (!player) continue;
    const minute = d.clock?.displayValue ?? "";
    const entry = minute ? `${player} ${minute}` : player;
    if (String(d.team?.id) === homeTeamId) home.push(entry);
    else away.push(entry);
  }
  return { home, away };
}

function goalScorersFromEspnKeyEvents(
  keyEvents: Array<{
    scoringPlay?: boolean;
    team?: { id?: string };
    participants?: Array<{ athlete?: { displayName?: string } }>;
    clock?: { displayValue?: string };
    type?: { text?: string };
  }>,
  homeTeamId: string
): { home: string[]; away: string[] } {
  const home: string[] = [];
  const away: string[] = [];
  for (const e of keyEvents) {
    if (!e.scoringPlay) continue;
    const type = e.type?.text ?? "";
    if (!/goal|penalty/i.test(type)) continue;
    const player = e.participants?.[0]?.athlete?.displayName?.trim();
    if (!player) continue;
    const minute = e.clock?.displayValue ?? "";
    const entry = minute ? `${player} ${minute}` : player;
    if (String(e.team?.id) === homeTeamId) home.push(entry);
    else away.push(entry);
  }
  return { home, away };
}

function mergeGoalScorers(
  ...sources: Array<{ home: string[]; away: string[] } | null | undefined>
): { home: string[]; away: string[] } {
  let best = { home: [] as string[], away: [] as string[] };
  let bestCount = 0;
  for (const src of sources) {
    if (!src) continue;
    const count = src.home.length + src.away.length;
    if (count > bestCount) {
      best = src;
      bestCount = count;
    }
  }
  return best;
}

async function fetchEspnMatchSummary(
  espnEventId: string,
  homeTeamId: string
): Promise<{ liveStats: Match["liveStats"]; goalScorers: { home: string[]; away: string[] } } | null> {
  try {
    const res = await fetchWithRetry(
      `https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/summary?event=${espnEventId}`,
      {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; seligaaqui.online/1.0)" },
        signal: AbortSignal.timeout(10_000),
      },
      2
    );
    if (!res.ok) return null;
    const json = await res.json() as {
      boxscore?: {
        teams?: Array<{
          homeAway?: string;
          statistics?: Array<{ name?: string; displayValue?: string | number }>;
        }>;
      };
      keyEvents?: Array<{
        scoringPlay?: boolean;
        team?: { id?: string };
        participants?: Array<{ athlete?: { displayName?: string } }>;
        clock?: { displayValue?: string };
        type?: { text?: string };
      }>;
    };
    const teams = json.boxscore?.teams ?? [];
    let liveStats: Match["liveStats"] = null;
    if (teams.length >= 2) {
      const home = teams.find(t => t.homeAway === "home") ?? teams[0];
      const away = teams.find(t => t.homeAway === "away") ?? teams[1];
      const getStat = (
        team: (typeof teams)[number] | undefined,
        name: string
      ): number => {
        const raw = team?.statistics?.find(s => s.name === name)?.displayValue;
        if (raw == null) return 0;
        return typeof raw === "number" ? raw : parseInt(String(raw), 10) || 0;
      };
      liveStats = {
        shotsOnGoal: [getStat(home, "shotsOnTarget"), getStat(away, "shotsOnTarget")],
        totalShots: [getStat(home, "totalShots"), getStat(away, "totalShots")],
        cornerKicks: [getStat(home, "wonCorners"), getStat(away, "wonCorners")],
        yellowCards: [getStat(home, "yellowCards"), getStat(away, "yellowCards")],
      };
    }
    const goalScorers = goalScorersFromEspnKeyEvents(json.keyEvents ?? [], homeTeamId);
    if (!liveStats && goalScorers.home.length === 0 && goalScorers.away.length === 0) return null;
    return { liveStats, goalScorers };
  } catch (err) {
    logger.warn({ err, espnEventId }, "ESPN match summary fetch failed");
    return null;
  }
}

async function enrichEspnWithStats(map: Map<string, EspnScoreEntry>): Promise<void> {
  const targets = [...map.values()].filter(
    e => e.espnEventId && e.homeEspnTeamId && (e.status === "LIVE" || e.status === "FINISHED")
  );
  if (targets.length === 0) return;
  const results = await mapPool(targets, async entry => ({
    entry,
    summary: await fetchEspnMatchSummary(entry.espnEventId!, entry.homeEspnTeamId!),
  }), 4);
  for (const { entry, summary } of results) {
    if (!summary) continue;
    if (summary.liveStats) entry.liveStats = summary.liveStats;
    const merged = mergeGoalScorers(entry.goalScorers, summary.goalScorers);
    if (merged.home.length > 0 || merged.away.length > 0) entry.goalScorers = merged;
  }
}

async function fetchEspnScoresForDates(dates: string[]): Promise<Map<string, EspnScoreEntry>> {
  const map = new Map<string, EspnScoreEntry>();
  const unique = [...new Set(dates.map(d => d.replace(/-/g, "")))];
  if (unique.length === 0) return map;

  const results = await mapPool(unique, async (yyyymmdd) => {
    try {
      const r = await fetchWithRetry(
        `https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?dates=${yyyymmdd}`,
        { headers: { "User-Agent": "seligaaqui.online/1.0" }, signal: AbortSignal.timeout(8000) },
        2
      );
      if (!r.ok) return [] as EspnScoreEntry[];
      const json = await r.json() as {
        events?: Array<{
          id?: string;
          competitions?: Array<{
            status?: { displayClock?: string; type?: { name?: string; state?: string } };
            competitors?: Array<{ homeAway?: string; score?: string; team?: { id?: string; displayName?: string } }>;
            details?: Array<{
              type?: { text?: string };
              clock?: { displayValue?: string };
              scoringPlay?: boolean;
              ownGoal?: boolean;
              team?: { id?: string };
              athletesInvolved?: Array<{ displayName?: string }>;
            }>;
          }>;
        }>;
      };
      const entries: EspnScoreEntry[] = [];
      for (const ev of json.events ?? []) {
        const comp = ev.competitions?.[0];
        if (!comp) continue;
        const homeC = comp.competitors?.find(c => c.homeAway === "home");
        const awayC = comp.competitors?.find(c => c.homeAway === "away");
        const homeRaw = homeC?.team?.displayName ?? "";
        const awayRaw = awayC?.team?.displayName ?? "";
        if (!homeRaw || !awayRaw) continue;
        const homeCanon = ESPN_TO_CANONICAL[homeRaw] ?? homeRaw;
        const awayCanon = ESPN_TO_CANONICAL[awayRaw] ?? awayRaw;
        const hs = parseScore(homeC?.score);
        const as_ = parseScore(awayC?.score);
        const status = espnStatusToMatch(comp.status?.type?.name ?? "", comp.status?.type?.state);
        const homeTeamId = String(homeC?.team?.id ?? "");
        const goalScorers = comp.details?.length
          ? goalScorersFromEspnDetails(comp.details, homeTeamId)
          : null;
        const hasGoals = goalScorers && (goalScorers.home.length > 0 || goalScorers.away.length > 0);
        entries.push({
          espnEventId: ev.id ?? null,
          homeEspnTeamId: String(homeC?.team?.id ?? ""),
          homeTeam: homeCanon,
          awayTeam: awayCanon,
          homeScore: hs,
          awayScore: as_,
          status,
          minute: status === "LIVE" ? (comp.status?.displayClock ?? null) : null,
          goalScorers: hasGoals ? goalScorers : null,
          liveStats: null,
        });
      }
      return entries;
    } catch (err) {
      logger.warn({ err, yyyymmdd }, "ESPN scoreboard fetch failed");
      return [];
    }
  }, 4);

  for (const entries of results) {
    for (const e of entries) {
      map.set(sdbEventKey(e.homeTeam, e.awayTeam), e);
    }
  }
  await enrichEspnWithStats(map);
  return map;
}

async function fetchEspnScoresSafe(dates: string[]): Promise<Map<string, EspnScoreEntry>> {
  try {
    return await fetchEspnScoresForDates(dates);
  } catch (err) {
    logger.warn({ err }, "ESPN scores fetch failed");
    return new Map();
  }
}

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
  const res = await fetchWithRetry(
    "https://api.football-data.org/v4/competitions/WC/matches?season=2026",
    { headers: { "X-Auth-Token": key }, signal: AbortSignal.timeout(10000) },
    3
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
  const json = await fetchSdbJson<{ events?: SdbEvent[] }>(
    "eventsseason.php?id=4429&s=2026",
    12_000
  );
  if (!json) throw new Error("All SDB API keys failed");
  const map = new Map<string, SdbEvent>();
  for (const ev of (json.events ?? [])) {
    if (ev.strHomeTeam && ev.strAwayTeam) {
      map.set(sdbEventKey(ev.strHomeTeam, ev.strAwayTeam), ev);
    }
  }
  if (map.size === 0) throw new Error("SDB season returned no events");
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
          const j = await fetchSdbJson<{ events?: SdbEvent[] }>(
            `eventsday.php?d=${date}&s=Soccer`,
            8000
          );
          if (!j) return [] as SdbEvent[];
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
    const j = await fetchSdbJson<{ event?: SdbEvent[] }>(
      `searchevents.php?e=${encodeURIComponent(query)}`,
      8000
    );
    if (!j) return null;
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
  }).slice(0, 28);
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

/** Resolve SDB event IDs for finished/live games — required for chutes/stats on cards. */
async function resolveSdbIdsForActiveMatches(
  rows: Array<{
    homeEn: string;
    awayEn: string;
    theSportsDbId: string | null;
    sdbEv?: SdbEvent;
    status: "PENDING" | "LIVE" | "FINISHED";
  }>,
  sdbMap: Map<string, SdbEvent>
): Promise<void> {
  const missing = rows.filter(
    m => (m.status === "LIVE" || m.status === "FINISHED") && !m.theSportsDbId
  );
  if (missing.length === 0) return;

  const found = await mapPool(missing.slice(0, 28), async m => {
    const key = sdbEventKey(m.homeEn, m.awayEn);
    const cached = sdbMap.get(key);
    if (cached) return { m, ev: cached };
    const ev = await searchSdbEvent(m.homeEn, m.awayEn);
    return ev ? { m, ev } : null;
  }, 6);

  for (const item of found) {
    if (!item) continue;
    const key = sdbEventKey(item.m.homeEn, item.m.awayEn);
    if (!sdbMap.has(key)) sdbMap.set(key, item.ev);
    item.m.theSportsDbId = item.ev.idEvent;
    item.m.sdbEv = item.ev;
  }
}

// ─── API-Football Pro (stats ao vivo) ───────────────────────────────────────

const AF_NAME_TO_CANONICAL: Record<string, string> = {
  "United States": "USA",
  "Korea Republic": "South Korea",
  "Czechia": "Czech Republic",
  "Cape Verde": "Cape Verde Islands",
  "Côte d'Ivoire": "Ivory Coast",
  "IR Iran": "Iran",
};

type LiveStats = NonNullable<Match["liveStats"]>;

function teamCanonical(name: string): string {
  return canonical(AF_NAME_TO_CANONICAL[name] ?? name);
}

function getAfConfig() {
  const leagueRaw = (process.env.API_FOOTBALL_LEAGUE_ID ?? "1").trim();
  const leagueId = leagueRaw.match(/^\d+/)?.[0] ?? "1";
  const seasonRaw = (process.env.API_FOOTBALL_SEASON ?? "2026").trim();
  const season = seasonRaw.match(/^\d+/)?.[0] ?? "2026";
  return {
    key: process.env.API_FOOTBALL_KEY ?? "",
    leagueId,
    season,
  };
}

function parseStatVal(v: string | number | null): number {
  if (v === null) return 0;
  if (typeof v === "number") return v;
  return parseInt(v.replace("%", "").trim(), 10) || 0;
}

function getAfStat(
  stats: Array<{ type: string; value: string | number | null }>,
  type: string
): number {
  return parseStatVal(stats.find(s => s.type === type)?.value ?? null);
}

function parseAfStatisticsBlocks(
  home: { statistics: Array<{ type: string; value: string | number | null }> },
  away: { statistics: Array<{ type: string; value: string | number | null }> }
): LiveStats {
  return {
    shotsOnGoal: [getAfStat(home.statistics, "Shots on Goal"), getAfStat(away.statistics, "Shots on Goal")],
    totalShots: [getAfStat(home.statistics, "Total Shots"), getAfStat(away.statistics, "Total Shots")],
    cornerKicks: [getAfStat(home.statistics, "Corner Kicks"), getAfStat(away.statistics, "Corner Kicks")],
    yellowCards: [getAfStat(home.statistics, "Yellow Cards"), getAfStat(away.statistics, "Yellow Cards")],
    redCards: [getAfStat(home.statistics, "Red Cards"), getAfStat(away.statistics, "Red Cards")],
    possession: [getAfStat(home.statistics, "Ball Possession"), getAfStat(away.statistics, "Ball Possession")],
    fouls: [getAfStat(home.statistics, "Fouls"), getAfStat(away.statistics, "Fouls")],
  };
}

function pickStatPair(af: [number, number], fallback?: [number, number]): [number, number] {
  if (af[0] > 0 || af[1] > 0) return af;
  return fallback ?? af;
}

function mergeAfLiveStats(base: LiveStats | null | undefined, af: LiveStats): LiveStats {
  if (!base) return af;
  return {
    shotsOnGoal: pickStatPair(af.shotsOnGoal, base.shotsOnGoal),
    totalShots: pickStatPair(af.totalShots, base.totalShots),
    cornerKicks: pickStatPair(af.cornerKicks, base.cornerKicks),
    yellowCards: pickStatPair(af.yellowCards, base.yellowCards),
    redCards: pickStatPair(af.redCards ?? [0, 0], base.redCards),
    possession: (af.possession?.[0] || af.possession?.[1]) ? af.possession : base.possession,
    fouls: pickStatPair(af.fouls ?? [0, 0], base.fouls),
  };
}

async function fetchAfLiveFixtureMap(
  afKey: string,
  leagueId: string,
  season: string
): Promise<Map<string, { fixtureId: string; elapsed: number | null }>> {
  const map = new Map<string, { fixtureId: string; elapsed: number | null }>();
  try {
    const r = await fetch(
      `https://v3.football.api-sports.io/fixtures?league=${leagueId}&season=${season}&live=all`,
      { headers: { "x-apisports-key": afKey }, signal: AbortSignal.timeout(8000) }
    );
    if (!r.ok) return map;
    const json = await r.json() as {
      response?: Array<{
        fixture: { id: number; status: { elapsed: number | null } };
        teams: { home: { name: string }; away: { name: string } };
      }>;
    };
    for (const row of json.response ?? []) {
      const home = teamCanonical(row.teams.home.name);
      const away = teamCanonical(row.teams.away.name);
      map.set(`${home}|${away}`, {
        fixtureId: String(row.fixture.id),
        elapsed: row.fixture.status.elapsed,
      });
    }
  } catch (err) {
    logger.warn({ err }, "API-Football live fixtures fetch failed");
  }
  return map;
}

async function fetchSdbStatsOnly(sdbId: string): Promise<Match["liveStats"]> {
  try {
    const json = await fetchSdbJson<{ eventstats?: Array<{ strStat: string; intHome: string; intAway: string }> }>(
      `lookupeventstats.php?id=${sdbId}`,
      8000
    );
    if (!json) return null;
    const stats = json.eventstats ?? [];
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
      redCards: [getHome("Red Cards"), getAway("Red Cards")],
    };
  } catch {
    return null;
  }
}

async function fetchLiveStatsOnly(afId: string, afKey: string): Promise<Match["liveStats"]> {
  try {
    const r = await fetch(
      `https://v3.football.api-sports.io/fixtures/statistics?fixture=${afId}`,
      { headers: { "x-apisports-key": afKey }, signal: AbortSignal.timeout(6000) }
    );
    if (!r.ok) return null;
    const json = await r.json() as {
      response?: Array<{ team: { id: number }; statistics: Array<{ type: string; value: string | number | null }> }>;
    };
    const home = json.response?.[0];
    const away = json.response?.[1];
    if (!home || !away) return null;
    return parseAfStatisticsBlocks(home, away);
  } catch {
    return null;
  }
}

async function enrichStatsWithApiFootball(
  statsMatches: Array<{
    theSportsDbId: string;
    homeEn: string;
    awayEn: string;
    status: Match["status"];
  }>,
  liveStatsMap: Map<string, Match["liveStats"]>
): Promise<boolean> {
  const { key, leagueId, season } = getAfConfig();
  if (!key) return false;

  let enriched = false;
  const liveFixtureMap = await fetchAfLiveFixtureMap(key, leagueId, season);

  const liveAfPairs: Array<{ sdbId: string; afId: string }> = [];
  for (const m of statsMatches.filter(x => x.status === "LIVE")) {
    const ref = liveFixtureMap.get(sdbEventKey(m.homeEn, m.awayEn));
    if (ref) liveAfPairs.push({ sdbId: m.theSportsDbId, afId: ref.fixtureId });
  }

  if (liveAfPairs.length > 0) {
    const results = await mapPool(
      liveAfPairs,
      async p => ({ ...p, stats: await fetchLiveStatsOnly(p.afId, key) }),
      6
    );
    for (const r of results) {
      if (!r.stats) continue;
      liveStatsMap.set(r.sdbId, mergeAfLiveStats(liveStatsMap.get(r.sdbId), r.stats));
      enriched = true;
    }
  }

  const finishedTargets = statsMatches.filter(m => m.status === "FINISHED").slice(0, 12);
  if (finishedTargets.length > 0) {
    const idResults = await mapPool(
      finishedTargets,
      async m => ({
        sdbId: m.theSportsDbId,
        afId: await fetchSdbApiFootballId(m.theSportsDbId),
      }),
      4
    );
    const afStatsResults = await mapPool(
      idResults.filter(r => r.afId),
      async r => ({ sdbId: r.sdbId, stats: await fetchLiveStatsOnly(r.afId!, key) }),
      4
    );
    for (const r of afStatsResults) {
      if (!r.stats) continue;
      liveStatsMap.set(r.sdbId, mergeAfLiveStats(liveStatsMap.get(r.sdbId), r.stats));
      enriched = true;
    }
  }

  return enriched || liveFixtureMap.size > 0;
}

async function buildSdbOnlyMatches(
  sdbMap: Map<string, SdbEvent>,
  espnMap: Map<string, EspnScoreEntry> = new Map()
): Promise<Match[]> {
  const today = new Date();
  const recentDates = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - 7 + i);
    return d.toISOString().slice(0, 10);
  });

  try {
    await supplementSdbMap(sdbMap, recentDates);
  } catch { /* non-fatal */ }

  const matchesBase: Match[] = [...sdbMap.values()].map((ev, idx) => {
    const homeEn = ev.strHomeTeam;
    const awayEn = ev.strAwayTeam;
    const espnEv = espnMap.get(sdbEventKey(homeEn, awayEn));
    const hs = parseScore(ev.intHomeScore) ?? espnEv?.homeScore ?? null;
    const as_ = parseScore(ev.intAwayScore) ?? espnEv?.awayScore ?? null;
    const hasScore = hs !== null && as_ !== null;
    let status = toStatus(
      ev.strStatus === "FT" || ev.strStatus === "AET" ? "FINISHED" : "TIMED",
      `${ev.dateEvent}T${ev.strTime ?? "00:00:00"}Z`,
      ev.strStatus,
      hasScore
    );
    if (espnEv && (status === "PENDING" || !hasScore)) {
      if (espnEv.status === "LIVE" || espnEv.status === "FINISHED") status = espnEv.status;
    }
    const homeGoals = parseGoalScorers(ev.strHomeGoalDetails);
    const awayGoals = parseGoalScorers(ev.strAwayGoalDetails);
    const mergedGoals = mergeGoalScorers(
      homeGoals.length > 0 || awayGoals.length > 0 ? { home: homeGoals, away: awayGoals } : null,
      espnEv?.goalScorers
    );
    const goalScorers =
      mergedGoals.home.length > 0 || mergedGoals.away.length > 0 ? mergedGoals : null;
    return {
      id: ev.idEvent,
      matchNumber: idx + 1,
      group: "?",
      round: `Rodada ${ev.intRound ?? 1}`,
      date: `${ev.dateEvent}T${ev.strTime ?? "00:00:00"}Z`,
      venue: ev.strVenue ?? "",
      homeTeam: { name: PT_NAME[homeEn] ?? homeEn, flag: FLAG[homeEn] ?? "🏳️", badge: ev.strHomeTeamBadge ?? null },
      awayTeam: { name: PT_NAME[awayEn] ?? awayEn, flag: FLAG[awayEn] ?? "🏳️", badge: ev.strAwayTeamBadge ?? null },
      homeScore: hs,
      awayScore: as_,
      status,
      theSportsDbId: ev.idEvent,
      thumbnail: ev.strThumb ?? null,
      minute: status === "LIVE" ? (espnEv?.minute ?? extractMinute(ev, null)) : null,
      goalScorers,
      liveStats: espnEv?.liveStats ?? null,
    };
  });

  const statsMatches = matchesBase.filter(
    (m) => (m.status === "LIVE" || m.status === "FINISHED") && m.theSportsDbId
  );

  try {
    const [statsResults, fallbackTimelineResults] = await Promise.all([
      mapPool(statsMatches, async m => ({
        id: m.theSportsDbId!,
        stats: await fetchSdbStatsOnly(m.theSportsDbId!),
      }), 6),
      mapPool(
        matchesBase.filter(m => (m.status === "FINISHED" || m.status === "LIVE") && m.theSportsDbId && !m.goalScorers),
        async m => ({
          id: m.theSportsDbId!,
          goals: goalScorersFromTimeline(await fetchSdbTimeline(m.theSportsDbId!)),
        }),
        6
      ),
    ]);
    const statsById = new Map(statsResults.filter(r => r.stats).map(r => [r.id, r.stats!]));
    const fallbackGoalsById = new Map(
      fallbackTimelineResults
        .filter(r => r.goals.home.length > 0 || r.goals.away.length > 0)
        .map(r => [r.id, r.goals])
    );

    return matchesBase.map(m => {
      const fromTimeline = m.theSportsDbId ? fallbackGoalsById.get(m.theSportsDbId) : undefined;
      const goalScorers = m.goalScorers ?? (
        fromTimeline && (fromTimeline.home.length > 0 || fromTimeline.away.length > 0) ? fromTimeline : null
      );
      return {
        ...m,
        goalScorers,
        liveStats: m.status === "LIVE" || m.status === "FINISHED"
          ? statsById.get(m.theSportsDbId ?? "") ?? m.liveStats ?? null
          : null,
      };
    });
  } catch (err) {
    logger.warn({ err }, "SDB-only enrichment failed");
    return matchesBase;
  }
}

async function buildAllMatches(): Promise<{
  matches: Match[];
  source: "live" | "cache" | "static";
  providers: string[];
}> {
  const stale = getStaleScoresResponse();
  try {
    const [fdMatches, sdbMap] = await Promise.all([
      fetchFdFixturesSafe(),
      fetchSdbScoresSafe(),
    ]);

    const espnDates = (() => {
      const today = new Date();
      const out: string[] = [];
      for (let i = -10; i <= 3; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() + i);
        out.push(d.toISOString().slice(0, 10));
      }
      if (fdMatches) {
        for (const m of fdMatches) {
          const d = (m.utcDate ?? "").slice(0, 10);
          if (d) out.push(d);
        }
      }
      return out;
    })();
    const espnMap = await fetchEspnScoresSafe(espnDates);
    const providers: string[] = [];
    if (fdMatches?.length) providers.push("football-data");
    if (sdbMap.size > 0) providers.push(`thesportsdb:${activeSdbApiKey}`);
    if (espnMap.size > 0) providers.push("espn");

    if (!fdMatches || fdMatches.length === 0) {
      const sdbOnly = await buildSdbOnlyMatches(sdbMap, espnMap);
      if (sdbOnly.length > 0) return { matches: sdbOnly, source: "live", providers };
      if (stale) return { matches: stale.matches, source: "cache", providers: ["cache"] };
      return { matches: [], source: "static", providers };
    }

    await enrichSdbMapSafe(sdbMap, fdMatches);

    const initialMatches = fdMatches.map((fdm, idx) => {
      const homeEn = fdm.homeTeam.name ?? "";
      const awayEn = fdm.awayTeam.name ?? "";
      const key = sdbEventKey(homeEn, awayEn);
      const sdbEv = sdbMap.get(key);
      const espnEv = espnMap.get(key);

      const sdbHs = parseScore(sdbEv?.intHomeScore);
      const sdbAs = parseScore(sdbEv?.intAwayScore);
      const fdHs = fdm.score?.fullTime?.home ?? null;
      const fdAs = fdm.score?.fullTime?.away ?? null;
      const rawHs = sdbHs ?? fdHs ?? espnEv?.homeScore ?? null;
      const rawAs = sdbAs ?? fdAs ?? espnEv?.awayScore ?? null;
      const hasScore = rawHs !== null && rawAs !== null;
      let status = toStatus(fdm.status ?? "", fdm.utcDate ?? "", sdbEv?.strStatus, hasScore);
      if (espnEv && (status === "PENDING" || !hasScore)) {
        if (espnEv.status === "LIVE" || espnEv.status === "FINISHED") status = espnEv.status;
      }

      return {
        idx,
        fdm,
        sdbEv,
        espnEv,
        homeEn,
        awayEn,
        rawHs,
        rawAs,
        status,
        theSportsDbId: sdbEv?.idEvent ?? null,
      };
    });

    await resolveSdbIdsForActiveMatches(initialMatches, sdbMap);
    if (sdbMap.size > 0 && !providers.some(p => p.startsWith("thesportsdb"))) {
      providers.push(`thesportsdb:${activeSdbApiKey}`);
    }

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

        const afUsed = await enrichStatsWithApiFootball(
          statsMatches.map(m => ({
            theSportsDbId: m.theSportsDbId!,
            homeEn: m.homeEn,
            awayEn: m.awayEn,
            status: m.status,
          })),
          liveStatsMap
        );
        if (afUsed) providers.push("api-football");
      }
    } catch (err) {
      logger.warn({ err }, "Match enrichment failed — returning base scores");
    }

    const matches: Match[] = initialMatches.map(({ idx, sdbEv, espnEv, homeEn, awayEn, rawHs, rawAs, status, theSportsDbId, fdm }) => {
      const detail = theSportsDbId ? (liveDetails.get(theSportsDbId) ?? null) : null;
      const goalHomeDetails = detail?.strHomeGoalDetails ?? sdbEv?.strHomeGoalDetails;
      const goalAwayDetails = detail?.strAwayGoalDetails ?? sdbEv?.strAwayGoalDetails;
      let homeGoals = parseGoalScorers(goalHomeDetails);
      let awayGoals = parseGoalScorers(goalAwayDetails);
      const fromTimeline = theSportsDbId ? timelineGoalsMap.get(theSportsDbId) : undefined;
      const merged = mergeGoalScorers(
        homeGoals.length > 0 || awayGoals.length > 0 ? { home: homeGoals, away: awayGoals } : null,
        fromTimeline,
        espnEv?.goalScorers
      );
      homeGoals = merged.home;
      awayGoals = merged.away;
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
        minute: status === "LIVE" ? (espnEv?.minute ?? extractMinute(sdbEv, detail)) : null,
        goalScorers: hasGoalData ? { home: homeGoals, away: awayGoals } : null,
        liveStats: (status === "LIVE" || status === "FINISHED")
          ? (liveStatsMap.get(theSportsDbId ?? "") ?? espnEv?.liveStats ?? null)
          : null,
      };
    });

    return { matches, source: "live", providers };
  } catch (err) {
    logger.warn({ err }, "Primary fetch failed, falling back to SDB + ESPN");
    try {
      const [sdbMap, espnMap] = await Promise.all([
        fetchSdbScoresSafe(),
        fetchEspnScoresSafe(
          Array.from({ length: 14 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - 10 + i);
            return d.toISOString().slice(0, 10);
          })
        ),
      ]);
      const matches = await buildSdbOnlyMatches(sdbMap, espnMap);
      if (matches.length > 0) {
        const providers = [
          `thesportsdb:${activeSdbApiKey}`,
          ...(espnMap.size > 0 ? ["espn"] : []),
        ];
        return { matches, source: "live", providers };
      }
    } catch (err2) {
      logger.error({ err2 }, "SDB+ESPN fallback failed");
    }
    if (stale) return { matches: stale.matches, source: "cache", providers: ["cache"] };
    return { matches: [], source: "static", providers: [] };
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
  const { matches, source, providers } = await buildAllMatches();
  if (matches.length > 0) {
    persistMainCache(matches, source === "cache" ? "cache" : "live");
    res.json({ matches, updatedAt: new Date().toISOString(), source, providers });
    return;
  }
  const stale = getStaleScoresResponse();
  if (stale) {
    res.json({ ...stale, providers: ["cache"] });
    return;
  }
  res.json({ matches: [], updatedAt: new Date().toISOString(), source: "static", providers: [] });
});

router.get("/copa2026/standings", async (_req, res) => {
  const now = Date.now();
  if (standingsCache && now < standingsCache.expiresAt) {
    res.json(standingsCache.data);
    return;
  }

  let matches: Match[];
  if (mainCache && now < mainCache.expiresAt && mainCache.data.matches.length > 0) {
    matches = mainCache.data.matches;
  } else {
    const result = await buildAllMatches();
    matches = result.matches;
    if (matches.length > 0) {
      persistMainCache(matches, result.source === "cache" ? "cache" : "live");
    } else {
      const stale = getStaleScoresResponse();
      if (stale) matches = stale.matches;
    }
  }

  if (matches.length === 0) {
    res.json([]);
    return;
  }

  const standings = computeStandings(matches);
  standingsCache = { data: standings, expiresAt: now + STANDINGS_TTL };
  res.json(standings);
});

// ─── Top-scorer helpers ──────────────────────────────────────────────────────

async function fetchApiFootballIdByTeamsDate(
  homeEn: string,
  awayEn: string,
  dateIso: string
): Promise<string | null> {
  const { key, leagueId, season } = getAfConfig();
  if (!key) return null;

  const baseDate = dateIso.slice(0, 10);
  const anchor = new Date(`${baseDate}T12:00:00Z`);
  const prev = new Date(anchor);
  prev.setUTCDate(prev.getUTCDate() - 1);
  const next = new Date(anchor);
  next.setUTCDate(next.getUTCDate() + 1);
  const datesToTry = [...new Set([
    baseDate,
    prev.toISOString().slice(0, 10),
    next.toISOString().slice(0, 10),
  ])];

  const homeWant = teamCanonical(homeEn);
  const awayWant = teamCanonical(awayEn);

  for (const date of datesToTry) {
    try {
      const r = await fetch(
        `https://v3.football.api-sports.io/fixtures?league=${leagueId}&season=${season}&date=${date}`,
        { headers: { "x-apisports-key": key }, signal: AbortSignal.timeout(8000) }
      );
      if (!r.ok) continue;
      const json = await r.json() as {
        response?: Array<{
          fixture: { id: number };
          teams: { home: { name: string }; away: { name: string } };
        }>;
      };
      for (const row of json.response ?? []) {
        if (
          teamCanonical(row.teams.home.name) === homeWant &&
          teamCanonical(row.teams.away.name) === awayWant
        ) {
          return String(row.fixture.id);
        }
      }
    } catch (err) {
      logger.warn({ err, homeEn, awayEn, date }, "API-Football fixture search failed");
    }
  }
  return null;
}

async function fetchSdbApiFootballId(sdbEventId: string): Promise<string | null> {
  const detail = await fetchLiveEventDetail(sdbEventId, FINISHED_DETAIL_TTL);
  if (detail?.idAPIfootball) return String(detail.idAPIfootball);

  const statsJson = await fetchSdbJson<{
    eventstats?: Array<{ idApiFootball?: string; idAPIfootball?: string }>;
  }>(`lookupeventstats.php?id=${sdbEventId}`, 8000);
  const fromStats = statsJson?.eventstats?.[0]?.idApiFootball ?? statsJson?.eventstats?.[0]?.idAPIfootball;
  if (fromStats) return String(fromStats);

  if (!detail?.strHomeTeam || !detail?.strAwayTeam) return null;
  const date = detail.dateEvent ?? detail.strTimestamp?.slice(0, 10);
  if (!date) return null;
  return fetchApiFootballIdByTeamsDate(detail.strHomeTeam, detail.strAwayTeam, date);
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
  const timelines = await mapPool(
    relevant,
    async m => ({ match: m, timeline: await fetchSdbTimeline(m.theSportsDbId!) }),
    6
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

  const respondWithScorers = (scorers: TopScorer[]) => {
    if (scorers.length > 0) {
      topScorersCache = { data: scorers, expiresAt: now + TOPSCORERS_TTL };
      staleTopScorersCache = { data: scorers, expiresAt: now + STALE_TOPSCORERS_TTL };
    }
    res.json(scorers);
  };

  try {
    const result = await buildAllMatches();
    const matches = result.matches;
    if (matches.length > 0) {
      persistMainCache(matches, result.source === "cache" ? "cache" : "live");
    }

    if (matches.length === 0) {
      if (staleTopScorersCache && now < staleTopScorersCache.expiresAt) {
        res.json(staleTopScorersCache.data);
        return;
      }
      res.json([]);
      return;
    }

    const finishedWithSdbId = matches.filter(
      m => (m.status === "FINISHED" || m.status === "LIVE") && m.theSportsDbId
    );

    const fixtureIdResults = await mapPool(
      finishedWithSdbId,
      async m => ({
        match: m,
        fixtureId: await fetchSdbApiFootballId(m.theSportsDbId!),
      }),
      6
    );

    const goalResults = await mapPool(
      fixtureIdResults.filter(r => r.fixtureId),
      async r => ({
        match: r.match,
        goals: await fetchGoalsFromApiSports(r.fixtureId!),
      }),
      6
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

    const fromMatches = buildTopScorersFromMatches(matches);
    const timelineScorers = await buildTopScorersFromSdbTimelines(matches);
    const finalScorers = mergeTopScorerLists([fromMatches, timelineScorers, scorers]);

    respondWithScorers(finalScorers);
  } catch (err) {
    logger.warn({ err }, "top scorers fetch failed");
    try {
      const result = await buildAllMatches();
      const matches = result.matches.length > 0
        ? result.matches
        : (getStaleScoresResponse()?.matches ?? []);
      const fromMatches = buildTopScorersFromMatches(matches);
      const timelineScorers = matches.length > 0
        ? await buildTopScorersFromSdbTimelines(matches)
        : [];
      const fallback = mergeTopScorerLists([fromMatches, timelineScorers]);
      if (fallback.length > 0) {
        respondWithScorers(fallback);
        return;
      }
    } catch (err2) {
      logger.error({ err2 }, "top scorers fallback failed");
    }
    if (staleTopScorersCache && Date.now() < staleTopScorersCache.expiresAt) {
      res.json(staleTopScorersCache.data);
      return;
    }
    res.json([]);
  }
});

router.get("/copa2026/bracket", async (_req, res) => {
  const now = Date.now();
  if (bracketCache && now < bracketCache.expiresAt) {
    res.json(bracketCache.data);
    return;
  }

  try {
    const allMatches = await fetchFdFixturesSafe(true);
    if (!allMatches || allMatches.length === 0) {
      if (bracketCache) {
        res.json(bracketCache.data);
        return;
      }
      res.json([]);
      return;
    }
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
    if (bracketCache) {
      res.json(bracketCache.data);
      return;
    }
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

const AF_POS_PT: Record<string, string> = {
  G: "GOL", D: "ZAG", M: "MC", F: "AT",
};

function mapSdbStatsRows(
  rows: Array<{ strStat: string; intHome: string; intAway: string }>
): Array<{ name: string; home: number; away: number }> {
  return rows.map(s => ({
    name: STAT_PT[s.strStat] ?? s.strStat,
    home: parseInt(s.intHome ?? "0", 10) || 0,
    away: parseInt(s.intAway ?? "0", 10) || 0,
  }));
}

function mapSdbLineupRows(
  rows: Array<{
    strPlayer: string;
    intSquadNumber: string;
    strPosition: string;
    strHome: string;
    strSubstitute: string;
  }>
): { home: Array<{ name: string; number: number; position: string; isSub: boolean }>; away: Array<{ name: string; number: number; position: string; isSub: boolean }> } {
  const mapSide = (homeSide: boolean) =>
    rows
      .filter(p => (homeSide ? p.strHome === "Yes" : p.strHome !== "Yes"))
      .map(p => ({
        name: p.strPlayer,
        number: parseInt(p.intSquadNumber ?? "0", 10) || 0,
        position: POSITION_PT[p.strPosition] ?? p.strPosition ?? "",
        isSub: p.strSubstitute === "Yes",
      }))
      .sort((a, b) => (a.isSub ? 1 : 0) - (b.isSub ? 1 : 0));

  return { home: mapSide(true), away: mapSide(false) };
}

async function fetchApiSportsLineups(fixtureId: string): Promise<{
  home: Array<{ name: string; number: number; position: string; isSub: boolean }>;
  away: Array<{ name: string; number: number; position: string; isSub: boolean }>;
} | null> {
  const key = process.env.API_FOOTBALL_KEY ?? "";
  if (!key) return null;

  try {
    const r = await fetch(
      `https://v3.football.api-sports.io/fixtures/lineups?fixture=${fixtureId}`,
      { headers: { "x-apisports-key": key }, signal: AbortSignal.timeout(6000) }
    );
    if (!r.ok) return null;
    const json = await r.json() as {
      response?: Array<{
        team: { id: number };
        startXI: Array<{ player: { name: string; number: number; pos: string | null } }>;
        substitutes: Array<{ player: { name: string; number: number; pos: string | null } }>;
      }>;
    };
    if (!json.response?.length) return null;

    const mapTeam = (block: (typeof json.response)[number] | undefined) => {
      if (!block) return [];
      const starters = (block.startXI ?? []).map(x => ({
        name: x.player.name,
        number: x.player.number ?? 0,
        position: AF_POS_PT[x.player.pos ?? ""] ?? x.player.pos ?? "",
        isSub: false,
      }));
      const subs = (block.substitutes ?? []).map(x => ({
        name: x.player.name,
        number: x.player.number ?? 0,
        position: AF_POS_PT[x.player.pos ?? ""] ?? x.player.pos ?? "",
        isSub: true,
      }));
      return [...starters, ...subs];
    };

    return {
      home: mapTeam(json.response[0]),
      away: mapTeam(json.response[1]),
    };
  } catch (err) {
    logger.warn({ err, fixtureId }, "api-sports lineups fetch failed");
    return null;
  }
}

function statsPayloadHasContent(data: {
  stats: unknown[];
  lineup: { home: unknown[]; away: unknown[] };
  timeline: unknown[];
}): boolean {
  return (
    data.stats.length > 0 ||
    data.lineup.home.length > 0 ||
    data.lineup.away.length > 0 ||
    data.timeline.length > 0
  );
}

router.get("/copa2026/match/:eventId/stats", async (req, res) => {
  const { eventId } = req.params;
  const now = Date.now();
  const finished = req.query.finished === "1" || req.query.finished === "true";
  const homeQ = String(req.query.home ?? "");
  const awayQ = String(req.query.away ?? "");
  const dateQ = String(req.query.date ?? "").slice(0, 10);

  const cached = statsCacheMap.get(eventId);
  if (cached && now < cached.expiresAt) {
    const payload = cached.data as {
      stats: unknown[];
      lineup: { home: unknown[]; away: unknown[] };
      timeline: unknown[];
    };
    if (statsPayloadHasContent(payload)) {
      res.json(cached.data);
      return;
    }
  }

  const isSdbId = /^\d+$/.test(eventId);

  try {
    let stats: Array<{ name: string; home: number; away: number }> = [];
    let timeline: Array<{ minute: number; type: string; team: "home" | "away"; player: string; assist?: string }> = [];
    let lineup: { home: Array<{ name: string; number: number; position: string; isSub: boolean }>; away: Array<{ name: string; number: number; position: string; isSub: boolean }> } = { home: [], away: [] };
    let apiFootballId: string | null = null;

    if (isSdbId) {
      const [statsJson, lineupJson, afFromSdb] = await Promise.all([
        fetchSdbJson<{ eventstats?: Array<{ strStat: string; intHome: string; intAway: string; idApiFootball?: string; idAPIfootball?: string }> }>(
          `lookupeventstats.php?id=${eventId}`,
          8000
        ),
        fetchSdbJson<{ lineup?: Array<{
          strPlayer: string; intSquadNumber: string; strPosition: string;
          strHome: string; strSubstitute: string;
        }> }>(`lookuplineup.php?id=${eventId}`, 8000),
        fetchSdbApiFootballId(eventId),
      ]);
      stats = mapSdbStatsRows(statsJson?.eventstats ?? []);
      lineup = mapSdbLineupRows(lineupJson?.lineup ?? []);
      apiFootballId = afFromSdb;
    }

    if (!apiFootballId) {
      const homeEn = ptToEn(homeQ) || homeQ;
      const awayEn = ptToEn(awayQ) || awayQ;
      if (homeEn && awayEn && dateQ) {
        apiFootballId = await fetchApiFootballIdByTeamsDate(homeEn, awayEn, dateQ);
      } else if (isSdbId) {
        const detail = await fetchLiveEventDetail(eventId, FINISHED_DETAIL_TTL);
        if (detail?.strHomeTeam && detail?.strAwayTeam) {
          const date = detail.dateEvent ?? detail.strTimestamp?.slice(0, 10) ?? "";
          if (date) {
            apiFootballId = await fetchApiFootballIdByTeamsDate(
              detail.strHomeTeam,
              detail.strAwayTeam,
              date
            );
          }
        }
      }
    }

    if (apiFootballId) {
      const [enriched, afLineup] = await Promise.all([
        fetchApiSportsStats(apiFootballId),
        fetchApiSportsLineups(apiFootballId),
      ]);
      if (enriched?.stats?.length) {
        stats = enriched.stats;
        timeline = enriched.timeline;
      }
      if (afLineup && (afLineup.home.length > 0 || afLineup.away.length > 0)) {
        lineup = afLineup;
      }
    }

    const data = { stats, lineup, timeline };
    const hasContent = statsPayloadHasContent(data);
    const ttl = hasContent
      ? (finished ? FINISHED_STATS_TTL : STATS_TTL)
      : STATS_EMPTY_TTL;
    statsCacheMap.set(eventId, { data, expiresAt: now + ttl });
    res.json(data);
  } catch (err) {
    logger.warn({ err, eventId }, "Stats fetch failed");
    res.json({ stats: [], lineup: { home: [], away: [] }, timeline: [] });
  }
});

export default router;
