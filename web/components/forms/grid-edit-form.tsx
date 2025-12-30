"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useUpdateBot } from "@/hooks/use-bots";
import type { Bot, GridConfig } from "@/lib/api";

const gridSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  investment: z.number().min(10, "Minimum investment is $10"),
  lowerPrice: z.number().positive("Must be positive"),
  upperPrice: z.number().positive("Must be positive"),
  gridCount: z.number().int().min(5, "Minimum 5 grids").max(200, "Maximum 200 grids"),
}).refine((data) => data.lowerPrice < data.upperPrice, {
  message: "Lower price must be less than upper price",
  path: ["lowerPrice"],
});

type GridFormData = z.infer<typeof gridSchema>;

export function GridEditForm({ bot, disabled = false }: { bot: Bot; disabled?: boolean }) {
  const router = useRouter();
  const updateBot = useUpdateBot();
  const [error, setError] = useState<string | null>(null);

  const gridConfig = bot.config as GridConfig;

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<GridFormData>({
    resolver: zodResolver(gridSchema),
    defaultValues: {
      name: bot.name,
      investment: gridConfig?.investment ?? 0,
      lowerPrice: gridConfig?.lower_price ?? 0,
      upperPrice: gridConfig?.upper_price ?? 0,
      gridCount: gridConfig?.grid_count ?? 5,
    },
  });

  const lowerPrice = watch("lowerPrice");
  const upperPrice = watch("upperPrice");
  const gridCount = watch("gridCount");
  const investment = watch("investment");

  const gridSpacing = lowerPrice && upperPrice && gridCount
    ? ((upperPrice - lowerPrice) / gridCount).toFixed(2)
    : "-";

  const profitPerGrid = lowerPrice && upperPrice && gridCount
    ? (((upperPrice - lowerPrice) / gridCount / lowerPrice) * 100).toFixed(2)
    : "-";

  const isUpdating = isSubmitting || updateBot.isPending;
  const isDisabled = disabled || isUpdating;

  const onSubmit = async (data: GridFormData) => {
    setError(null);
    try {
      const config: GridConfig = {
        lower_price: data.lowerPrice,
        upper_price: data.upperPrice,
        grid_count: data.gridCount,
        investment: data.investment,
      };

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
          placeholder="My Grid Bot"
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

      <div>
        <label className="block text-sm font-medium mb-2">Investment (USDT)</label>
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

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Lower Price</label>
          <input
            {...register("lowerPrice", { valueAsNumber: true })}
            disabled={isDisabled}
            type="number"
            step="0.01"
            className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary disabled:opacity-60"
            placeholder="40000"
          />
          {errors.lowerPrice && (
            <p className="mt-1 text-sm text-red-500">{errors.lowerPrice.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Upper Price</label>
          <input
            {...register("upperPrice", { valueAsNumber: true })}
            disabled={isDisabled}
            type="number"
            step="0.01"
            className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary disabled:opacity-60"
            placeholder="50000"
          />
          {errors.upperPrice && (
            <p className="mt-1 text-sm text-red-500">{errors.upperPrice.message}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Number of Grids: {gridCount}
        </label>
        <input
          {...register("gridCount", { valueAsNumber: true })}
          disabled={isDisabled}
          type="range"
          min="5"
          max="200"
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>5</span>
          <span>200</span>
        </div>
        {errors.gridCount && (
          <p className="mt-1 text-sm text-red-500">{errors.gridCount.message}</p>
        )}
      </div>

      <div className="p-4 rounded-lg bg-muted space-y-2">
        <h4 className="font-medium">Grid Summary</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Grid Spacing:</span>
            <span className="ml-2 font-mono">${gridSpacing}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Profit per Grid:</span>
            <span className="ml-2 font-mono">{profitPerGrid}%</span>
          </div>
          <div>
            <span className="text-muted-foreground">Investment per Grid:</span>
            <span className="ml-2 font-mono">
              ${investment && gridCount ? (investment / gridCount).toFixed(2) : "-"}
            </span>
          </div>
        </div>
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
