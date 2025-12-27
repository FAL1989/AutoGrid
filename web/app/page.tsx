import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gradient-to-br from-background to-muted">
      <div className="text-center space-y-8 max-w-2xl">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-primary-600 bg-clip-text text-transparent">
          AutoGrid
        </h1>
        <p className="text-xl text-muted-foreground">
          Open-source cryptocurrency trading bot platform with Grid and DCA
          strategies
        </p>

        <div className="flex gap-4 justify-center">
          <Link
            href="/dashboard"
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/login"
            className="px-6 py-3 border border-border rounded-lg font-medium hover:bg-muted transition-colors"
          >
            Sign In
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          <FeatureCard
            title="Grid Trading"
            description="Profit from market volatility with automated buy/sell orders at fixed intervals"
            icon="📊"
          />
          <FeatureCard
            title="DCA Strategy"
            description="Dollar Cost Average your investments with time-based or price-drop triggers"
            icon="💰"
          />
          <FeatureCard
            title="Multi-Exchange"
            description="Connect to Binance, MEXC, and Bybit with secure API key management"
            icon="🔗"
          />
        </div>
      </div>
    </main>
  );
}

function FeatureCard({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: string;
}) {
  return (
    <div className="p-6 rounded-xl border border-border bg-card hover:shadow-lg transition-shadow">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
