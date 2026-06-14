import React from "react";
import { Trophy, WifiOff, RefreshCw } from "lucide-react";

interface SiteHeaderProps {
  subtitle?: string;
  lastSyncText?: string;
  isFallback?: boolean;
  isFetching?: boolean;
  onRefresh?: () => void;
  children?: React.ReactNode;
}

export function SiteHeader({
  subtitle = "Copa do Mundo 2026",
  lastSyncText,
  isFallback,
  isFetching,
  onRefresh,
  children,
}: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative shrink-0">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/30 to-primary/5 border border-primary/30 flex items-center justify-center shadow-[0_0_20px_rgba(255,215,0,0.15)]">
                <Trophy className="w-6 h-6 text-primary" />
              </div>
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-black tracking-tight truncate">
                <span className="text-primary">seliga</span>
                <span className="text-foreground">aqui</span>
                <span className="text-muted-foreground font-semibold text-sm">.online</span>
              </h1>
              <p className="text-xs text-muted-foreground font-medium tracking-wide truncate">{subtitle}</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex items-center justify-between sm:justify-end gap-3 text-xs">
              {lastSyncText && (
                <span className="text-muted-foreground tabular-nums">{lastSyncText}</span>
              )}
              {isFallback ? (
                <span className="flex items-center gap-1.5 px-2.5 py-1 bg-muted rounded-full border border-border text-muted-foreground font-medium">
                  <WifiOff className="w-3 h-3" />
                  Cache local
                </span>
              ) : (
                <span className="flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 rounded-full border border-primary/30 text-primary font-medium">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                  </span>
                  Ao vivo
                </span>
              )}
              {onRefresh && (
                <button
                  onClick={onRefresh}
                  disabled={isFetching}
                  className="p-1.5 rounded-full border border-border text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors disabled:opacity-50"
                  title="Atualizar agora"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`} />
                </button>
              )}
            </div>
            {children}
          </div>
        </div>
      </div>
    </header>
  );
}
