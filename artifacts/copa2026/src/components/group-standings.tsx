import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetCopa2026Standings, getGetCopa2026StandingsQueryKey } from "@workspace/api-client-react";
import type { GroupStanding, StandingEntry } from "@workspace/api-client-react";
import { LayoutGrid } from "lucide-react";

function TeamBadge({ badge, flag, name }: { badge?: string | null; flag: string; name: string }) {
  const [err, setErr] = React.useState(false);
  if (badge && !err) {
    return (
      <img
        src={badge}
        alt={name}
        className="w-5 h-5 object-contain shrink-0"
        onError={() => setErr(true)}
      />
    );
  }
  return <span className="text-base leading-none">{flag}</span>;
}

function GroupTable({ group, entries }: { group: string; entries: StandingEntry[] }) {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="px-4 py-2.5 bg-primary/10 border-b border-border flex items-center gap-2">
        <span className="text-primary font-bold text-sm tracking-wider">GRUPO {group}</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border text-muted-foreground">
              <th className="text-left px-3 py-2 font-medium w-6">#</th>
              <th className="text-left px-3 py-2 font-medium">Seleção</th>
              <th className="text-center px-2 py-2 font-medium">J</th>
              <th className="text-center px-2 py-2 font-medium">V</th>
              <th className="text-center px-2 py-2 font-medium">E</th>
              <th className="text-center px-2 py-2 font-medium">D</th>
              <th className="text-center px-2 py-2 font-medium">GP</th>
              <th className="text-center px-2 py-2 font-medium">GC</th>
              <th className="text-center px-2 py-2 font-medium">SG</th>
              <th className="text-center px-2 py-2 font-medium font-bold text-foreground">PTS</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, i) => {
              const advances = i < 2;
              return (
                <tr
                  key={entry.team}
                  className={`border-b border-border/50 last:border-0 transition-colors ${advances ? "bg-primary/5" : ""}`}
                >
                  <td className="px-3 py-2.5 text-center">
                    {advances ? (
                      <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
                        {i + 1}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">{i + 1}</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2 min-w-[120px]">
                      <TeamBadge badge={entry.badge} flag={entry.flag} name={entry.team} />
                      <span className={`truncate ${advances ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                        {entry.team}
                      </span>
                    </div>
                  </td>
                  <td className="text-center px-2 py-2.5 text-muted-foreground">{entry.played}</td>
                  <td className="text-center px-2 py-2.5 text-muted-foreground">{entry.won}</td>
                  <td className="text-center px-2 py-2.5 text-muted-foreground">{entry.drawn}</td>
                  <td className="text-center px-2 py-2.5 text-muted-foreground">{entry.lost}</td>
                  <td className="text-center px-2 py-2.5 text-muted-foreground">{entry.gf}</td>
                  <td className="text-center px-2 py-2.5 text-muted-foreground">{entry.ga}</td>
                  <td className={`text-center px-2 py-2.5 ${entry.gd > 0 ? "text-green-400" : entry.gd < 0 ? "text-red-400" : "text-muted-foreground"}`}>
                    {entry.gd > 0 ? `+${entry.gd}` : entry.gd}
                  </td>
                  <td className="text-center px-2 py-2.5 font-bold text-foreground">{entry.pts}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function GroupStandings() {
  const { data, isLoading } = useGetCopa2026Standings({
    query: { queryKey: getGetCopa2026StandingsQueryKey(), refetchInterval: 60_000 }
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton key={i} className="h-[220px] rounded-xl bg-card border border-border" />
        ))}
      </div>
    );
  }

  const standings = (data as GroupStanding[] | undefined) ?? [];

  if (standings.length === 0) {
    return (
      <div className="text-center py-20">
        <LayoutGrid className="w-12 h-12 text-muted mx-auto mb-4 opacity-50" />
        <h2 className="text-xl font-bold mb-2">Classificação indisponível</h2>
        <p className="text-muted-foreground">Tente novamente em instantes.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className="inline-block w-3 h-3 rounded-sm bg-primary/20 border border-primary/40" />
        <span>Classificado para fase eliminatória (top 2 do grupo)</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {standings.map((g) => (
          <GroupTable key={g.group} group={g.group} entries={g.entries} />
        ))}
      </div>
    </div>
  );
}
