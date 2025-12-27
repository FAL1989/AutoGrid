"use client";

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: string;
}

function StatCard({
  title,
  value,
  change,
  changeType = "neutral",
  icon,
}: StatCardProps) {
  const changeColors = {
    positive: "text-green-500",
    negative: "text-red-500",
    neutral: "text-muted-foreground",
  };

  return (
    <div className="p-6 rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between">
        <span className="text-2xl">{icon}</span>
        {change && (
          <span className={`text-sm ${changeColors[changeType]}`}>{change}</span>
        )}
      </div>
      <div className="mt-4">
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-2xl font-bold mt-1">{value}</p>
      </div>
    </div>
  );
}

export function StatsCards() {
  // TODO: Fetch real stats from API
  const stats = [
    {
      title: "Total P&L",
      value: "$1,234.56",
      change: "+12.5%",
      changeType: "positive" as const,
      icon: "💰",
    },
    {
      title: "Active Bots",
      value: "2",
      icon: "🤖",
    },
    {
      title: "Total Trades",
      value: "156",
      change: "+23 today",
      changeType: "positive" as const,
      icon: "📊",
    },
    {
      title: "Win Rate",
      value: "68.5%",
      change: "+2.1%",
      changeType: "positive" as const,
      icon: "🎯",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <StatCard key={stat.title} {...stat} />
      ))}
    </div>
  );
}
