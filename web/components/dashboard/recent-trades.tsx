"use client";

interface Trade {
  id: string;
  symbol: string;
  side: "buy" | "sell";
  price: number;
  quantity: number;
  pnl?: number;
  timestamp: string;
}

export function RecentTrades() {
  // TODO: Fetch real trades from API
  const trades: Trade[] = [
    {
      id: "1",
      symbol: "BTC/USDT",
      side: "buy",
      price: 43250.5,
      quantity: 0.023,
      timestamp: "2024-01-15 14:32",
    },
    {
      id: "2",
      symbol: "BTC/USDT",
      side: "sell",
      price: 43650.0,
      quantity: 0.023,
      pnl: 9.19,
      timestamp: "2024-01-15 14:45",
    },
    {
      id: "3",
      symbol: "ETH/USDT",
      side: "buy",
      price: 2540.75,
      quantity: 0.15,
      timestamp: "2024-01-15 15:02",
    },
    {
      id: "4",
      symbol: "BTC/USDT",
      side: "buy",
      price: 43100.0,
      quantity: 0.025,
      timestamp: "2024-01-15 15:18",
    },
    {
      id: "5",
      symbol: "BTC/USDT",
      side: "sell",
      price: 43500.0,
      quantity: 0.025,
      pnl: 10.0,
      timestamp: "2024-01-15 15:34",
    },
  ];

  return (
    <div className="p-6 rounded-xl border border-border bg-card">
      <h3 className="text-lg font-semibold mb-4">Recent Trades</h3>

      <div className="space-y-3">
        {trades.map((trade) => (
          <div
            key={trade.id}
            className="flex items-center justify-between py-2 border-b border-border last:border-0"
          >
            <div className="flex items-center gap-3">
              <span
                className={`px-2 py-1 text-xs font-medium rounded ${
                  trade.side === "buy"
                    ? "bg-green-500/20 text-green-500"
                    : "bg-red-500/20 text-red-500"
                }`}
              >
                {trade.side.toUpperCase()}
              </span>
              <div>
                <p className="font-medium">{trade.symbol}</p>
                <p className="text-xs text-muted-foreground">
                  {trade.quantity} @ ${trade.price.toLocaleString()}
                </p>
              </div>
            </div>
            <div className="text-right">
              {trade.pnl !== undefined ? (
                <p
                  className={`font-medium ${
                    trade.pnl >= 0 ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {trade.pnl >= 0 ? "+" : ""}${trade.pnl.toFixed(2)}
                </p>
              ) : (
                <p className="text-muted-foreground">-</p>
              )}
              <p className="text-xs text-muted-foreground">{trade.timestamp}</p>
            </div>
          </div>
        ))}
      </div>

      <button className="w-full mt-4 py-2 text-sm text-primary hover:underline">
        View All Trades
      </button>
    </div>
  );
}
