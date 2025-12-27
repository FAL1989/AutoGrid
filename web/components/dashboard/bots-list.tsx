"use client";

import Link from "next/link";

interface Bot {
  id: string;
  name: string;
  strategy: "grid" | "dca";
  symbol: string;
  status: "running" | "stopped" | "paused" | "error";
  pnl: number;
  pnlPercent: number;
}

const statusColors = {
  running: "bg-green-500",
  stopped: "bg-gray-500",
  paused: "bg-yellow-500",
  error: "bg-red-500",
};

const statusLabels = {
  running: "Running",
  stopped: "Stopped",
  paused: "Paused",
  error: "Error",
};

function BotCard({ bot }: { bot: Bot }) {
  const pnlColor = bot.pnl >= 0 ? "text-green-500" : "text-red-500";
  const pnlSign = bot.pnl >= 0 ? "+" : "";

  return (
    <div className="p-4 rounded-lg border border-border bg-card hover:border-primary/50 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-xl">{bot.strategy === "grid" ? "📊" : "💰"}</span>
          <div>
            <h3 className="font-medium">{bot.name}</h3>
            <p className="text-sm text-muted-foreground">{bot.symbol}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${statusColors[bot.status]}`}
          />
          <span className="text-sm text-muted-foreground">
            {statusLabels[bot.status]}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">P&L</p>
          <p className={`font-medium ${pnlColor}`}>
            {pnlSign}${Math.abs(bot.pnl).toFixed(2)} ({pnlSign}
            {bot.pnlPercent.toFixed(1)}%)
          </p>
        </div>
        <div className="flex gap-2">
          {bot.status === "running" ? (
            <button className="px-3 py-1 text-sm border border-border rounded hover:bg-muted transition-colors">
              Pause
            </button>
          ) : (
            <button className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors">
              Start
            </button>
          )}
          <Link
            href={`/dashboard/bots/${bot.id}`}
            className="px-3 py-1 text-sm border border-border rounded hover:bg-muted transition-colors"
          >
            Details
          </Link>
        </div>
      </div>
    </div>
  );
}

export function BotsList() {
  // TODO: Fetch real bots from API
  const bots: Bot[] = [
    {
      id: "1",
      name: "BTC Grid Bot",
      strategy: "grid",
      symbol: "BTC/USDT",
      status: "running",
      pnl: 234.56,
      pnlPercent: 12.3,
    },
    {
      id: "2",
      name: "ETH DCA Bot",
      strategy: "dca",
      symbol: "ETH/USDT",
      status: "stopped",
      pnl: -45.23,
      pnlPercent: -2.1,
    },
  ];

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

      {bots.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-border rounded-lg">
          <p className="text-muted-foreground mb-4">No bots created yet</p>
          <Link
            href="/dashboard/bots/new"
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Create Your First Bot
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bots.map((bot) => (
            <BotCard key={bot.id} bot={bot} />
          ))}
        </div>
      )}
    </div>
  );
}
