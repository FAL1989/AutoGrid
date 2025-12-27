import { StatsCards } from "@/components/dashboard/stats-cards";
import { BotsList } from "@/components/dashboard/bots-list";
import { RecentTrades } from "@/components/dashboard/recent-trades";
import { PnLChart } from "@/components/dashboard/pnl-chart";

export default function DashboardPage() {
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

      <BotsList />
    </div>
  );
}
