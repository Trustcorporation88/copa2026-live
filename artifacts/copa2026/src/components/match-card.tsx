import React, { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Copa2026Match } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crosshair, Target, Flag, Square, Youtube } from "lucide-react";
import { flagCdnUrl, flagIsoForTeam } from "@/lib/team-flags";
import { getCazetvWatchUrl, getCazetvWatchLabel } from "@/lib/cazetv";

interface MatchCardProps {
  match: Copa2026Match & { theSportsDbId?: string | null };
  index: number;
  onClick: () => void;
  featured?: boolean;
  kickoffLabel?: string;
}

function useScoreFlash(score: number | null) {
  const prevRef = useRef(score);
  const [flashKey, setFlashKey] = useState(0);

  useEffect(() => {
    if (
      prevRef.current !== score &&
      score !== null &&
      prevRef.current !== null
    ) {
      setFlashKey((k) => k + 1);
    }
    prevRef.current = score;
  }, [score]);

  return flashKey;
}

function TeamBadge({ badge, flag, name }: { badge?: string | null; flag: string; name: string }) {
  const [badgeErr, setBadgeErr] = useState(false);
  const [flagErr, setFlagErr] = useState(false);
  const iso = flagIsoForTeam(name);

  if (badge && !badgeErr) {
    return (
      <img
        src={badge}
        alt=""
        className="w-6 h-6 object-contain shrink-0"
        onError={() => setBadgeErr(true)}
      />
    );
  }
  if (iso && !flagErr) {
    return (
      <img
        src={flagCdnUrl(iso, 40)}
        alt=""
        className="w-6 h-4 object-cover rounded-sm shrink-0 border border-border/50"
        onError={() => setFlagErr(true)}
      />
    );
  }
  return <span className="text-xl shrink-0" aria-hidden="true">{flag}</span>;
}

function LiveStatsRow({
  stats,
}: {
  stats?: Copa2026Match["liveStats"];
}) {
  if (!stats) return null;
  const onTarget = stats.shotsOnGoal;
  const total = stats.totalShots ?? stats.shotsOnGoal;
  const corners = stats.cornerKicks;
  const yellows = stats.yellowCards;
  const reds = stats.redCards;
  const possession = stats.possession;
  const hasCorners = corners[0] > 0 || corners[1] > 0;
  const hasYellows = yellows[0] > 0 || yellows[1] > 0;
  const hasReds = reds && (reds[0] > 0 || reds[1] > 0);
  const hasPossession = possession && (possession[0] > 0 || possession[1] > 0);

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-muted-foreground">
      <div className="flex items-center gap-1" title="Chutes a Gol">
        <Crosshair className="w-3 h-3 text-primary/70" />
        <span className="tabular-nums font-medium">{onTarget[0]}-{onTarget[1]}</span>
      </div>
      <div className="flex items-center gap-1" title="Total de Chutes">
        <Target className="w-3 h-3 text-primary/70" />
        <span className="tabular-nums font-medium">{total[0]}-{total[1]}</span>
      </div>
      {hasPossession && (
        <div className="flex items-center gap-1" title="Posse de Bola (%)">
          <span className="text-[9px] opacity-70">Posse</span>
          <span className="tabular-nums font-medium">{possession![0]}-{possession![1]}</span>
        </div>
      )}
      {hasCorners && (
        <div className="flex items-center gap-1" title="Escanteios">
          <Flag className="w-3 h-3 text-sky-400/80" />
          <span className="tabular-nums font-medium">{corners[0]}-{corners[1]}</span>
        </div>
      )}
      {hasYellows && (
        <div className="flex items-center gap-1" title="Cartões Amarelos">
          <Square className="w-3 h-3 text-yellow-400 fill-yellow-400/80" />
          <span className="tabular-nums font-medium">{yellows[0]}-{yellows[1]}</span>
        </div>
      )}
      {hasReds && (
        <div className="flex items-center gap-1" title="Cartões Vermelhos">
          <Square className="w-3 h-3 text-red-500 fill-red-500/80" />
          <span className="tabular-nums font-medium">{reds![0]}-{reds![1]}</span>
        </div>
      )}
    </div>
  );
}

