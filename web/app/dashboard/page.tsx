"use client";

import { StatsCards } from "@/components/dashboard/stats-cards";
import { BotsList } from "@/components/dashboard/bots-list";
import { RecentTrades } from "@/components/dashboard/recent-trades";
import { PnLChart } from "@/components/dashboard/pnl-chart";
import { GridVisualization } from "@/components/dashboard/grid-visualization";
import { useBots } from "@/hooks/use-bots";

export default function DashboardPage() {
  const { data: bots } = useBots();

  // Filter running grid bots for visualization
  const gridBots = bots?.filter(
    (bot) => bot.strategy === "grid" && bot.status === "running"
  ) || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your trading bots and performance
        </p>
      </div>

      <StatsCards />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PnLChart />
        <RecentTrades />
      </div>

      {/* Grid Visualization Section */}
      {gridBots.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Active Grid Bots</h2>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {gridBots.map((bot) => (
              <GridVisualization key={bot.id} botId={bot.id} />
            ))}
          </div>
        </div>
      )}

      <BotsList />
    </div>
  );
}
