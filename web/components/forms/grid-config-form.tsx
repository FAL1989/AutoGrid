"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";

const gridSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  exchange: z.enum(["binance", "mexc", "bybit"]),
  symbol: z.string().min(1, "Symbol is required"),
  investment: z.number().min(10, "Minimum investment is $10"),
  lowerPrice: z.number().positive("Must be positive"),
  upperPrice: z.number().positive("Must be positive"),
  gridCount: z.number().int().min(2, "Minimum 2 grids").max(200, "Maximum 200 grids"),
}).refine((data) => data.lowerPrice < data.upperPrice, {
  message: "Lower price must be less than upper price",
  path: ["lowerPrice"],
});

type GridFormData = z.infer<typeof gridSchema>;

export function GridConfigForm() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<GridFormData>({
    resolver: zodResolver(gridSchema),
    defaultValues: {
      exchange: "binance",
      gridCount: 20,
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

  const onSubmit = async (data: GridFormData) => {
    try {
      // TODO: Call API to create bot
      console.log("Creating grid bot:", data);
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
          placeholder="My Grid Bot"
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

      <div>
        <label className="block text-sm font-medium mb-2">Investment (USDT)</label>
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

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Lower Price</label>
          <input
            {...register("lowerPrice", { valueAsNumber: true })}
            type="number"
            step="0.01"
            className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary"
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
            type="number"
            step="0.01"
            className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary"
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
          type="range"
          min="2"
          max="200"
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>2</span>
          <span>200</span>
        </div>
      </div>

      {/* Summary */}
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

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
      >
        {isSubmitting ? "Creating..." : "Create Grid Bot"}
      </button>
    </form>
  );
}
