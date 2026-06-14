import React, { useState, useEffect, useMemo } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Search, Trophy, WifiOff, LayoutGrid, Target, GitBranch } from "lucide-react";
import { useGetCopa2026Scores, getGetCopa2026ScoresQueryKey } from "@workspace/api-client-react";
import { Input } from "@/components/ui/input";
import { MatchCard } from "@/components/match-card";
import { MatchStatsDrawer } from "@/components/match-stats-drawer";
import { GroupStandings } from "@/components/group-standings";
import { TopScorers } from "@/components/top-scorers";
import { Bracket } from "@/components/bracket";
import { Skeleton } from "@/components/ui/skeleton";
import type { Copa2026ScoresResponse, Copa2026Match } from "@workspace/api-client-react";

type ExtendedMatch = Copa2026Match & { theSportsDbId?: string | null };

type Tab = "placares" | "grupos" | "artilheiros" | "matamata";

const GROUPS = ["Todos", "Grupo A", "Grupo B", "Grupo C", "Grupo D", "Grupo E", "Grupo F", "Grupo G", "Grupo H", "Grupo I", "Grupo J", "Grupo K", "Grupo L"];

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "placares", label: "Placares", icon: <Trophy className="w-4 h-4" /> },
  { id: "grupos", label: "Grupos", icon: <LayoutGrid className="w-4 h-4" /> },
  { id: "artilheiros", label: "Artilheiros", icon: <Target className="w-4 h-4" /> },
  { id: "matamata", label: "Mata-mata", icon: <GitBranch className="w-4 h-4" /> },
];

