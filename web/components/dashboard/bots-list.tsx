"use client";

import Link from "next/link";
import { useBots, useStartBot, useStopBot } from "@/hooks/use-bots";
import { Bot } from "@/lib/api";
import { BotCardSkeleton } from "@/components/ui/skeleton";
import { QueryError } from "@/components/ui/error-boundary";
import { ButtonSpinner } from "@/components/ui/spinner";
import { formatCurrency, formatPercent, getStatusColor } from "@/lib/utils";

const statusLabels = {
  running: "Running",
  stopped: "Stopped",
  paused: "Paused",
  error: "Error",
};

interface BotCardProps {
  bot: Bot;
  onStart: (id: string) => void;
  onStop: (id: string) => void;
  isStarting: boolean;
  isStopping: boolean;
}

function BotCard({ bot, onStart, onStop, isStarting, isStopping }: BotCardProps) {
  const totalPnl = bot.realized_pnl + bot.unrealized_pnl;
  const pnlColor = totalPnl >= 0 ? "text-green-500" : "text-red-500";
  const isLoading = isStarting || isStopping;

  return (
    <div className="p-4 rounded-lg border border-border bg-card hover:border-primary/50 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-xl">{bot.strategy === "grid" ? (
            <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
            </svg>
          ) : (
            <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}</span>
          <div>
            <h3 className="font-medium">{bot.name}</h3>
            <p className="text-sm text-muted-foreground">{bot.symbol}</p>
          </div>
        </div>
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(bot.status)}`}>
          {statusLabels[bot.status]}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-muted-foreground">Realized P&L</p>
          <p className={`font-medium ${bot.realized_pnl >= 0 ? "text-green-500" : "text-red-500"}`}>
            {formatCurrency(bot.realized_pnl)}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Unrealized P&L</p>
          <p className={`font-medium ${bot.unrealized_pnl >= 0 ? "text-green-500" : "text-red-500"}`}>
            {formatCurrency(bot.unrealized_pnl)}
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        {bot.status === "running" ? (
          <button
            onClick={() => onStop(bot.id)}
            disabled={isLoading}
            className="flex-1 px-3 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors disabled:opacity-50 flex items-center justify-center"
          >
            {isStopping && <ButtonSpinner />}
            Stop
          </button>
        ) : (
          <button
            onClick={() => onStart(bot.id)}
            disabled={isLoading}
            className="flex-1 px-3 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center"
          >
            {isStarting && <ButtonSpinner />}
            Start
          </button>
        )}
        <Link
          href={`/dashboard/bots/${bot.id}`}
          className="px-3 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  );
}

export function BotsList() {
  const { data: bots, isLoading, error, refetch } = useBots();
  const startBot = useStartBot();
  const stopBot = useStopBot();

  const handleStart = (id: string) => {
    startBot.mutate(id);
  };

  const handleStop = (id: string) => {
    stopBot.mutate(id);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">My Bots</h2>
          <Link
            href="/dashboard/bots/new"
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            + New Bot
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <BotCardSkeleton />
          <BotCardSkeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">My Bots</h2>
        </div>
        <QueryError error={error} reset={() => refetch()} title="Failed to load bots" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">My Bots</h2>
        <Link
          href="/dashboard/bots/new"
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          + New Bot
        </Link>
      </div>

      {!bots || bots.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-border rounded-lg">
          <svg
            className="w-12 h-12 mx-auto text-muted-foreground mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          <p className="text-muted-foreground mb-4">No bots created yet</p>
          <Link
            href="/dashboard/bots/new"
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors inline-block"
          >
            Create Your First Bot
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bots.map((bot) => (
            <BotCard
              key={bot.id}
              bot={bot}
              onStart={handleStart}
              onStop={handleStop}
              isStarting={startBot.isPending && startBot.variables === bot.id}
              isStopping={stopBot.isPending && stopBot.variables === bot.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
