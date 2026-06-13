import React, { useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { X, MapPin, Calendar, Users, BarChart2, AlertCircle, Activity } from "lucide-react";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import type { Copa2026Match } from "@workspace/api-client-react";

interface Player {
  name: string;
  number: number;
  position: string;
  isSub: boolean;
}

interface Stat {
  name: string;
  home: number;
  away: number;
}

interface TimelineEvent {
  minute: number;
  type: string;
  team: "home" | "away";
  player: string;
  assist?: string;
}

interface StatsData {
  stats: Stat[];
  lineup: { home: Player[]; away: Player[] };
  timeline: TimelineEvent[];
}

interface MatchStatsDrawerProps {
  match: (Copa2026Match & { theSportsDbId?: string | null; thumbnail?: string | null }) | null;
  open: boolean;
  onClose: () => void;
}

function TeamBadge({ badge, flag, name }: { badge?: string | null; flag: string; name: string }) {
  const [imgErr, setImgErr] = React.useState(false);
  if (badge && !imgErr) {
    return (
      <img
        src={badge}
        alt={name}
        className="w-12 h-12 sm:w-16 sm:h-16 object-contain drop-shadow-md"
        onError={() => setImgErr(true)}
      />
    );
  }
  return <span className="text-4xl sm:text-5xl">{flag}</span>;
}

function StatBar({ stat }: { stat: Stat }) {
  const total = (stat.home + stat.away) || 1;
  const homeP = Math.round((stat.home / total) * 100);
  const awayP = 100 - homeP;
  return (
    <div className="mb-3">
      <div className="flex justify-between items-center text-sm mb-1">
        <span className="font-bold tabular-nums w-8 text-left">{stat.home}</span>
        <span className="text-xs text-muted-foreground flex-1 text-center">{stat.name}</span>
        <span className="font-bold tabular-nums w-8 text-right">{stat.away}</span>
      </div>
      <div className="flex h-1.5 rounded-full overflow-hidden bg-secondary/50">
        <div
          className="bg-primary rounded-l-full transition-all duration-700"
          style={{ width: `${homeP}%` }}
        />
        <div
          className="bg-muted-foreground/40 rounded-r-full transition-all duration-700"
          style={{ width: `${awayP}%` }}
        />
      </div>
    </div>
  );
}

function PlayerRow({ player }: { player: Player }) {
  return (
    <div className={`flex items-center gap-2 py-1 text-sm ${player.isSub ? "opacity-60" : ""}`}>
      <span className="w-6 text-center text-xs font-mono text-muted-foreground">{player.number || "—"}</span>
      <span className="flex-1 truncate font-medium">{player.name}</span>
      <span className="text-xs px-1.5 py-0.5 rounded bg-secondary text-muted-foreground font-mono">{player.position}</span>
    </div>
  );
}

export function MatchStatsDrawer({ match, open, onClose }: MatchStatsDrawerProps) {
  const [statsData, setStatsData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!open || !match?.theSportsDbId) {
      setStatsData(null);
      return;
    }
    setLoading(true);
    setError(false);
    const base = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";
    fetch(`${base}/api/copa2026/match/${match.theSportsDbId}/stats`)
      .then(r => r.json())
      .then((d: StatsData) => { setStatsData(d); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, [open, match?.theSportsDbId]);

  if (!match) return null;

  const isLive = match.status === "LIVE";
  const isFinished = match.status === "FINISHED";
  const hasScore = match.homeScore !== null && match.awayScore !== null;

  let dateStr = "";
  try {
    dateStr = format(parseISO(match.date), "dd/MM/yyyy · HH:mm", { locale: ptBR });
  } catch { /* noop */ }

  const hasStats = statsData && statsData.stats.length > 0;
  const hasLineup = statsData && (statsData.lineup.home.length > 0 || statsData.lineup.away.length > 0);

  return (
    <Sheet open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md bg-background border-l border-border p-0 overflow-y-auto flex flex-col"
      >
        <SheetHeader className="sr-only">
          <SheetTitle>Detalhes da partida</SheetTitle>
        </SheetHeader>

        {/* Score Header */}
        <div className="relative bg-card border-b border-border px-5 pt-10 pb-5">
          <SheetClose className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </SheetClose>

          <div className="flex items-center justify-between gap-2 mb-4">
            <Badge variant="outline" className="text-xs uppercase tracking-wider font-semibold">
              Grupo {match.group}
            </Badge>
            {isLive && (
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                </span>
                <span className="text-xs font-bold text-red-500">AO VIVO</span>
              </div>
            )}
            {isFinished && <span className="text-xs font-bold text-green-500">ENCERRADO</span>}
            {!isLive && !isFinished && <span className="text-xs font-bold text-muted-foreground">AGUARDANDO</span>}
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 flex flex-col items-center gap-2 min-w-0">
              <TeamBadge badge={(match.homeTeam as { badge?: string | null }).badge} flag={match.homeTeam.flag} name={match.homeTeam.name} />
              <span className="text-xs sm:text-sm font-semibold text-center leading-tight w-full truncate px-1">{match.homeTeam.name}</span>
            </div>

            <div className="flex flex-col items-center gap-1 shrink-0">
              {hasScore ? (
                <div className="flex items-center gap-2">
                  <span className="text-4xl sm:text-5xl font-black tabular-nums text-primary">{match.homeScore}</span>
                  <span className="text-xl sm:text-2xl text-muted-foreground font-light">–</span>
                  <span className="text-4xl sm:text-5xl font-black tabular-nums text-primary">{match.awayScore}</span>
                </div>
              ) : (
                <span className="text-2xl sm:text-3xl font-light text-muted-foreground">vs</span>
              )}
            </div>

            <div className="flex-1 flex flex-col items-center gap-2 min-w-0">
              <TeamBadge badge={(match.awayTeam as { badge?: string | null }).badge} flag={match.awayTeam.flag} name={match.awayTeam.name} />
              <span className="text-xs sm:text-sm font-semibold text-center leading-tight w-full truncate px-1">{match.awayTeam.name}</span>
            </div>
          </div>

          {/* Thumbnail */}
          {match.thumbnail && (
            <div className="mt-4 rounded-lg overflow-hidden -mx-1">
              <img
                src={match.thumbnail}
                alt={`${match.homeTeam.name} vs ${match.awayTeam.name}`}
                className="w-full h-28 object-cover opacity-80"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
            </div>
          )}

          <div className="mt-4 flex flex-col gap-1 text-xs text-muted-foreground">
            {dateStr && (
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3 h-3" />
                <span>{dateStr}</span>
              </div>
            )}
            {match.venue && (
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3 h-3" />
                <span>{match.venue}</span>
              </div>
            )}
          </div>
        </div>

        {/* Stats Section */}
        <div className="px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2 mb-4">
            <BarChart2 className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-bold uppercase tracking-wider">Estatísticas</h3>
          </div>

          {loading && (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full rounded bg-card" />
              ))}
            </div>
          )}

          {!loading && error && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
              <AlertCircle className="w-4 h-4" />
              <span>Estatísticas não disponíveis para esta partida.</span>
            </div>
          )}

          {!loading && !error && !match.theSportsDbId && (
            <p className="text-sm text-muted-foreground py-4">
              Estatísticas disponíveis após o início da partida.
            </p>
          )}

          {!loading && !error && hasStats && (
            <div>
              {/* Labels */}
              <div className="flex justify-between text-xs text-muted-foreground mb-3 pb-2 border-b border-border/50">
                <span className="font-medium">{match.homeTeam.name}</span>
                <span className="font-medium">{match.awayTeam.name}</span>
              </div>
              {statsData!.stats.map((stat, i) => (
                <StatBar key={i} stat={stat} />
              ))}
            </div>
          )}

          {!loading && !error && match.theSportsDbId && !hasStats && !loading && (
            <p className="text-sm text-muted-foreground py-4">
              Estatísticas serão exibidas após o início da partida.
            </p>
          )}
        </div>

        {/* Timeline Section — only shown when api-sports data is available */}
        {!loading && statsData && statsData.timeline && statsData.timeline.length > 0 && (() => {
          const homeEvents = statsData.timeline.filter(e => e.team === "home");
          const awayEvents = statsData.timeline.filter(e => e.team === "away");

          const eventIcon = (type: string) => {
            if (type === "GOAL") return "⚽";
            if (type === "YELLOW") return "🟨";
            if (type === "RED") return "🟥";
            if (type === "YELLOW_RED") return "🟨🟥";
            if (type === "VAR") return "📺";
            return "•";
          };

          const EventItem = ({ ev, align }: { ev: TimelineEvent; align: "left" | "right" }) => (
            <div className={`flex items-start gap-1.5 mb-2 ${align === "right" ? "flex-row-reverse text-right" : ""}`}>
              <span className="text-sm mt-px">{eventIcon(ev.type)}</span>
              <div>
                <span className="text-xs font-semibold text-foreground">{ev.player}</span>
                {ev.assist && <span className="block text-xs text-muted-foreground">{ev.assist}</span>}
                <span className="text-xs text-muted-foreground font-mono">{ev.minute}'</span>
              </div>
            </div>
          );

          return (
            <div className="px-5 py-4 border-b border-border">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-bold uppercase tracking-wider">Lances</h3>
              </div>
              <div className="grid grid-cols-2 gap-x-4">
                <div>
                  <p className="text-xs font-semibold text-primary mb-2 truncate">{match.homeTeam.name}</p>
                  {homeEvents.length > 0
                    ? homeEvents.map((ev, i) => <EventItem key={i} ev={ev} align="left" />)
                    : <p className="text-xs text-muted-foreground">—</p>}
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-2 truncate">{match.awayTeam.name}</p>
                  {awayEvents.length > 0
                    ? awayEvents.map((ev, i) => <EventItem key={i} ev={ev} align="right" />)
                    : <p className="text-xs text-muted-foreground">—</p>}
                </div>
              </div>
            </div>
          );
        })()}

        {/* Lineup Section */}
        <div className="px-5 py-4">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-bold uppercase tracking-wider">Escalação</h3>
          </div>

          {loading && (
            <div className="space-y-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-7 w-full rounded bg-card" />
              ))}
            </div>
          )}

          {!loading && hasLineup && (() => {
            const home = statsData!.lineup.home;
            const away = statsData!.lineup.away;
            const homeStarters = home.filter(p => !p.isSub);
            const awayStarters = away.filter(p => !p.isSub);
            const homeSubs = home.filter(p => p.isSub);
            const awaySubs = away.filter(p => p.isSub);

            return (
              <div className="grid grid-cols-2 gap-x-4">
                {/* Home */}
                <div>
                  <p className="text-xs font-semibold text-primary mb-2 truncate">{match.homeTeam.name}</p>
                  {homeStarters.map((p, i) => <PlayerRow key={i} player={p} />)}
                  {homeSubs.length > 0 && (
                    <>
                      <p className="text-xs text-muted-foreground mt-3 mb-1 font-medium">Reservas</p>
                      {homeSubs.map((p, i) => <PlayerRow key={i} player={p} />)}
                    </>
                  )}
                </div>
                {/* Away */}
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-2 truncate">{match.awayTeam.name}</p>
                  {awayStarters.map((p, i) => <PlayerRow key={i} player={p} />)}
                  {awaySubs.length > 0 && (
                    <>
                      <p className="text-xs text-muted-foreground mt-3 mb-1 font-medium">Reservas</p>
                      {awaySubs.map((p, i) => <PlayerRow key={i} player={p} />)}
                    </>
                  )}
                </div>
              </div>
            );
          })()}

          {!loading && !hasLineup && !error && (
            <p className="text-sm text-muted-foreground py-2">
              Escalação será divulgada antes do jogo.
            </p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
