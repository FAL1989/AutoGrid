"use client";

import { useRealtimeStatus } from "@/hooks/use-realtime";

interface ConnectionStatusProps {
  showLabel?: boolean;
}

export function ConnectionStatus({ showLabel = false }: ConnectionStatusProps) {
  const isConnected = useRealtimeStatus();

  return (
    <div className="flex items-center gap-2">
      <div
        className={`w-2 h-2 rounded-full ${
          isConnected ? "bg-green-500" : "bg-red-500"
        }`}
        title={isConnected ? "Connected" : "Disconnected"}
      />
      {showLabel && (
        <span
          className={`text-xs ${
            isConnected ? "text-green-500" : "text-red-500"
          }`}
        >
          {isConnected ? "Live" : "Offline"}
        </span>
      )}
    </div>
  );
}
