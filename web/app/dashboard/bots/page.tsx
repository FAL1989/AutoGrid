"use client";

import { BotsList } from "@/components/dashboard/bots-list";

export default function BotsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Bots</h1>
        <p className="text-muted-foreground">
          Monitor, start, and manage your trading bots.
        </p>
      </div>

      <BotsList />
    </div>
  );
}
