"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: "📊" },
  { name: "My Bots", href: "/dashboard/bots", icon: "🤖" },
  { name: "Backtest", href: "/dashboard/backtest", icon: "📈" },
  { name: "Settings", href: "/dashboard/settings", icon: "⚙️" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-border bg-card flex flex-col">
      <div className="p-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">🤖</span>
          <span className="text-xl font-bold">AutoGrid</span>
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <div className="p-4 rounded-lg bg-muted">
          <p className="text-sm font-medium">Free Plan</p>
          <p className="text-xs text-muted-foreground">1 bot limit</p>
          <Link
            href="/dashboard/upgrade"
            className="mt-2 block text-sm text-primary hover:underline"
          >
            Upgrade to Pro
          </Link>
        </div>
      </div>
    </aside>
  );
}
