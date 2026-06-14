import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { format, parseISO, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Trophy, RefreshCw, WifiOff, Circle, MapPin, X, Clock, Hash, Users, LayoutGrid, Target } from "lucide-react";
import {
  useGetCopa2026Scores,
  getGetCopa2026ScoresQueryKey,
} from "@workspace/api-client-react";
import type { Copa2026Match, Copa2026ScoresResponse } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { GroupStandings } from "@/components/group-standings";
import { TopScorers } from "@/components/top-scorers";

const GROUPS = ["Todos", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];

type Tab = "placares" | "grupos" | "artilheiros";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "placares", label: "Jogos", icon: <Trophy size={18} /> },
  { id: "grupos", label: "Grupos", icon: <LayoutGrid size={18} /> },
  { id: "artilheiros", label: "Gols", icon: <Target size={18} /> },
];

const C = {
  bg:      "#060e1c",
  card:    "#0d1e3a",
  gold:    "#FFD700",
  border:  "#163464",
  muted:   "#aab3be",
  live:    "#ef4444",
  done:    "#22c55e",
  pend:    "#6b7280",
  text:    "#f0f4f8",
  sheet:   "#0a1628",
} as const;

interface ScoreSnapshot {
  homeScore: number | null;
  awayScore: number | null;
  status: string;
}

type ExtendedMatch = Copa2026Match & {
  theSportsDbId?: string | null;
  thumbnail?: string | null;
};

