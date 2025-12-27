"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";

const dcaSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  exchange: z.enum(["binance", "mexc", "bybit"]),
  symbol: z.string().min(1, "Symbol is required"),
  investment: z.number().min(10, "Minimum investment is $10"),
  amountPerBuy: z.number().min(1, "Minimum amount is $1"),
  interval: z.enum(["hourly", "daily", "weekly"]).optional(),
  triggerDropPercent: z.number().min(0).max(100).optional(),
  takeProfitPercent: z.number().min(0).max(1000).optional(),
}).refine((data) => data.interval || data.triggerDropPercent, {
  message: "At least one trigger (interval or price drop) is required",
  path: ["interval"],
});

type DCAFormData = z.infer<typeof dcaSchema>;

export function DCAConfigForm() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<DCAFormData>({
    resolver: zodResolver(dcaSchema),
    defaultValues: {
      exchange: "binance",
      interval: "daily",
    },
  });

  const investment = watch("investment");
  const amountPerBuy = watch("amountPerBuy");
  const interval = watch("interval");

  const estimatedBuys = investment && amountPerBuy
    ? Math.floor(investment / amountPerBuy)
    : 0;

  const onSubmit = async (data: DCAFormData) => {
    try {
      // TODO: Call API to create bot
      console.log("Creating DCA bot:", data);
      router.push("/dashboard/bots");
    } catch (error) {
      console.error("Failed to create bot:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">Bot Name</label>
        <input
          {...register("name")}
          className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder="My DCA Bot"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Exchange</label>
          <select
            {...register("exchange")}
            className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary"
          >
            <option value="binance">Binance</option>
            <option value="mexc">MEXC</option>
            <option value="bybit">Bybit</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Trading Pair</label>
          <input
            {...register("symbol")}
            className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary"
            placeholder="BTC/USDT"
          />
          {errors.symbol && (
            <p className="mt-1 text-sm text-red-500">{errors.symbol.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Total Investment (USDT)</label>
          <input
            {...register("investment", { valueAsNumber: true })}
            type="number"
            step="0.01"
            className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary"
            placeholder="1000"
          />
          {errors.investment && (
            <p className="mt-1 text-sm text-red-500">{errors.investment.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Amount per Buy (USDT)</label>
          <input
            {...register("amountPerBuy", { valueAsNumber: true })}
            type="number"
            step="0.01"
            className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary"
            placeholder="100"
          />
          {errors.amountPerBuy && (
            <p className="mt-1 text-sm text-red-500">{errors.amountPerBuy.message}</p>
          )}
        </div>
      </div>

      {/* Triggers */}
      <div className="space-y-4">
        <h4 className="font-medium">Buy Triggers</h4>

        <div>
          <label className="block text-sm font-medium mb-2">Time Interval</label>
          <select
            {...register("interval")}
            className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary"
          >
            <option value="">Disabled</option>
            <option value="hourly">Hourly</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
          </select>
          {errors.interval && (
            <p className="mt-1 text-sm text-red-500">{errors.interval.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Price Drop Trigger (%)
          </label>
          <input
            {...register("triggerDropPercent", { valueAsNumber: true })}
            type="number"
            step="0.1"
            min="0"
            max="100"
            className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary"
            placeholder="5"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Buy when price drops by this percentage from recent high
          </p>
        </div>
      </div>

      {/* Take Profit */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Take Profit (%)
        </label>
        <input
          {...register("takeProfitPercent", { valueAsNumber: true })}
          type="number"
          step="0.1"
          min="0"
          className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary"
          placeholder="10"
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Sell all when profit reaches this percentage (leave empty to disable)
        </p>
      </div>

      {/* Summary */}
      <div className="p-4 rounded-lg bg-muted space-y-2">
        <h4 className="font-medium">DCA Summary</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Estimated Buys:</span>
            <span className="ml-2 font-mono">{estimatedBuys}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Frequency:</span>
            <span className="ml-2 font-mono capitalize">{interval || "Price-based"}</span>
          </div>
          {interval && estimatedBuys > 0 && (
            <div className="col-span-2">
              <span className="text-muted-foreground">Duration:</span>
              <span className="ml-2 font-mono">
                {interval === "hourly" && `~${estimatedBuys} hours`}
                {interval === "daily" && `~${estimatedBuys} days`}
                {interval === "weekly" && `~${estimatedBuys} weeks`}
              </span>
            </div>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
      >
        {isSubmitting ? "Creating..." : "Create DCA Bot"}
      </button>
    </form>
  );
}
