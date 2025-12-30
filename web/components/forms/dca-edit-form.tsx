"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useUpdateBot } from "@/hooks/use-bots";
import type { Bot, DCAConfig } from "@/lib/api";

const dcaSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  amount: z.number().min(1, "Minimum amount is $1"),
  interval: z.enum(["hourly", "daily", "weekly"]),
  triggerDrop: z.number().min(0).max(100).optional(),
  takeProfit: z.number().min(0).max(1000).optional(),
  investment: z.number().min(1).optional(),
});

type DCAFormData = z.infer<typeof dcaSchema>;

export function DCAEditForm({ bot, disabled = false }: { bot: Bot; disabled?: boolean }) {
  const router = useRouter();
  const updateBot = useUpdateBot();
  const [error, setError] = useState<string | null>(null);

  const dcaConfig = bot.config as DCAConfig;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DCAFormData>({
    resolver: zodResolver(dcaSchema),
    defaultValues: {
      name: bot.name,
      amount: dcaConfig?.amount ?? 0,
      interval: dcaConfig?.interval ?? "daily",
      triggerDrop: dcaConfig?.trigger_drop,
      takeProfit: dcaConfig?.take_profit,
      investment: dcaConfig?.investment,
    },
  });

  const isUpdating = isSubmitting || updateBot.isPending;
  const isDisabled = disabled || isUpdating;

  const onSubmit = async (data: DCAFormData) => {
    setError(null);

    const config: DCAConfig = {
      amount: data.amount,
      interval: data.interval,
    };

    if (data.triggerDrop !== undefined) {
      config.trigger_drop = data.triggerDrop;
    }

    if (data.takeProfit !== undefined) {
      config.take_profit = data.takeProfit;
    }

    if (data.investment !== undefined) {
      config.investment = data.investment;
    }

    try {
      await updateBot.mutateAsync({
        id: bot.id,
        data: {
          name: data.name,
          config,
        },
      });
      router.push(`/dashboard/bots/${bot.id}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update bot";
      setError(message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">Bot Name</label>
        <input
          {...register("name")}
          disabled={isDisabled}
          className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-60"
          placeholder="My DCA Bot"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500 text-red-500">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Amount per Buy (USDT)</label>
          <input
            {...register("amount", { valueAsNumber: true })}
            disabled={isDisabled}
            type="number"
            step="0.01"
            className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary disabled:opacity-60"
            placeholder="100"
          />
          {errors.amount && (
            <p className="mt-1 text-sm text-red-500">{errors.amount.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Time Interval</label>
          <select
            {...register("interval")}
            disabled={isDisabled}
            className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary disabled:opacity-60"
          >
            <option value="hourly">Hourly</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
          </select>
          {errors.interval && (
            <p className="mt-1 text-sm text-red-500">{errors.interval.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Price Drop Trigger (%)</label>
          <input
            {...register("triggerDrop", { valueAsNumber: true })}
            disabled={isDisabled}
            type="number"
            step="0.1"
            min="0"
            max="100"
            className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary disabled:opacity-60"
            placeholder="5"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Take Profit (%)</label>
          <input
            {...register("takeProfit", { valueAsNumber: true })}
            disabled={isDisabled}
            type="number"
            step="0.1"
            min="0"
            className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary disabled:opacity-60"
            placeholder="10"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Total Investment (USDT)</label>
        <input
          {...register("investment", { valueAsNumber: true })}
          disabled={isDisabled}
          type="number"
          step="0.01"
          className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary disabled:opacity-60"
          placeholder="1000"
        />
        {errors.investment && (
          <p className="mt-1 text-sm text-red-500">{errors.investment.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="submit"
          disabled={isDisabled}
          className="flex-1 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {isUpdating ? "Saving..." : "Save Changes"}
        </button>
        <button
          type="button"
          onClick={() => router.push(`/dashboard/bots/${bot.id}`)}
          className="flex-1 py-3 border border-border rounded-lg font-medium hover:bg-muted transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
