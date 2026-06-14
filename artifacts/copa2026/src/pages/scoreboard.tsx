import React, { useState, useEffect, useMemo, useCallback } from "react";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Search, Trophy, LayoutGrid, Target, GitBranch } from "lucide-react";
import { useGetCopa2026Scores, getGetCopa2026ScoresQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { MatchCard } from "@/components/match-card";
import { MatchStatsDrawer } from "@/components/match-stats-drawer";
import { GroupStandings } from "@/components/group-standings";
import { TopScorers } from "@/components/top-scorers";
import { Bracket } from "@/components/bracket";
import { SiteHeader } from "@/components/site-header";
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
  const queryClient = useQueryClient();

  useEffect(() => {
    try {
      const cache = localStorage.getItem("copa2026_cache");
      if (cache) setCachedData(JSON.parse(cache));
    } catch { /* noop */ }
  }, []);

  const { data: apiData, isLoading, isError, isFetching } = useGetCopa2026Scores({
    query: {
      queryKey: getGetCopa2026ScoresQueryKey(),
      refetchInterval: (query) => {
        const matches = query.state.data?.matches;
        const hasLive = Array.isArray(matches) && matches.some((m) => m.status === "LIVE");
        return hasLive ? 15_000 : 45_000;
      },
    }
  });

  const handleRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: getGetCopa2026ScoresQueryKey() });
  }, [queryClient]);

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
    const statusOrder = { LIVE: 0, FINISHED: 1, PENDING: 2 } as const;
    return (data.matches as ExtendedMatch[])
      .filter(match => {
        const matchesGroup = activeGroup === "Todos" || match.group === activeGroup.replace("Grupo ", "");
        const q = searchQuery.toLowerCase();
        const matchesSearch = !q ||
          match.homeTeam.name.toLowerCase().includes(q) ||
          match.awayTeam.name.toLowerCase().includes(q);
        return matchesGroup && matchesSearch;
      })
      .sort((a, b) => {
        const sa = statusOrder[a.status as keyof typeof statusOrder] ?? 3;
        const sb = statusOrder[b.status as keyof typeof statusOrder] ?? 3;
        if (sa !== sb) return sa - sb;
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
  }, [data, activeGroup, searchQuery]);

  const liveMatches = useMemo(
    () => filteredMatches.filter(m => m.status === "LIVE"),
    [filteredMatches]
  );

  const otherMatches = useMemo(
    () => filteredMatches.filter(m => m.status !== "LIVE"),
    [filteredMatches]
  );

  const stats = useMemo(() => ({
    total: filteredMatches.length,
    live: filteredMatches.filter(m => m.status === "LIVE").length,
    finished: filteredMatches.filter(m => m.status === "FINISHED").length,
    pending: filteredMatches.filter(m => m.status === "PENDING").length,
  }), [filteredMatches]);

  const lastSyncText = useMemo(() => {
    if (!data?.updatedAt) return "";
    try {
      const d = new Date(data.updatedAt);
      return `Atualizado ${formatDistanceToNow(d, { addSuffix: true, locale: ptBR })}`;
    } catch { return ""; }
  }, [data]);

  function handleMatchClick(match: ExtendedMatch) {
    setSelectedMatch(match);
    setDrawerOpen(true);
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      <SiteHeader
        subtitle="Copa do Mundo 2026 · Placares ao vivo"
        lastSyncText={lastSyncText}
        isFallback={isFallback}
        isFetching={isFetching}
        onRefresh={handleRefresh}
      >
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
      </SiteHeader>

      <div className="sticky top-[73px] z-[9] border-b border-border bg-background/90 backdrop-blur">
        <div className="container mx-auto px-4 py-3 space-y-3">
          {activeTab === "placares" && (
            <div className="flex items-center gap-2 text-xs overflow-x-auto scrollbar-hide">
              <span className="shrink-0 text-muted-foreground">
                <span className="font-bold text-foreground">{stats.total}</span> partidas
              </span>
              <span className="text-border shrink-0">·</span>
              <span className="flex items-center gap-1.5 shrink-0">
                <span className="w-2 h-2 rounded-full bg-[#ef4444] shrink-0 animate-pulse" />
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

          <div className="flex gap-1 overflow-x-auto scrollbar-hide -mx-1 px-1">
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
      </div>

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
              <>
                {liveMatches.length > 0 && (
                  <section className="mb-8">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
                      </span>
                      <h2 className="text-sm font-bold uppercase tracking-wider text-red-500">
                        Ao vivo agora ({liveMatches.length})
                      </h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {liveMatches.map((match, index) => (
                        <MatchCard
                          key={match.id}
                          match={match}
                          index={index}
                          onClick={() => handleMatchClick(match)}
                        />
                      ))}
                    </div>
                  </section>
                )}

                {otherMatches.length > 0 && (
                  <section>
                    {liveMatches.length > 0 && (
                      <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">
                        Outras partidas
                      </h2>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {otherMatches.map((match, index) => (
                        <MatchCard
                          key={match.id}
                          match={match}
                          index={index}
                          onClick={() => handleMatchClick(match)}
                        />
                      ))}
                    </div>
                  </section>
                )}
              </>
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
