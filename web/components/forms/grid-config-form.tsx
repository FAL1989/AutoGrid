"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useCreateBot } from "@/hooks/use-bots";
import { useCredentials } from "@/hooks/use-credentials";
import { useState } from "react";

const gridSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  credential_id: z.string().min(1, "Select an exchange credential"),
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
  const createBot = useCreateBot();
  const { data: credentials, isLoading: credentialsLoading } = useCredentials();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<GridFormData>({
    resolver: zodResolver(gridSchema),
    defaultValues: {
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
    setError(null);
    try {
      await createBot.mutateAsync({
        name: data.name,
        strategy: "grid",
        credential_id: data.credential_id,
        symbol: data.symbol,
        config: {
          lower_price: data.lowerPrice,
          upper_price: data.upperPrice,
          grid_count: data.gridCount,
          investment: data.investment,
        },
      });
      router.push("/dashboard");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create bot";
      setError(message);
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

      {error && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500 text-red-500">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Exchange Credential</label>
          <select
            {...register("credential_id")}
            className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary"
            disabled={credentialsLoading}
          >
            <option value="">Select a credential...</option>
            {credentials?.map((cred) => (
              <option key={cred.id} value={cred.id}>
                {cred.exchange.toUpperCase()} {cred.is_testnet ? "(Testnet)" : ""}
              </option>
            ))}
          </select>
          {errors.credential_id && (
            <p className="mt-1 text-sm text-red-500">{errors.credential_id.message}</p>
          )}
          {!credentialsLoading && (!credentials || credentials.length === 0) && (
            <p className="mt-1 text-sm text-yellow-500">
              No credentials found. <a href="/dashboard/settings" className="underline">Add one first</a>
            </p>
          )}
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
        disabled={isSubmitting || createBot.isPending}
        className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
      >
        {isSubmitting || createBot.isPending ? "Creating..." : "Create Grid Bot"}
      </button>
    </form>
  );
}
