"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GridConfigForm } from "@/components/forms/grid-config-form";
import { DCAConfigForm } from "@/components/forms/dca-config-form";

type Strategy = "grid" | "dca";

export default function NewBotPage() {
  const router = useRouter();
  const [strategy, setStrategy] = useState<Strategy>("grid");

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Create New Bot</h1>
        <p className="text-muted-foreground">
          Configure your trading bot strategy
        </p>
      </div>

      <div className="space-y-4">
        <label className="block text-sm font-medium">Strategy Type</label>
        <div className="flex gap-4">
          <StrategyButton
            label="Grid Trading"
            description="Profit from sideways markets"
            active={strategy === "grid"}
            onClick={() => setStrategy("grid")}
          />
          <StrategyButton
            label="DCA"
            description="Dollar Cost Averaging"
            active={strategy === "dca"}
            onClick={() => setStrategy("dca")}
          />
        </div>
      </div>

      <div className="p-6 border border-border rounded-lg bg-card">
        {strategy === "grid" ? <GridConfigForm /> : <DCAConfigForm />}
      </div>
    </div>
  );
}

function StrategyButton({
  label,
  description,
  active,
  onClick,
}: {
  label: string;
  description: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 p-4 rounded-lg border text-left transition-colors ${
        active
          ? "border-primary bg-primary/10"
          : "border-border hover:border-primary/50"
      }`}
    >
      <div className="font-medium">{label}</div>
      <div className="text-sm text-muted-foreground">{description}</div>
    </button>
  );
}
