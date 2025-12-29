"use client";

import { useState, useEffect } from "react";
import { useGridVisualization } from "@/hooks/use-grid-visualization";
import { useRealtimeOrders, useRealtimeTrades } from "@/hooks/use-realtime";
import { useQueryClient } from "@tanstack/react-query";

interface GridVisualizationProps {
  botId: string;
}

export function GridVisualization({ botId }: GridVisualizationProps) {
  const { gridLevels, bot } = useGridVisualization(botId);
  const [fillAnimations, setFillAnimations] = useState<Set<string>>(new Set());
  const queryClient = useQueryClient();

  // Real-time order updates
  useRealtimeOrders((payload) => {
    if (payload.bot_id === botId) {
      queryClient.invalidateQueries({ queryKey: ["orders", "open", botId] });
    }
  }, botId);

  // Real-time trade animations
  useRealtimeTrades((payload) => {
    if (payload.bot_id === botId) {
      const tradeId = payload.trade.id;
      setFillAnimations(prev => new Set(prev).add(tradeId));

      // Remove animation after 2 seconds
      setTimeout(() => {
        setFillAnimations(prev => {
          const newSet = new Set(prev);
          newSet.delete(tradeId);
          return newSet;
        });
      }, 2000);

      // Refresh data
      queryClient.invalidateQueries({ queryKey: ["orders", "open", botId] });
    }
  }, botId);

  if (!bot || bot.strategy !== "grid") {
    return (
      <div className="p-6 rounded-xl border border-border bg-card">
        <h3 className="text-lg font-semibold mb-4">Grid Visualization</h3>
        <p className="text-muted-foreground text-center py-8">
          Grid visualization is only available for grid trading bots
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Grid Levels - {bot.symbol}</h3>
        <div className="text-sm text-muted-foreground">
          {gridLevels.filter(l => l.hasOrder).length} active orders
        </div>
      </div>

      <div className="space-y-1 max-h-96 overflow-y-auto">
        {gridLevels.slice().reverse().map((level) => {
          const isAnimating = level.orderId && fillAnimations.has(level.orderId);

          return (
            <div
              key={`${level.gridIndex}-${level.price}`}
              className={`
                flex items-center justify-between p-2 rounded border transition-all duration-200
                ${level.side === "sell"
                  ? "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20"
                  : "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20"
                }
                ${level.hasOrder ? "border-solid" : "border-dashed opacity-60"}
                ${isAnimating ? "ring-2 ring-yellow-400 animate-pulse scale-105" : ""}
              `}
            >
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${
                  level.side === "sell" ? "bg-red-500" : "bg-green-500"
                } ${isAnimating ? "animate-ping" : ""}`} />

                <div>
                  <p className="font-mono font-medium">
                    ${level.price.toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Level {level.gridIndex} • {level.side.toUpperCase()}
                  </p>
                </div>
              </div>

              <div className="text-right">
                {level.hasOrder ? (
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs rounded font-medium ${
                      level.orderStatus === "open"
                        ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
                        : level.orderStatus === "filled"
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                        : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100"
                    }`}>
                      {level.orderStatus?.toUpperCase()}
                    </span>

                    {isAnimating && (
                      <span className="text-xs text-yellow-600 font-bold animate-bounce">
                        FILLED!
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground italic">
                    Waiting for order
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 grid grid-cols-3 gap-4 pt-4 border-t border-border text-center">
        <div>
          <p className="text-sm text-muted-foreground">Buy Orders</p>
          <p className="font-medium text-green-600">
            {gridLevels.filter(l => l.side === "buy" && l.hasOrder).length}
          </p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Sell Orders</p>
          <p className="font-medium text-red-600">
            {gridLevels.filter(l => l.side === "sell" && l.hasOrder).length}
          </p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Total Levels</p>
          <p className="font-medium text-primary">
            {gridLevels.length}
          </p>
        </div>
      </div>
    </div>
  );
}