export default function Scoreboard() {
  const [activeTab, setActiveTab] = useState<Tab>("placares");
  const [activeGroup, setActiveGroup] = useState("Todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [cachedData, setCachedData] = useState<Copa2026ScoresResponse | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<ExtendedMatch | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    try {
      const cache = localStorage.getItem("copa2026_cache");
      if (cache) setCachedData(JSON.parse(cache));
    } catch { /* noop */ }
  }, []);

  const { data: apiData, isLoading, isError } = useGetCopa2026Scores({
    query: {
      queryKey: getGetCopa2026ScoresQueryKey(),
      refetchInterval: (query) => {
        const matches = query.state.data?.matches;
        const hasLive = Array.isArray(matches) && matches.some((m) => m.status === "LIVE");
        return hasLive ? 30_000 : 60_000;
      },
    }
  });

  useEffect(() => {
    if (apiData) {
      try {
        localStorage.setItem("copa2026_cache", JSON.stringify(apiData));
        setCachedData(apiData);
      } catch { /* noop */ }
    }
  }, [apiData]);

  const data = apiData || cachedData;
  const isFallback = isError || (!apiData && !!cachedData);

  const filteredMatches = useMemo(() => {
    if (!data?.matches) return [];
    return (data.matches as ExtendedMatch[]).filter(match => {
      const matchesGroup = activeGroup === "Todos" || match.group === activeGroup.replace("Grupo ", "");
      const q = searchQuery.toLowerCase();
      const matchesSearch = !q ||
        match.homeTeam.name.toLowerCase().includes(q) ||
        match.awayTeam.name.toLowerCase().includes(q);
      return matchesGroup && matchesSearch;
    });
  }, [data, activeGroup, searchQuery]);

  const stats = useMemo(() => ({
    total: filteredMatches.length,
    live: filteredMatches.filter(m => m.status === "LIVE").length,
    finished: filteredMatches.filter(m => m.status === "FINISHED").length,
    pending: filteredMatches.filter(m => m.status === "PENDING").length,
  }), [filteredMatches]);

  const lastSyncText = useMemo(() => {
    if (!data?.updatedAt) return "";
    try {
      return format(new Date(data.updatedAt), "dd/MM/yyyy, HH:mm:ss", { locale: ptBR });
    } catch { return ""; }
  }, [data]);

  function handleMatchClick(match: ExtendedMatch) {
    setSelectedMatch(match);
    setDrawerOpen(true);
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Trophy className="w-8 h-8 text-primary" />
              <div>
                <h1 className="text-xl font-bold tracking-tight uppercase">Copa 2026</h1>
                <p className="text-xs text-primary font-medium tracking-widest">Placares ao Vivo</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <div className="flex items-center justify-between sm:justify-end gap-3 text-xs">
                {lastSyncText && (
                  <span className="text-muted-foreground hidden sm:inline">Atualizado: {lastSyncText}</span>
                )}
                {isFallback ? (
                  <span className="flex items-center gap-1.5 px-2 py-1 bg-muted rounded border border-border text-muted-foreground font-medium">
                    <WifiOff className="w-3 h-3" />
                    Fallback Local
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 px-2 py-1 bg-primary/10 rounded border border-primary/30 text-primary font-medium">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    API Ao Vivo
                  </span>
                )}
              </div>

              {activeTab === "placares" && (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar seleção..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-full sm:w-[200px] bg-card border-border focus-visible:ring-primary"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Stats bar — only on placares tab */}
          {activeTab === "placares" && (
            <div className="mt-4 flex items-center gap-2 text-xs overflow-x-auto scrollbar-hide">
              <span className="shrink-0 text-muted-foreground">
                <span className="font-bold text-foreground">{stats.total}</span> partidas
              </span>
              <span className="text-border shrink-0">·</span>
              <span className="flex items-center gap-1.5 shrink-0">
                <span className="w-2 h-2 rounded-full bg-[#ef4444] shrink-0" />
                <span className="font-bold text-[#ef4444]">{stats.live}</span>
                <span className="text-muted-foreground">ao vivo</span>
              </span>
              <span className="text-border shrink-0">·</span>
              <span className="flex items-center gap-1.5 shrink-0">
                <span className="w-2 h-2 rounded-full bg-[#22c55e] shrink-0" />
                <span className="font-bold text-[#22c55e]">{stats.finished}</span>
                <span className="text-muted-foreground">encerrados</span>
              </span>
              <span className="text-border shrink-0">·</span>
              <span className="flex items-center gap-1.5 shrink-0">
                <span className="w-2 h-2 rounded-full bg-[#6b7280] shrink-0" />
                <span className="font-bold text-[#6b7280]">{stats.pending}</span>
                <span className="text-muted-foreground">pendentes</span>
              </span>
            </div>
          )}

          {/* Tab navigation */}
          <div className="mt-4 flex gap-1 overflow-x-auto scrollbar-hide -mx-1 px-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border shrink-0
                  ${activeTab === tab.id
                    ? "bg-primary text-primary-foreground border-primary shadow-[0_0_12px_rgba(255,215,0,0.25)]"
                    : "bg-card/50 text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
                  }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* ── Placares ── */}
        {activeTab === "placares" && (
          <>
            {/* Group Filter Pills */}
            <div className="flex overflow-x-auto pb-4 mb-6 gap-2 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
              {GROUPS.map((group) => (
                <button
                  key={group}
                  onClick={() => setActiveGroup(group)}
                  className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${
                    activeGroup === group
                      ? "bg-primary text-primary-foreground border-primary shadow-[0_0_15px_rgba(255,215,0,0.3)]"
                      : "bg-card text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                  }`}
                >
                  {group}
                </button>
              ))}
            </div>

            {/* Match Grid */}
            {isLoading && !data ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="h-[180px] rounded-xl bg-card border border-border" />
                ))}
              </div>
            ) : filteredMatches.length === 0 ? (
              <div className="text-center py-20">
                <Trophy className="w-12 h-12 text-muted mx-auto mb-4 opacity-50" />
                <h2 className="text-xl font-bold mb-2">Nenhum jogo encontrado</h2>
                <p className="text-muted-foreground">Não encontramos partidas para os filtros selecionados.</p>
                <button
                  onClick={() => { setActiveGroup("Todos"); setSearchQuery(""); }}
                  className="mt-6 text-primary hover:underline font-medium"
                >
                  Limpar filtros
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {filteredMatches.map((match, index) => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    index={index}
                    onClick={() => handleMatchClick(match)}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* ── Grupos ── */}
        {activeTab === "grupos" && <GroupStandings />}

        {/* ── Artilheiros ── */}
        {activeTab === "artilheiros" && <TopScorers />}

        {/* ── Mata-mata ── */}
        {activeTab === "matamata" && <Bracket />}
      </main>

      <MatchStatsDrawer
        match={selectedMatch}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  );
}
