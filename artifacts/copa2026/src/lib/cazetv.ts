/** CazéTV — exclusividade digital da Copa 2026 no YouTube (Brasil). */
export const CAZETV_CHANNEL = "https://www.youtube.com/@cazetv";
export const CAZETV_LIVE = "https://www.youtube.com/@cazetv/live";

export function getCazetvWatchUrl(match: {
  status: "PENDING" | "LIVE" | "FINISHED" | string;
  homeTeam: { name: string };
  awayTeam: { name: string };
}): string {
  if (match.status === "LIVE") return CAZETV_LIVE;
  const query = encodeURIComponent(
    `${match.homeTeam.name} x ${match.awayTeam.name} Copa do Mundo 2026`
  );
  return `${CAZETV_CHANNEL}/search?query=${query}`;
}

export function getCazetvWatchLabel(status: string): string {
  return status === "LIVE" ? "Assistir ao vivo" : "CazéTV";
}