export function MatchCard({ match, index, onClick, featured = false, kickoffLabel }: MatchCardProps) {
  const isLive = match.status === "LIVE";
  const isFinished = match.status === "FINISHED";
  const isPending = match.status === "PENDING";

  const homeGoals = match.goalScorers?.home ?? [];
  const awayGoals = match.goalScorers?.away ?? [];

  const homeFlashKey = useScoreFlash(match.homeScore);
  const awayFlashKey = useScoreFlash(match.awayScore);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.03, 0.6) }}
      className="h-full"
    >
      <div
        role="button"
        tabIndex={0}
        onClick={onClick}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); } }}
        className="w-full h-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl cursor-pointer"
        aria-label={`${match.homeTeam.name} vs ${match.awayTeam.name} — ver detalhes`}
      >
        <Card className={`h-full border bg-card hover:border-primary/60 hover:shadow-[0_0_20px_rgba(255,215,0,0.12)] active:scale-[0.98] transition-all duration-200 relative overflow-hidden group cursor-pointer
          ${isLive ? "border-red-500/50 shadow-[0_0_24px_rgba(239,68,68,0.12)]" : "border-border"}
          ${featured ? "shadow-[0_0_32px_rgba(239,68,68,0.18)]" : ""}`}>
          <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

          <CardContent className={`flex flex-col h-full ${featured ? "p-5" : "p-4"}`}>
            <div className="flex justify-between items-start mb-3 gap-2">
              <div className="flex items-center gap-2 min-w-0">
                {kickoffLabel && (
                  <span className="text-sm font-black tabular-nums text-primary shrink-0">
                    {kickoffLabel}
                  </span>
                )}
                <Badge variant="outline" className="text-xs bg-background/50 border-border text-muted-foreground uppercase tracking-wider font-semibold">
                  Grupo {match.group}
                </Badge>
              </div>

              <div className="flex items-center gap-1.5">
                {isLive && (
                  <>
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                    </span>
                    <span className="text-xs font-bold text-red-500">AO VIVO</span>
                    {match.minute && (
                      <span className="text-xs font-bold text-red-400 tabular-nums">{match.minute}</span>
                    )}
                  </>
                )}
                {isFinished && (
                  <span className="text-xs font-bold text-green-500">
                    {match.homeScore !== null && match.awayScore !== null ? "ENCERRADO" : "SEM PLACAR"}
                  </span>
                )}
                {isPending && <span className="text-xs font-bold text-muted-foreground">AGUARDANDO</span>}
              </div>
            </div>

            <div className="flex-1 flex flex-col justify-center space-y-2.5 mb-3">
              <div className="flex justify-between items-center gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <TeamBadge badge={(match.homeTeam as { badge?: string | null }).badge} flag={match.homeTeam.flag} name={match.homeTeam.name} />
                  <span className={`font-semibold leading-tight truncate ${featured ? "text-base" : "text-sm sm:text-base"}`}>{match.homeTeam.name}</span>
                </div>
                <AnimatePresence mode="popLayout">
                  <motion.span
                    key={`home-${homeFlashKey}`}
                    initial={homeFlashKey > 0 ? { scale: 1.4, color: "#FFD700", textShadow: "0 0 16px #FFD70088" } : false}
                    animate={{ scale: 1, color: "var(--color-primary)", textShadow: "none" }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className={`font-black tabular-nums text-primary shrink-0 ${featured ? "text-3xl" : "text-2xl"}`}
                  >
                    {match.homeScore !== null ? match.homeScore : "—"}
                  </motion.span>
                </AnimatePresence>
              </div>

              {homeGoals.length > 0 && (
                <div className="pl-9 flex flex-wrap gap-x-2 gap-y-0.5">
                  {homeGoals.map((scorer, i) => (
                    <span key={i} className="text-[11px] text-muted-foreground leading-tight">
                      ⚽ {scorer}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex justify-between items-center gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <TeamBadge badge={(match.awayTeam as { badge?: string | null }).badge} flag={match.awayTeam.flag} name={match.awayTeam.name} />
                  <span className={`font-semibold leading-tight truncate ${featured ? "text-base" : "text-sm sm:text-base"}`}>{match.awayTeam.name}</span>
                </div>
                <AnimatePresence mode="popLayout">
                  <motion.span
                    key={`away-${awayFlashKey}`}
                    initial={awayFlashKey > 0 ? { scale: 1.4, color: "#FFD700", textShadow: "0 0 16px #FFD70088" } : false}
                    animate={{ scale: 1, color: "var(--color-primary)", textShadow: "none" }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className={`font-black tabular-nums text-primary shrink-0 ${featured ? "text-3xl" : "text-2xl"}`}
                  >
                    {match.awayScore !== null ? match.awayScore : "—"}
                  </motion.span>
                </AnimatePresence>
              </div>

              {awayGoals.length > 0 && (
                <div className="pl-9 flex flex-wrap gap-x-2 gap-y-0.5">
                  {awayGoals.map((scorer, i) => (
                    <span key={i} className="text-[11px] text-muted-foreground leading-tight">
                      ⚽ {scorer}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {(isLive || isFinished) && match.liveStats && (
              <div className="mb-2">
                <LiveStatsRow stats={match.liveStats} />
              </div>
            )}

            {featured && isLive && (
              <a
                href={getCazetvWatchUrl(match)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="mb-3 flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-bold transition-colors"
              >
                <Youtube className="w-4 h-4 shrink-0" />
                Assistir ao vivo na CazéTV
              </a>
            )}

            <div className="mt-auto pt-3 border-t border-border/50 text-xs text-muted-foreground flex flex-col gap-1">
              <div className="flex justify-between items-center gap-2">
                <span>
                  {kickoffLabel
                    ? `Hoje · ${kickoffLabel}`
                    : format(parseISO(match.date), "dd/MM · EEE", { locale: ptBR })}
                </span>
                <div className="flex items-center gap-3 shrink-0">
                  <a
                    href={getCazetvWatchUrl(match)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className={`inline-flex items-center gap-1 font-semibold transition-colors ${
                      isLive ? "text-red-500 hover:text-red-400" : "text-red-500/80 hover:text-red-400"
                    }`}
                    title="Transmissão oficial da Copa no YouTube — CazéTV"
                  >
                    <Youtube className="w-3.5 h-3.5" />
                    {getCazetvWatchLabel(match.status)}
                  </a>
                  <span className="text-primary/70">Ver stats →</span>
                </div>
              </div>
              <div className="truncate" title={match.venue}>{match.venue}</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
