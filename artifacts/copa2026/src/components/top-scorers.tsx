import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetCopa2026TopScorers, getGetCopa2026TopScorersQueryKey } from "@workspace/api-client-react";
import type { TopScorer } from "@workspace/api-client-react";
import { Target } from "lucide-react";

const SCORERS_CACHE_KEY = "copa2026_topscorers_cache";

function PlayerPhoto({ photo, name }: { photo: string | null; name: string }) {
  const [err, setErr] = React.useState(false);
  const initials = name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();

  if (photo && !err) {
    return (
      <img
        src={photo}
        alt={name}
        className="w-10 h-10 rounded-full object-cover bg-muted border border-border"
        onError={() => setErr(true)}
      />
    );
  }
  return (
    <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-bold text-primary">
      {initials}
    </div>
  );
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <span className="text-lg">🥇</span>;
  if (rank === 2) return <span className="text-lg">🥈</span>;
  if (rank === 3) return <span className="text-lg">🥉</span>;
  return (
    <span className="w-6 text-center text-sm font-bold text-muted-foreground">{rank}</span>
  );
}

export function TopScorers() {
  const [cachedScorers, setCachedScorers] = React.useState<TopScorer[] | null>(null);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(SCORERS_CACHE_KEY);
      if (raw) setCachedScorers(JSON.parse(raw));
    } catch { /* noop */ }
  }, []);

  const { data, isLoading, isError } = useGetCopa2026TopScorers({
    query: { queryKey: getGetCopa2026TopScorersQueryKey(), refetchInterval: 300_000 }
  });

  React.useEffect(() => {
    if (Array.isArray(data) && data.length > 0) {
      try {
        localStorage.setItem(SCORERS_CACHE_KEY, JSON.stringify(data));
        setCachedScorers(data);
      } catch { /* noop */ }
    }
  }, [data]);

  if (isLoading && !cachedScorers) {
    return (
      <div className="max-w-2xl mx-auto space-y-3">
        {Array.from({ length: 10 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-xl bg-card border border-border" />
        ))}
      </div>
    );
  }

  const scorers = (Array.isArray(data) && data.length > 0 ? data : cachedScorers) ?? [];
  const isFallback = isError || (!data?.length && !!cachedScorers?.length);

  if (scorers.length === 0) {
    return (
      <div className="text-center py-20">
        <Target className="w-12 h-12 text-muted mx-auto mb-4 opacity-50" />
        <h2 className="text-xl font-bold mb-2">Ainda sem artilheiros</h2>
        <p className="text-muted-foreground">Os dados serão atualizados conforme os jogos acontecem.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {isFallback && (
        <p className="text-center text-xs text-amber-500/90 mb-2">
          Dados em cache — reconectando…
        </p>
      )}
      {scorers.length >= 3 && (
        <div className="grid grid-cols-3 gap-2 mb-6 items-end pt-2">
          {[scorers[1], scorers[0], scorers[2]].map((scorer, i) => {
            const heights = ["h-24", "h-32", "h-20"];
            return (
              <div
                key={scorer.player}
                style={{ order: i === 0 ? 1 : i === 1 ? 0 : 2 }}
                className={`flex flex-col items-center text-center ${i === 1 ? "-mt-2" : ""}`}
              >
                <PlayerPhoto photo={scorer.photo} name={scorer.player} />
                <p className="text-xs font-bold mt-2 truncate w-full px-1">{scorer.player.split(" ").pop()}</p>
                <p className="text-[10px] text-muted-foreground">{scorer.teamFlag}</p>
                <div className={`mt-2 w-full rounded-t-xl bg-primary/10 border border-primary/20 flex flex-col items-center justify-end ${heights[i]} py-2`}>
                  <span className="text-2xl">{scorer.rank === 1 ? "🥇" : scorer.rank === 2 ? "🥈" : "🥉"}</span>
                  <span className="text-xl font-black text-primary tabular-nums">{scorer.goals}</span>
                  <span className="text-[9px] text-muted-foreground uppercase">gols</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {scorers.map((scorer) => (
        <div
          key={scorer.player}
          className={`flex items-center gap-4 p-4 rounded-xl border transition-colors
            ${scorer.rank <= 3
              ? "bg-primary/5 border-primary/20"
              : "bg-card border-border"
            }`}
        >
          <div className="flex items-center justify-center w-8 shrink-0">
            <RankBadge rank={scorer.rank} />
          </div>

          <PlayerPhoto photo={scorer.photo} name={scorer.player} />

          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground truncate">{scorer.player}</p>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <span>{scorer.teamFlag}</span>
              <span>{scorer.team}</span>
            </p>
          </div>

          <div className="flex items-center gap-4 shrink-0 text-right">
            <div>
              <p className="text-2xl font-bold text-primary leading-none">{scorer.goals}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide mt-0.5">gols</p>
            </div>
            {scorer.assists > 0 ? (
              <div>
                <p className="text-lg font-semibold text-muted-foreground leading-none">{scorer.assists}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide mt-0.5">assists</p>
              </div>
            ) : scorer.rank <= 5 ? (
              <div className="opacity-40">
                <p className="text-lg font-semibold text-muted-foreground leading-none">0</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide mt-0.5">assists</p>
              </div>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}
