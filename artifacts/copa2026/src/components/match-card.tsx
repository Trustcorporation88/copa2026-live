import React, { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Copa2026Match } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crosshair, Target } from "lucide-react";

interface MatchCardProps {
  match: Copa2026Match & { theSportsDbId?: string | null };
  index: number;
  onClick: () => void;
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

function LiveStatsRow({
  stats,
}: {
  stats?: {
    shotsOnGoal: [number, number];
    totalShots?: [number, number];
    cornerKicks: [number, number];
    yellowCards: [number, number];
  } | null;
}) {
  if (!stats) return null;
  const onTarget = stats.shotsOnGoal;
  const total = stats.totalShots ?? stats.shotsOnGoal;
  return (
    <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
      <div className="flex items-center gap-1" title="Chutes a Gol">
        <Crosshair className="w-3 h-3" />
        <span className="tabular-nums">{onTarget[0]}-{onTarget[1]}</span>
      </div>
      <div className="flex items-center gap-1" title="Total de Chutes">
        <Target className="w-3 h-3" />
        <span className="tabular-nums">{total[0]}-{total[1]}</span>
      </div>
    </div>
  );
}

export function MatchCard({ match, index, onClick }: MatchCardProps) {
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
      <button
        onClick={onClick}
        className="w-full h-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl"
        aria-label={`${match.homeTeam.name} vs ${match.awayTeam.name} — ver detalhes`}
      >
        <Card className="h-full border-border bg-card hover:border-primary/60 hover:shadow-[0_0_20px_rgba(255,215,0,0.12)] active:scale-[0.98] transition-all duration-200 relative overflow-hidden group cursor-pointer">
          <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

          <CardContent className="p-4 flex flex-col h-full">
            <div className="flex justify-between items-start mb-3">
              <Badge variant="outline" className="text-xs bg-background/50 border-border text-muted-foreground uppercase tracking-wider font-semibold">
                Grupo {match.group}
              </Badge>

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
                {isFinished && <span className="text-xs font-bold text-green-500">ENCERRADO</span>}
                {isPending && <span className="text-xs font-bold text-muted-foreground">AGUARDANDO</span>}
              </div>
            </div>

            <div className="flex-1 flex flex-col justify-center space-y-2.5 mb-3">
              <div className="flex justify-between items-center gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xl shrink-0" aria-hidden="true">{match.homeTeam.flag}</span>
                  <span className="font-semibold text-sm sm:text-base leading-tight truncate">{match.homeTeam.name}</span>
                </div>
                <AnimatePresence mode="popLayout">
                  <motion.span
                    key={`home-${homeFlashKey}`}
                    initial={homeFlashKey > 0 ? { scale: 1.4, color: "#FFD700", textShadow: "0 0 16px #FFD70088" } : false}
                    animate={{ scale: 1, color: "var(--color-primary)", textShadow: "none" }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className="text-2xl font-black tabular-nums text-primary shrink-0"
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
                  <span className="text-xl shrink-0" aria-hidden="true">{match.awayTeam.flag}</span>
                  <span className="font-semibold text-sm sm:text-base leading-tight truncate">{match.awayTeam.name}</span>
                </div>
                <AnimatePresence mode="popLayout">
                  <motion.span
                    key={`away-${awayFlashKey}`}
                    initial={awayFlashKey > 0 ? { scale: 1.4, color: "#FFD700", textShadow: "0 0 16px #FFD70088" } : false}
                    animate={{ scale: 1, color: "var(--color-primary)", textShadow: "none" }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className="text-2xl font-black tabular-nums text-primary shrink-0"
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

            <div className="mt-auto pt-3 border-t border-border/50 text-xs text-muted-foreground flex flex-col gap-1">
              <div className="flex justify-between">
                <span>{format(parseISO(match.date), "dd/MM · EEE", { locale: ptBR })}</span>
                <span className="text-primary/70 group-hover:text-primary transition-colors shrink-0">Ver stats →</span>
              </div>
              <div className="truncate" title={match.venue}>{match.venue}</div>
            </div>
          </CardContent>
        </Card>
      </button>
    </motion.div>
  );
}
