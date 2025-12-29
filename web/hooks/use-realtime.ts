"use client";

import { useEffect, useCallback } from "react";
import { useWebSocket } from "@/lib/websocket/ws-context";
import {
  WebSocketMessage,
  BotStatusPayload,
  OrderUpdatePayload,
  TradePayload,
  PnLUpdatePayload,
  ErrorPayload,
} from "@/lib/websocket/ws-client";

/**
 * Hook to get WebSocket connection status
 */
export function useRealtimeStatus() {
  const { isConnected } = useWebSocket();
  return isConnected;
}

/**
 * Hook to subscribe to bot status updates
 */
export function useRealtimeBotStatus(
  onStatusChange: (payload: BotStatusPayload) => void,
  botId?: string
) {
  const { subscribe, subscribeToBot } = useWebSocket();

  useEffect(() => {
    if (botId) {
      subscribeToBot(botId);
    }
  }, [botId, subscribeToBot]);

  useEffect(() => {
    const handleMessage = (message: WebSocketMessage<BotStatusPayload>) => {
      // Filter by botId if specified
      if (botId && message.payload.bot_id !== botId) {
        return;
      }
      onStatusChange(message.payload);
    };

    const unsubscribe = subscribe("bot_status", handleMessage);
    return unsubscribe;
  }, [subscribe, onStatusChange, botId]);
}

/**
 * Hook to subscribe to order updates
 */
export function useRealtimeOrders(
  onOrderUpdate: (payload: OrderUpdatePayload) => void,
  botId?: string
) {
  const { subscribe, subscribeToBot } = useWebSocket();

  useEffect(() => {
    if (botId) {
      subscribeToBot(botId);
    }
  }, [botId, subscribeToBot]);

  useEffect(() => {
    const handleMessage = (message: WebSocketMessage<OrderUpdatePayload>) => {
      // Filter by botId if specified
      if (botId && message.payload.bot_id !== botId) {
        return;
      }
      onOrderUpdate(message.payload);
    };

    const unsubscribe = subscribe("order_update", handleMessage);
    return unsubscribe;
  }, [subscribe, onOrderUpdate, botId]);
}

/**
 * Hook to subscribe to trade executions
 */
export function useRealtimeTrades(
  onTrade: (payload: TradePayload) => void,
  botId?: string
) {
  const { subscribe, subscribeToBot } = useWebSocket();

  useEffect(() => {
    if (botId) {
      subscribeToBot(botId);
    }
  }, [botId, subscribeToBot]);

  useEffect(() => {
    const handleMessage = (message: WebSocketMessage<TradePayload>) => {
      // Filter by botId if specified
      if (botId && message.payload.bot_id !== botId) {
        return;
      }
      onTrade(message.payload);
    };

    const unsubscribe = subscribe("trade", handleMessage);
    return unsubscribe;
  }, [subscribe, onTrade, botId]);
}

/**
 * Hook to subscribe to P&L updates
 */
export function useRealtimePnL(
  onPnLUpdate: (payload: PnLUpdatePayload) => void,
  botId?: string
) {
  const { subscribe, subscribeToBot } = useWebSocket();

  useEffect(() => {
    if (botId) {
      subscribeToBot(botId);
    }
  }, [botId, subscribeToBot]);

  useEffect(() => {
    const handleMessage = (message: WebSocketMessage<PnLUpdatePayload>) => {
      // Filter by botId if specified
      if (botId && message.payload.bot_id !== botId) {
        return;
      }
      onPnLUpdate(message.payload);
    };

    const unsubscribe = subscribe("pnl_update", handleMessage);
    return unsubscribe;
  }, [subscribe, onPnLUpdate, botId]);
}

/**
 * Hook to subscribe to error notifications
 */
export function useRealtimeErrors(
  onError: (payload: ErrorPayload) => void,
  botId?: string
) {
  const { subscribe } = useWebSocket();

  useEffect(() => {
    const handleMessage = (message: WebSocketMessage<ErrorPayload>) => {
      // Filter by botId if specified
      if (botId && message.payload.bot_id !== botId) {
        return;
      }
      onError(message.payload);
    };

    const unsubscribe = subscribe("error", handleMessage);
    return unsubscribe;
  }, [subscribe, onError, botId]);
}

/**
 * Combined hook for subscribing to all updates for a specific bot
 */
export function useRealtimeBot(
  botId: string,
  callbacks: {
    onStatusChange?: (payload: BotStatusPayload) => void;
    onOrderUpdate?: (payload: OrderUpdatePayload) => void;
    onTrade?: (payload: TradePayload) => void;
    onPnLUpdate?: (payload: PnLUpdatePayload) => void;
    onError?: (payload: ErrorPayload) => void;
  }
) {
  const { subscribe, subscribeToBot } = useWebSocket();

  // Subscribe to this specific bot
  useEffect(() => {
    subscribeToBot(botId);
  }, [botId, subscribeToBot]);

  // Subscribe to all message types
  useEffect(() => {
    const unsubscribers: (() => void)[] = [];

    if (callbacks.onStatusChange) {
      const handler = callbacks.onStatusChange;
      unsubscribers.push(
        subscribe<BotStatusPayload>("bot_status", (message) => {
          if (message.payload.bot_id === botId) {
            handler(message.payload);
          }
        })
      );
    }

    if (callbacks.onOrderUpdate) {
      const handler = callbacks.onOrderUpdate;
      unsubscribers.push(
        subscribe<OrderUpdatePayload>("order_update", (message) => {
          if (message.payload.bot_id === botId) {
            handler(message.payload);
          }
        })
      );
    }

    if (callbacks.onTrade) {
      const handler = callbacks.onTrade;
      unsubscribers.push(
        subscribe<TradePayload>("trade", (message) => {
          if (message.payload.bot_id === botId) {
            handler(message.payload);
          }
        })
      );
    }

    if (callbacks.onPnLUpdate) {
      const handler = callbacks.onPnLUpdate;
      unsubscribers.push(
        subscribe<PnLUpdatePayload>("pnl_update", (message) => {
          if (message.payload.bot_id === botId) {
            handler(message.payload);
          }
        })
      );
    }

    if (callbacks.onError) {
      const handler = callbacks.onError;
      unsubscribers.push(
        subscribe<ErrorPayload>("error", (message) => {
          if (message.payload.bot_id === botId) {
            handler(message.payload);
          }
        })
      );
    }

    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }, [botId, subscribe, callbacks]);
}