export default function MobileScoreboard() {
  const [activeTab, setActiveTab] = useState<Tab>("placares");
  const [activeGroup, setActiveGroup] = useState("Todos");
  const [refreshing, setRefreshing] = useState(false);
  const [cachedData, setCachedData] = useState<Copa2026ScoresResponse | null>(null);
  const [syncKey, setSyncKey] = useState(0);
  const [selectedMatch, setSelectedMatch] = useState<ExtendedMatch | null>(null);
  const queryClient = useQueryClient();

  const prevSnapshotsRef = useRef<Map<string, ScoreSnapshot>>(new Map());
  const changedMatchIdsRef = useRef<Set<string>>(new Set());
  const newLiveMatchIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    try {
      const c = localStorage.getItem("copa2026_mobile_cache");
      if (c) setCachedData(JSON.parse(c));
    } catch {}
  }, []);

  const { data: apiData, isLoading, isError, isFetching } = useGetCopa2026Scores({
    query: {
      queryKey: getGetCopa2026ScoresQueryKey(),
      refetchInterval: (query) => {
        const matches = query.state.data?.matches;
        const hasLive = Array.isArray(matches) && matches.some((m) => m.status === "LIVE");
        return hasLive ? 15_000 : 45_000;
      },
    },
  });

  useEffect(() => {
    if (apiData && (apiData.matches?.length ?? 0) > 0) {
      const prev = prevSnapshotsRef.current;
      const changed = new Set<string>();
      const newLive = new Set<string>();

      for (const m of apiData.matches ?? []) {
        const snap = prev.get(m.id);
        if (snap) {
          if (
            snap.homeScore !== m.homeScore ||
            snap.awayScore !== m.awayScore
          ) {
            changed.add(m.id);
          }
          if (snap.status !== "LIVE" && m.status === "LIVE") {
            newLive.add(m.id);
          }
        }
        prev.set(m.id, {
          homeScore: m.homeScore,
          awayScore: m.awayScore,
          status: m.status,
        });
      }

      changedMatchIdsRef.current = changed;
      newLiveMatchIdsRef.current = newLive;

      try {
        localStorage.setItem("copa2026_mobile_cache", JSON.stringify(apiData));
        setCachedData(apiData);
      } catch {}

      setSyncKey((k) => k + 1);
    }
  }, [apiData]);

  const liveApiData = apiData && (apiData.matches?.length ?? 0) > 0 ? apiData : null;
  const data = liveApiData ?? cachedData;
  const isFallback =
    isError ||
    apiData?.source === "cache" ||
    (!liveApiData && !!cachedData);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: getGetCopa2026ScoresQueryKey() });
    setTimeout(() => setRefreshing(false), 800);
  }, [queryClient]);

  const filteredMatches = useMemo(() => {
    if (!data?.matches) return [];
    const statusOrder = { LIVE: 0, FINISHED: 1, PENDING: 2 } as const;
    return data.matches
      .filter((m) => activeGroup === "Todos" ? true : m.group === activeGroup)
      .sort((a, b) => {
        const sa = statusOrder[a.status as keyof typeof statusOrder] ?? 3;
        const sb = statusOrder[b.status as keyof typeof statusOrder] ?? 3;
        if (sa !== sb) return sa - sb;
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
  }, [data, activeGroup]);

  const stats = useMemo(() => ({
    live:     filteredMatches.filter((m) => m.status === "LIVE").length,
    finished: filteredMatches.filter((m) => m.status === "FINISHED").length,
    pending:  filteredMatches.filter((m) => m.status === "PENDING").length,
  }), [filteredMatches]);

  const lastSync = useMemo(() => {
    if (!data?.updatedAt) return "";
    try {
      return formatDistanceToNow(new Date(data.updatedAt), { addSuffix: true, locale: ptBR });
    } catch {
      return "";
    }
  }, [data]);

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "system-ui, sans-serif", overscrollBehaviorY: "contain", paddingBottom: 72 }}>
      {/* Header */}
      <header style={{ position: "sticky", top: 0, zIndex: 50, background: C.bg + "f5", borderBottom: `1px solid ${C.border}`, backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}>
        <div style={{ padding: "12px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg, ${C.gold}30, ${C.gold}08)`, border: `1px solid ${C.gold}40`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Trophy size={18} color={C.gold} />
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 900, lineHeight: 1.1 }}>
                  <span style={{ color: C.gold }}>seliga</span><span>aqui</span>
                  <span style={{ color: C.muted, fontSize: 11, fontWeight: 600 }}>.online</span>
                </div>
                <div style={{ fontSize: 10, color: C.muted, fontWeight: 500 }}>Copa 2026 ao vivo</div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {lastSync && (
                <span
                  key={syncKey}
                  style={{ fontSize: 10, color: C.muted, animation: syncKey > 0 ? "timestampPulse 1.5s ease-out" : "none" }}
                >
                  {lastSync}
                </span>
              )}
              {isFallback ? (
                <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: C.muted, background: C.card, border: `1px solid ${C.border}`, borderRadius: 20, padding: "3px 8px", fontWeight: 600 }}>
                  <WifiOff size={10} /> Offline
                </span>
              ) : (
                <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: C.gold, background: C.gold + "18", border: `1px solid ${C.gold}50`, borderRadius: 20, padding: "3px 8px", fontWeight: 600 }}>
                  <Circle size={6} fill={C.gold} /> Ao Vivo
                </span>
              )}
              <button
                onClick={handleRefresh}
                disabled={isFetching || refreshing}
                style={{ background: "none", border: "none", cursor: "pointer", color: C.muted, padding: 4, lineHeight: 0 }}
                title="Atualizar"
              >
                <RefreshCw size={16} style={{ animation: (isFetching || refreshing) ? "spin 1s linear infinite" : "none" }} />
              </button>
            </div>
          </div>

          {/* Stats row */}
          <div style={{ display: "flex", gap: 16, marginTop: 8, fontSize: 11, color: C.muted }}>
            {stats.live > 0 && (
              <span style={{ color: C.live, fontWeight: 700 }}>● {stats.live} ao vivo</span>
            )}
            <span>✓ {stats.finished} encerrados</span>
            <span style={{ color: C.pend }}>○ {stats.pending} aguardando</span>
          </div>
        </div>

        {/* Group tabs — placares only */}
        {activeTab === "placares" && (
        <div style={{ display: "flex", overflowX: "auto", gap: 6, padding: "8px 16px 10px", scrollbarWidth: "none" }}>
          {GROUPS.map((g) => (
            <button
              key={g}
              onClick={() => setActiveGroup(g)}
              style={{
                flexShrink: 0,
                padding: "5px 14px",
                borderRadius: 20,
                fontSize: 13,
                fontWeight: 600,
                border: `1px solid`,
                cursor: "pointer",
                transition: "all 0.15s",
                borderColor: activeGroup === g ? C.gold : C.border,
                background: activeGroup === g ? C.gold : C.card,
                color: activeGroup === g ? "#000" : C.muted,
                boxShadow: activeGroup === g ? `0 0 14px ${C.gold}55` : "none",
              }}
            >
              {g === "Todos" ? "Todos" : `Grupo ${g}`}
            </button>
          ))}
        </div>
        )}
      </header>

      {/* Content */}
      <main style={{ padding: activeTab === "placares" ? "12px 12px 40px" : "8px 8px 40px" }}>
        {activeTab === "grupos" && (
          <div className="px-1">
            <GroupStandings />
          </div>
        )}
        {activeTab === "artilheiros" && (
          <div className="px-1">
            <TopScorers />
          </div>
        )}
        {activeTab === "placares" && (
        <>
        {isLoading && !data ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{ height: 108, borderRadius: 14, background: C.card, border: `1px solid ${C.border}`, opacity: 0.5 + i * 0.08 }} />
            ))}
          </div>
        ) : filteredMatches.length === 0 ? (
          <div style={{ textAlign: "center", paddingTop: 80, color: C.muted }}>
            <Trophy size={40} color={C.border} style={{ margin: "0 auto 12px" }} />
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>Nenhum jogo encontrado</div>
            <div style={{ fontSize: 13 }}>Nenhuma partida para o Grupo {activeGroup}.</div>
            <button
              onClick={() => setActiveGroup("Todos")}
              style={{ marginTop: 16, color: C.gold, background: "none", border: "none", cursor: "pointer", fontSize: 14, fontWeight: 600 }}
            >
              Ver todos
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {filteredMatches.map((match) => (
              <MobileMatchCard
                key={match.id}
                match={match as ExtendedMatch}
                scoreChanged={changedMatchIdsRef.current.has(match.id)}
                isNewLive={newLiveMatchIdsRef.current.has(match.id)}
                onTap={() => setSelectedMatch(match as ExtendedMatch)}
              />
            ))}
          </div>
        )}
        </>
        )}
      </main>

      {/* Bottom tab bar */}
      <nav style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 60,
        display: "flex", background: C.sheet, borderTop: `1px solid ${C.border}`,
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
              padding: "10px 4px 12px", background: "none", border: "none", cursor: "pointer",
              color: activeTab === tab.id ? C.gold : C.muted,
            }}
          >
            {tab.icon}
            <span style={{ fontSize: 10, fontWeight: 700 }}>{tab.label}</span>
          </button>
        ))}
      </nav>

      {/* Detail Sheet */}
      <MatchDetailSheet
        match={selectedMatch}
        onClose={() => setSelectedMatch(null)}
      />

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes ping { 0% { transform: scale(1); opacity: .75; } 75%, 100% { transform: scale(2); opacity: 0; } }
        @keyframes scoreFlash {
          0%   { color: inherit; text-shadow: none; }
          15%  { color: #FFD700; text-shadow: 0 0 12px #FFD70099, 0 0 24px #FFD70055; transform: scale(1.25); }
          45%  { color: #ef4444; text-shadow: 0 0 8px #ef444466; transform: scale(1.1); }
          100% { color: inherit; text-shadow: none; transform: scale(1); }
        }
        @keyframes cardSlideIn {
          from { opacity: 0; transform: translateX(-18px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes timestampPulse {
          0%   { color: #aab3be; }
          25%  { color: #FFD700; }
          100% { color: #aab3be; }
        }
        @keyframes sheetSlideUp {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0); opacity: 1; }
        }
        @keyframes overlayFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        ::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}

interface MobileMatchCardProps {
  match: ExtendedMatch;
  scoreChanged: boolean;
  isNewLive: boolean;
  onTap: () => void;
}

function MobileMatchCard({ match, scoreChanged, isNewLive, onTap }: MobileMatchCardProps) {
  const isLive     = match.status === "LIVE";
  const isFinished = match.status === "FINISHED";

  const dateStr = useMemo(() => {
    try {
      return format(parseISO(match.date), "EEE dd/MM · HH:mm", { locale: ptBR });
    } catch {
      return "";
    }
  }, [match.date]);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onTap}
      onKeyDown={(e) => e.key === "Enter" && onTap()}
      style={{
        background: C.card,
        border: `1px solid ${isLive ? C.live + "60" : C.border}`,
        borderRadius: 14,
        padding: "12px 14px",
        position: "relative",
        overflow: "hidden",
        boxShadow: isLive ? `0 0 18px ${C.live}22` : "none",
        animation: isNewLive ? "cardSlideIn 0.45s cubic-bezier(0.22,1,0.36,1)" : "none",
        cursor: "pointer",
        WebkitTapHighlightColor: "transparent",
        userSelect: "none",
        transition: "background 0.12s",
      }}
    >
      {/* Status badge */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: C.muted, letterSpacing: "0.1em", textTransform: "uppercase", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 20, padding: "2px 8px" }}>
          Grupo {match.group}
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {isLive && match.minute && (
            <span style={{ fontSize: 11, fontWeight: 700, color: C.live, background: C.live + "18", border: `1px solid ${C.live}40`, borderRadius: 20, padding: "2px 8px" }}>
              {match.minute}
            </span>
          )}
          {isLive && (
            <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 800, color: C.live, letterSpacing: "0.05em" }}>
              <span style={{ position: "relative", display: "inline-flex", width: 8, height: 8 }}>
                <span style={{ position: "absolute", inset: 0, borderRadius: "50%", background: C.live, opacity: 0.75, animation: "ping 1.2s cubic-bezier(0,0,0.2,1) infinite" }} />
                <span style={{ position: "relative", width: 8, height: 8, borderRadius: "50%", background: C.live }} />
              </span>
              AO VIVO
            </span>
          )}
          {isFinished && (
            <span style={{ fontSize: 11, fontWeight: 700, color: C.done }}>ENCERRADO</span>
          )}
          {!isLive && !isFinished && (
            <span style={{ fontSize: 11, fontWeight: 700, color: C.pend }}>AGUARDANDO</span>
          )}
        </div>
      </div>

      {/* Teams & scores */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <TeamRow
          flag={match.homeTeam.flag}
          name={match.homeTeam.name}
          score={match.homeScore}
          isLive={isLive}
          scoreChanged={scoreChanged}
        />
        {(match.goalScorers?.home ?? []).length > 0 && (
          <div style={{ paddingLeft: 32, display: "flex", flexWrap: "wrap", gap: "2px 8px", marginTop: -4 }}>
            {match.goalScorers!.home.map((g, i) => (
              <span key={i} style={{ fontSize: 10, color: C.muted }}>⚽ {g}</span>
            ))}
          </div>
        )}
        <TeamRow
          flag={match.awayTeam.flag}
          name={match.awayTeam.name}
          score={match.awayScore}
          isLive={isLive}
          scoreChanged={scoreChanged}
        />
        {(match.goalScorers?.away ?? []).length > 0 && (
          <div style={{ paddingLeft: 32, display: "flex", flexWrap: "wrap", gap: "2px 8px", marginTop: -4 }}>
            {match.goalScorers!.away.map((g, i) => (
              <span key={i} style={{ fontSize: 10, color: C.muted }}>⚽ {g}</span>
            ))}
          </div>
        )}
      </div>

      {match.liveStats && (isLive || isFinished) && (
        <div style={{ marginTop: 8, display: "flex", gap: 12, fontSize: 10, color: C.pend }}>
          <span>🎯 {match.liveStats.shotsOnGoal[0]}-{match.liveStats.shotsOnGoal[1]}</span>
          <span>⚽ {((match.liveStats as { totalShots?: [number, number] }).totalShots ?? match.liveStats.shotsOnGoal)[0]}-{((match.liveStats as { totalShots?: [number, number] }).totalShots ?? match.liveStats.shotsOnGoal)[1]}</span>
        </div>
      )}

      {/* Footer */}
      <div style={{ marginTop: 10, paddingTop: 8, borderTop: `1px solid ${C.border}60`, display: "flex", justifyContent: "space-between", fontSize: 10, color: C.pend }}>
        <span>{dateStr}</span>
        <span title={match.venue} style={{ maxWidth: "55%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{match.venue}</span>
      </div>

      {/* Tap chevron hint */}
      <div style={{ position: "absolute", bottom: 10, right: 14, opacity: 0.3, lineHeight: 0 }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </div>
    </div>
  );
}

function TeamRow({
  flag,
  name,
  score,
  isLive,
  scoreChanged,
}: {
  flag: string;
  name: string;
  score: number | null;
  isLive: boolean;
  scoreChanged: boolean;
}) {
  const flashKeyRef = useRef(0);
  const prevScoreRef = useRef(score);
  const [flashKey, setFlashKey] = useState(0);

  useEffect(() => {
    if (prevScoreRef.current !== score && score !== null && prevScoreRef.current !== null) {
      flashKeyRef.current += 1;
      setFlashKey(flashKeyRef.current);
    }
    prevScoreRef.current = score;
  }, [score]);

  const shouldFlash = scoreChanged && flashKey > 0;

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
        <span style={{ fontSize: 22, lineHeight: 1 }}>{flag}</span>
        <span style={{ fontSize: 15, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: C.text }}>{name}</span>
      </div>
      <span
        key={flashKey}
        style={{
          fontSize: 22,
          fontWeight: 800,
          fontVariantNumeric: "tabular-nums",
          color: isLive ? C.live : score !== null ? C.text : C.pend,
          minWidth: 28,
          textAlign: "right",
          display: "inline-block",
          animation: shouldFlash ? "scoreFlash 0.9s cubic-bezier(0.22,1,0.36,1)" : "none",
          transformOrigin: "center",
        }}
      >
        {score !== null ? score : "—"}
      </span>
    </div>
  );
}

// ─── Match Detail Sheet ─────────────────────────────────────────────────────

interface MatchPlayer {
  name: string;
  number: number;
  position: string;
  isSub: boolean;
}

interface MatchLineup {
  home: MatchPlayer[];
  away: MatchPlayer[];
}

interface MatchDetailSheetProps {
  match: ExtendedMatch | null;
  onClose: () => void;
}

function TeamBadgeImg({ badge, flag, name }: { badge?: string | null; flag: string; name: string }) {
  const [err, setErr] = useState(false);
  if (badge && !err) {
    return (
      <img
        src={badge}
        alt={name}
        onError={() => setErr(true)}
        style={{ width: 48, height: 48, objectFit: "contain" }}
      />
    );
  }
  return <span style={{ fontSize: 38, lineHeight: 1 }}>{flag}</span>;
}

function MatchDetailSheet({ match, onClose }: MatchDetailSheetProps) {
  const [visible, setVisible] = useState(false);
  const [rendered, setRendered] = useState(false);
  const [lineup, setLineup] = useState<MatchLineup | null>(null);
  const [lineupLoading, setLineupLoading] = useState(false);

  useEffect(() => {
    if (match) {
      setRendered(true);
      requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
    } else {
      setVisible(false);
      const t = setTimeout(() => setRendered(false), 350);
      return () => clearTimeout(t);
    }
  }, [match]);

  useEffect(() => {
    if (!match) {
      setLineup(null);
      return;
    }
    const sdbId = (match as ExtendedMatch & { theSportsDbId?: string | null }).theSportsDbId;
    if (!sdbId) {
      setLineup(null);
      return;
    }
    setLineupLoading(true);
    setLineup(null);
    const base = (import.meta as { env: Record<string, string> }).env.BASE_URL?.replace(/\/$/, "") ?? "";
    fetch(`${base}/api/copa2026/match/${sdbId}/stats`)
      .then(r => r.json())
      .then((d: { lineup?: MatchLineup }) => {
        setLineup(d.lineup ?? null);
        setLineupLoading(false);
      })
      .catch(() => { setLineupLoading(false); });
  }, [match?.id]);

  // Trap body scroll while open
  useEffect(() => {
    if (match) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [match]);

  if (!rendered || !match) return null;

  const isLive     = match.status === "LIVE";
  const isFinished = match.status === "FINISHED";
  const hasScore   = match.homeScore !== null && match.awayScore !== null;

  let dateStr = "";
  try {
    dateStr = format(parseISO(match.date), "EEE, dd/MM/yyyy · HH:mm", { locale: ptBR });
  } catch { /* noop */ }

  const homeGoals = match.goalScorers?.home ?? [];
  const awayGoals = match.goalScorers?.away ?? [];
  const hasGoals = homeGoals.length > 0 || awayGoals.length > 0;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 100,
          background: "rgba(0,0,0,0.65)",
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
          opacity: visible ? 1 : 0,
          transition: "opacity 0.3s ease",
        }}
      />

      {/* Sheet */}
      <div
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 101,
          background: C.sheet,
          borderRadius: "20px 20px 0 0",
          border: `1px solid ${C.border}`,
          borderBottom: "none",
          maxHeight: "88vh",
          overflowY: "auto",
          transform: visible ? "translateY(0)" : "translateY(100%)",
          opacity: visible ? 1 : 0,
          transition: "transform 0.35s cubic-bezier(0.22,1,0.36,1), opacity 0.25s ease",
          boxShadow: "0 -8px 40px rgba(0,0,0,0.5)",
        }}
      >
        {/* Drag handle */}
        <div style={{ display: "flex", justifyContent: "center", paddingTop: 12, paddingBottom: 4 }}>
          <div style={{ width: 40, height: 4, borderRadius: 2, background: C.border }} />
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 14,
            right: 16,
            background: C.card,
            border: `1px solid ${C.border}`,
            borderRadius: "50%",
            width: 32,
            height: 32,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: C.muted,
            lineHeight: 0,
          }}
          aria-label="Fechar"
        >
          <X size={16} />
        </button>

        <div style={{ padding: "8px 20px 36px" }}>

          {/* Round & match number */}
          <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: C.muted, letterSpacing: "0.1em", textTransform: "uppercase", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 20, padding: "3px 10px" }}>
              Grupo {match.group}
            </span>
            <span style={{ fontSize: 11, fontWeight: 700, color: C.muted, letterSpacing: "0.1em", textTransform: "uppercase", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 20, padding: "3px 10px", display: "flex", alignItems: "center", gap: 4 }}>
              <Hash size={10} />
              Partida {match.matchNumber}
            </span>
            <span style={{ fontSize: 11, fontWeight: 700, color: C.muted, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 20, padding: "3px 10px" }}>
              {match.round}
            </span>
          </div>

          {/* Status + minute */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            {isLive && (
              <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 800, color: C.live, letterSpacing: "0.05em" }}>
                <span style={{ position: "relative", display: "inline-flex", width: 9, height: 9 }}>
                  <span style={{ position: "absolute", inset: 0, borderRadius: "50%", background: C.live, opacity: 0.75, animation: "ping 1.2s cubic-bezier(0,0,0.2,1) infinite" }} />
                  <span style={{ position: "relative", width: 9, height: 9, borderRadius: "50%", background: C.live }} />
                </span>
                AO VIVO
              </span>
            )}
            {isLive && match.minute && (
              <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 700, color: C.live, background: C.live + "18", border: `1px solid ${C.live}40`, borderRadius: 20, padding: "3px 10px" }}>
                <Clock size={11} />
                {match.minute}
              </span>
            )}
            {isFinished && (
              <span style={{ fontSize: 12, fontWeight: 700, color: C.done }}>ENCERRADO</span>
            )}
            {!isLive && !isFinished && (
              <span style={{ fontSize: 12, fontWeight: 700, color: C.pend }}>AGUARDANDO</span>
            )}
          </div>

          {/* Teams & score */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 24 }}>
            {/* Home team */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, minWidth: 0 }}>
              <TeamBadgeImg badge={(match.homeTeam as { badge?: string | null }).badge} flag={match.homeTeam.flag} name={match.homeTeam.name} />
              <span style={{ fontSize: 13, fontWeight: 700, textAlign: "center", lineHeight: 1.2, color: C.text }}>{match.homeTeam.name}</span>
            </div>

            {/* Score */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, flexShrink: 0 }}>
              {hasScore ? (
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 44, fontWeight: 900, fontVariantNumeric: "tabular-nums", color: isLive ? C.live : C.text, lineHeight: 1 }}>
                    {match.homeScore}
                  </span>
                  <span style={{ fontSize: 22, color: C.muted, fontWeight: 300 }}>–</span>
                  <span style={{ fontSize: 44, fontWeight: 900, fontVariantNumeric: "tabular-nums", color: isLive ? C.live : C.text, lineHeight: 1 }}>
                    {match.awayScore}
                  </span>
                </div>
              ) : (
                <span style={{ fontSize: 24, color: C.muted, fontWeight: 300 }}>vs</span>
              )}
            </div>

            {/* Away team */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, minWidth: 0 }}>
              <TeamBadgeImg badge={(match.awayTeam as { badge?: string | null }).badge} flag={match.awayTeam.flag} name={match.awayTeam.name} />
              <span style={{ fontSize: 13, fontWeight: 700, textAlign: "center", lineHeight: 1.2, color: C.text }}>{match.awayTeam.name}</span>
            </div>
          </div>

          {/* Thumbnail */}
          {match.thumbnail && (
            <div style={{ borderRadius: 12, overflow: "hidden", marginBottom: 20 }}>
              <img
                src={match.thumbnail}
                alt={`${match.homeTeam.name} vs ${match.awayTeam.name}`}
                style={{ width: "100%", height: 120, objectFit: "cover", opacity: 0.75 }}
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {/* Venue */}
            {match.venue && (
              <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "14px 16px", display: "flex", alignItems: "flex-start", gap: 12 }}>
                <div style={{ flexShrink: 0, width: 36, height: 36, borderRadius: 10, background: C.gold + "18", border: `1px solid ${C.gold}30`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <MapPin size={18} color={C.gold} />
                </div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 3 }}>Estádio</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: C.text, lineHeight: 1.3 }}>{match.venue}</div>
                </div>
              </div>
            )}

            {/* Date/time */}
            {dateStr && (
              <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ flexShrink: 0, width: 36, height: 36, borderRadius: 10, background: C.gold + "18", border: `1px solid ${C.gold}30`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Clock size={18} color={C.gold} />
                </div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 3 }}>Data e Hora</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{dateStr}</div>
                </div>
              </div>
            )}

            {/* Goal scorers */}
            {hasGoals && (
              <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "14px 16px" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 10 }}>⚽ Gols</div>
                <div style={{ display: "flex", gap: 16 }}>
                  {/* Home goals */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: C.gold, marginBottom: 6 }}>{match.homeTeam.name}</div>
                    {homeGoals.length > 0 ? homeGoals.map((g, i) => (
                      <div key={i} style={{ fontSize: 12, color: C.text, padding: "3px 0", borderBottom: i < homeGoals.length - 1 ? `1px solid ${C.border}40` : "none" }}>
                        {g}
                      </div>
                    )) : (
                      <div style={{ fontSize: 12, color: C.pend }}>—</div>
                    )}
                  </div>
                  {/* Divider */}
                  <div style={{ width: 1, background: C.border, flexShrink: 0 }} />
                  {/* Away goals */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: C.gold, marginBottom: 6 }}>{match.awayTeam.name}</div>
                    {awayGoals.length > 0 ? awayGoals.map((g, i) => (
                      <div key={i} style={{ fontSize: 12, color: C.text, padding: "3px 0", borderBottom: i < awayGoals.length - 1 ? `1px solid ${C.border}40` : "none" }}>
                        {g}
                      </div>
                    )) : (
                      <div style={{ fontSize: 12, color: C.pend }}>—</div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Lineup */}
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "14px 16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: C.gold + "18", border: `1px solid ${C.gold}30`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Users size={14} color={C.gold} />
                </div>
                <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, letterSpacing: "0.12em", textTransform: "uppercase" }}>Escalação</div>
              </div>

              {lineupLoading && (
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} style={{ height: 22, borderRadius: 6, background: C.bg, opacity: 0.6 }} />
                  ))}
                </div>
              )}

              {!lineupLoading && !lineup && (
                <div style={{ fontSize: 12, color: C.pend, textAlign: "center", padding: "8px 0" }}>
                  Escalação não divulgada ainda
                </div>
              )}

              {!lineupLoading && lineup && (lineup.home.length > 0 || lineup.away.length > 0) && (
                <>
                  {/* Column headers */}
                  <div style={{ display: "flex", gap: 10, marginBottom: 8 }}>
                    <div style={{ flex: 1, fontSize: 11, fontWeight: 700, color: C.gold, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{match.homeTeam.name}</div>
                    <div style={{ width: 1, background: C.border, flexShrink: 0 }} />
                    <div style={{ flex: 1, fontSize: 11, fontWeight: 700, color: C.gold, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textAlign: "right" }}>{match.awayTeam.name}</div>
                  </div>

                  {/* Starting XI */}
                  <LineupColumns
                    home={lineup.home.filter(p => !p.isSub)}
                    away={lineup.away.filter(p => !p.isSub)}
                    label="Titulares"
                  />

                  {/* Subs */}
                  {(lineup.home.some(p => p.isSub) || lineup.away.some(p => p.isSub)) && (
                    <LineupColumns
                      home={lineup.home.filter(p => p.isSub)}
                      away={lineup.away.filter(p => p.isSub)}
                      label="Reservas"
                      muted
                    />
                  )}
                </>
              )}

              {!lineupLoading && lineup && lineup.home.length === 0 && lineup.away.length === 0 && (
                <div style={{ fontSize: 12, color: C.pend, textAlign: "center", padding: "8px 0" }}>
                  Escalação não disponível para esta partida
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function LineupColumns({
  home,
  away,
  label,
  muted = false,
}: {
  home: MatchPlayer[];
  away: MatchPlayer[];
  label: string;
  muted?: boolean;
}) {
  const rows = Math.max(home.length, away.length);
  if (rows === 0) return null;
  return (
    <div style={{ marginTop: 10 }}>
      <div style={{ fontSize: 9, fontWeight: 700, color: C.pend, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 6 }}>{label}</div>
      <div style={{ display: "flex", gap: 10 }}>
        {/* Home column */}
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 3 }}>
          {home.map((p, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 4, opacity: muted ? 0.65 : 1 }}>
              <span style={{ fontSize: 9, fontWeight: 700, color: C.pend, fontVariantNumeric: "tabular-nums", minWidth: 14, textAlign: "right" }}>{p.number || "—"}</span>
              <span style={{ fontSize: 11, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{p.name}</span>
              <span style={{ fontSize: 9, color: C.muted, background: C.bg, borderRadius: 3, padding: "1px 4px", flexShrink: 0 }}>{p.position}</span>
            </div>
          ))}
        </div>
        {/* Divider */}
        <div style={{ width: 1, background: C.border, flexShrink: 0 }} />
        {/* Away column */}
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 3 }}>
          {away.map((p, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 4, flexDirection: "row-reverse", opacity: muted ? 0.65 : 1 }}>
              <span style={{ fontSize: 9, fontWeight: 700, color: C.pend, fontVariantNumeric: "tabular-nums", minWidth: 14, textAlign: "left" }}>{p.number || "—"}</span>
              <span style={{ fontSize: 11, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1, textAlign: "right" }}>{p.name}</span>
              <span style={{ fontSize: 9, color: C.muted, background: C.bg, borderRadius: 3, padding: "1px 4px", flexShrink: 0 }}>{p.position}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
