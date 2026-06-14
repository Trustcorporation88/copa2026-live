import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetCopa2026Bracket, getGetCopa2026BracketQueryKey } from "@workspace/api-client-react";
import type { BracketMatch } from "@workspace/api-client-react";
import { GitBranch, Clock } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

function StatusBadge({ status }: { status: BracketMatch["status"] }) {
  if (status === "LIVE") {
    return (
      <span className="flex items-center gap-1 text-[10px] font-bold text-red-400 uppercase">
        <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
        Ao Vivo
      </span>
    );
  }
  if (status === "FINISHED") {
    return <span className="text-[10px] text-green-400 font-medium uppercase">Encerrado</span>;
  }
  return null;
}

function BracketCard({ match }: { match: BracketMatch }) {
  const isPending = match.status === "PENDING";
  const isFinished = match.status === "FINISHED";

  let dateStr = "";
  try {
    dateStr = format(parseISO(match.date), "dd/MM · HH:mm", { locale: ptBR });
  } catch { /* noop */ }

  const homeTbd = match.homeTeam === "A definir";
  const awayTbd = match.awayTeam === "A definir";

  return (
    <div className={`rounded-xl border overflow-hidden transition-colors
      ${match.status === "LIVE" ? "border-red-500/40 bg-red-950/10" : "border-border bg-card"}`}>
      {/* Header */}
      <div className="px-3 py-1.5 border-b border-border/50 flex items-center justify-between">
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <Clock className="w-3 h-3" />
          <span>{dateStr || "Data a definir"}</span>
        </div>
        <StatusBadge status={match.status} />
      </div>

      {/* Teams */}
      <div className="px-3 py-2 space-y-1.5">
        {/* Home */}
        <div className={`flex items-center justify-between gap-2 ${isFinished && match.homeScore !== null && match.awayScore !== null && match.homeScore > match.awayScore ? "opacity-100" : isFinished ? "opacity-60" : ""}`}>
          <div className={`flex items-center gap-2 min-w-0 ${homeTbd ? "opacity-50" : ""}`}>
            {!homeTbd && <span className="text-base leading-none shrink-0">{match.homeFlag}</span>}
            <span className="text-sm font-medium truncate">{match.homeTeam}</span>
          </div>
          {!isPending && match.homeScore !== null && (
            <span className={`text-base font-bold shrink-0 ${isFinished && match.homeScore > (match.awayScore ?? 0) ? "text-primary" : "text-foreground"}`}>
              {match.homeScore}
            </span>
          )}
        </div>

        <div className="border-t border-border/30" />

        {/* Away */}
        <div className={`flex items-center justify-between gap-2 ${isFinished && match.homeScore !== null && match.awayScore !== null && match.awayScore > match.homeScore ? "opacity-100" : isFinished ? "opacity-60" : ""}`}>
          <div className={`flex items-center gap-2 min-w-0 ${awayTbd ? "opacity-50" : ""}`}>
            {!awayTbd && <span className="text-base leading-none shrink-0">{match.awayFlag}</span>}
            <span className="text-sm font-medium truncate">{match.awayTeam}</span>
          </div>
          {!isPending && match.awayScore !== null && (
            <span className={`text-base font-bold shrink-0 ${isFinished && match.awayScore > (match.homeScore ?? 0) ? "text-primary" : "text-foreground"}`}>
              {match.awayScore}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

const STAGE_ICON: Record<string, string> = {
  "Rodada de 32": "32",
  "Oitavas de Final": "16",
  "Quartas de Final": "QF",
  "Semifinais": "SF",
  "3º Lugar": "3°",
  "Final": "🏆",
};

export function Bracket() {
  const { data, isLoading } = useGetCopa2026Bracket({
    query: { queryKey: getGetCopa2026BracketQueryKey(), refetchInterval: 300_000 }
  });

  if (isLoading) {
    return (
      <div className="space-y-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i}>
            <Skeleton className="h-6 w-40 mb-4 bg-card border border-border rounded-lg" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((_, j) => (
                <Skeleton key={j} className="h-24 rounded-xl bg-card border border-border" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  const matches = (data as BracketMatch[] | undefined) ?? [];

  if (matches.length === 0) {
    return (
      <div className="text-center py-20">
        <GitBranch className="w-12 h-12 text-muted mx-auto mb-4 opacity-50" />
        <h2 className="text-xl font-bold mb-2">Mata-mata ainda não definido</h2>
        <p className="text-muted-foreground">A fase eliminatória começa após o fim da fase de grupos.</p>
        <p className="text-xs text-muted-foreground mt-2 opacity-60">Previsão: a partir de 27 de junho de 2026</p>
      </div>
    );
  }

  const byStage = new Map<string, BracketMatch[]>();
  for (const m of matches) {
    if (!byStage.has(m.stage)) byStage.set(m.stage, []);
    byStage.get(m.stage)!.push(m);
  }

  const STAGE_ORDER = ["Rodada de 32", "Oitavas de Final", "Quartas de Final", "Semifinais", "3º Lugar", "Final"];
  const sortedStages = [...byStage.keys()].sort((a, b) => {
    const ia = STAGE_ORDER.indexOf(a);
    const ib = STAGE_ORDER.indexOf(b);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  });

  const getGridCols = (stage: string) => {
    if (stage === "Final" || stage === "3º Lugar") return "grid-cols-1 max-w-xs mx-auto";
    if (stage === "Semifinais") return "grid-cols-1 sm:grid-cols-2 max-w-lg mx-auto";
    if (stage === "Quartas de Final") return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";
    return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";
  };

  return (
    <div className="space-y-10">
      {sortedStages.map((stage) => {
        const stageMatches = byStage.get(stage)!;
        const icon = STAGE_ICON[stage] ?? "•";
        const isFinal = stage === "Final";

        return (
          <div key={stage}>
            <div className={`flex items-center gap-3 mb-4 ${isFinal ? "justify-center" : ""}`}>
              <div className={`flex items-center justify-center w-8 h-8 rounded-lg font-bold text-xs shrink-0
                ${isFinal ? "bg-primary text-primary-foreground text-lg w-10 h-10 rounded-xl" : "bg-primary/10 text-primary border border-primary/20"}`}>
                {icon}
              </div>
              <h3 className={`font-bold tracking-wide ${isFinal ? "text-primary text-xl" : "text-foreground"}`}>
                {stage}
              </h3>
              <span className="text-xs text-muted-foreground">({stageMatches.length} jogos)</span>
            </div>
            <div className={`grid gap-3 ${getGridCols(stage)}`}>
              {stageMatches.map((m) => (
                <BracketCard key={m.id} match={m} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
