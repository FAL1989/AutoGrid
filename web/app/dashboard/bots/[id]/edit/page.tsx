"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useBot } from "@/hooks/use-bots";
import { QueryError } from "@/components/ui/error-boundary";
import { Skeleton } from "@/components/ui/skeleton";
import { GridEditForm } from "@/components/forms/grid-edit-form";
import { DCAEditForm } from "@/components/forms/dca-edit-form";

export default function EditBotPage() {
  const params = useParams();
  const botId = typeof params?.id === "string" ? params.id : params?.id?.[0] ?? "";

  const {
    data: bot,
    isLoading,
    error,
    refetch,
  } = useBot(botId);

  if (!botId) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 text-center text-muted-foreground">
        Missing bot id.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="space-y-3">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="rounded-xl border border-border bg-card p-6">
          <Skeleton className="h-6 w-40 mb-4" />
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return <QueryError error={error} reset={() => refetch()} title="Failed to load bot" />;
  }

  if (!bot) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 text-center text-muted-foreground">
        Bot not found.
      </div>
    );
  }

  const isEditable = bot.status === "stopped" || bot.status === "error";

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link
          href={`/dashboard/bots/${bot.id}`}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to Bot
        </Link>
        <h1 className="mt-2 text-2xl font-bold">Edit Bot</h1>
        <p className="text-muted-foreground">
          {bot.strategy === "grid" ? "Grid Trading" : "DCA"} • {bot.exchange} • {bot.symbol}
        </p>
      </div>

      {!isEditable && (
        <div className="rounded-lg border border-yellow-500/40 bg-yellow-500/10 p-4 text-sm text-yellow-500">
          Stop the bot before editing its settings.
        </div>
      )}

      <div className="rounded-xl border border-border bg-card p-6">
        {bot.strategy === "grid" ? (
          <GridEditForm bot={bot} disabled={!isEditable} />
        ) : (
          <DCAEditForm bot={bot} disabled={!isEditable} />
        )}
      </div>
    </div>
  );
}
