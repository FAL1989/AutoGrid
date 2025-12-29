"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { apiClient, GridConfig } from "@/lib/api";
import { queryKeys } from "@/lib/query/keys";

export interface GridLevel {
  price: number;
  side: "buy" | "sell";
  hasOrder: boolean;
  orderStatus?: "pending" | "open" | "filled" | "cancelled";
  orderId?: string;
  gridIndex: number;
}

export function useGridVisualization(botId: string) {
  const { data: bot } = useQuery({
    queryKey: queryKeys.bots.detail(botId),
    queryFn: () => apiClient.getBot(botId),
  });

  const { data: openOrders } = useQuery({
    queryKey: queryKeys.orders.open(botId),
    queryFn: () => apiClient.getOpenOrders(botId),
    refetchInterval: 5000,
  });

  const gridLevels = useMemo(() => {
    if (!bot || bot.strategy !== "grid") return [];

    const config = bot.config as GridConfig;
    const levels: GridLevel[] = [];
    const priceRange = config.upper_price - config.lower_price;
    const gridSpacing = priceRange / config.grid_count;

    for (let i = 0; i <= config.grid_count; i++) {
      const price = config.lower_price + (i * gridSpacing);
      const side: "buy" | "sell" = i < config.grid_count / 2 ? "buy" : "sell";

      const order = openOrders?.find(o =>
        Math.abs(o.price - price) < gridSpacing * 0.1 && o.side === side
      );

      levels.push({
        price,
        side,
        hasOrder: !!order,
        orderStatus: order?.status as any,
        orderId: order?.id,
        gridIndex: i,
      });
    }

    return levels;
  }, [bot, openOrders]);

  return { gridLevels, bot, openOrders };
}