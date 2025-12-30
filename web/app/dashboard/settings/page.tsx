"use client";

import { useState } from "react";
import { useTelegramLink, useTelegramUnlink } from "@/hooks/use-telegram";
import {
  useCreateCredential,
  useCredentials,
  useDeleteCredential,
} from "@/hooks/use-credentials";
import { useUser } from "@/hooks/use-user";
import { ExchangeCredentialCreate, TelegramLink } from "@/lib/api";

export default function SettingsPage() {
  const { data: user, isLoading, error } = useUser();
  const linkMutation = useTelegramLink();
  const unlinkMutation = useTelegramUnlink();
  const [linkInfo, setLinkInfo] = useState<TelegramLink | null>(null);
  const { data: credentials, isLoading: credentialsLoading } = useCredentials();
  const createCredential = useCreateCredential();
  const deleteCredential = useDeleteCredential();
  const [credentialForm, setCredentialForm] = useState<ExchangeCredentialCreate>({
    exchange: "binance",
    api_key: "",
    api_secret: "",
    is_testnet: true,
  });

  const handleGenerateLink = async () => {
    try {
      const data = await linkMutation.mutateAsync();
      setLinkInfo(data);
    } catch {
      // Mutation already exposes error state if needed.
    }
  };

  const handleUnlink = async () => {
    try {
      await unlinkMutation.mutateAsync();
      setLinkInfo(null);
    } catch {
      // Mutation already exposes error state if needed.
    }
  };

  const handleCredentialChange = (
    field: keyof ExchangeCredentialCreate,
    value: string | boolean
  ) => {
    setCredentialForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCreateCredential = async () => {
    try {
      await createCredential.mutateAsync(credentialForm);
      setCredentialForm((prev) => ({
        ...prev,
        api_key: "",
        api_secret: "",
      }));
    } catch {
      // Mutation already exposes error state if needed.
    }
  };

  const handleDeleteCredential = async (id: string) => {
    try {
      await deleteCredential.mutateAsync(id);
    } catch {
      // Mutation already exposes error state if needed.
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage integrations and notification preferences.
        </p>
      </div>

      <div className="p-6 rounded-xl border border-border bg-card space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Telegram</h2>
            <p className="text-sm text-muted-foreground">
              Receive fills and error alerts in your Telegram chat.
            </p>
          </div>
          <span
            className={`text-xs font-semibold px-3 py-1 rounded-full ${
              user?.telegram_chat_id ? "bg-emerald-500/20 text-emerald-400" : "bg-muted text-muted-foreground"
            }`}
          >
            {user?.telegram_chat_id ? "Connected" : "Not connected"}
          </span>
        </div>

        {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
        {error && (
          <p className="text-sm text-red-500">Failed to load user data.</p>
        )}

        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Generate a link token and send the /start command in your bot chat.
          </p>
          {user?.telegram_chat_id && (
            <p className="text-xs text-muted-foreground">
              Linked chat ID: {user.telegram_chat_id}
            </p>
          )}

          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleGenerateLink}
              disabled={linkMutation.isPending}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground disabled:opacity-60"
            >
              {linkMutation.isPending ? "Generating…" : "Generate Link"}
            </button>
            {user?.telegram_chat_id && (
              <button
                onClick={handleUnlink}
                disabled={unlinkMutation.isPending}
                className="px-4 py-2 rounded-lg border border-border hover:bg-muted disabled:opacity-60"
              >
                {unlinkMutation.isPending ? "Disconnecting…" : "Disconnect"}
              </button>
            )}
          </div>
          {(linkMutation.error || unlinkMutation.error) && (
            <p className="text-sm text-red-500">Failed to update Telegram link.</p>
          )}

          {linkInfo && (
            <div className="space-y-2 text-sm">
              <div className="p-3 rounded-lg border border-border bg-background">
                <p className="font-semibold">Start command</p>
                <code className="text-xs break-all">{linkInfo.start_command}</code>
              </div>
              {linkInfo.deep_link && (
                <div className="p-3 rounded-lg border border-border bg-background">
                  <p className="font-semibold">Deep link</p>
                  <a
                    href={linkInfo.deep_link}
                    className="text-xs text-primary break-all"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {linkInfo.deep_link}
                  </a>
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Token expira em {new Date(linkInfo.expires_at).toLocaleString()}.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="p-6 rounded-xl border border-border bg-card space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Exchange Credentials</h2>
          <p className="text-sm text-muted-foreground">
            Add your exchange API keys to create and run bots.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <label className="text-sm text-muted-foreground">Exchange</label>
            <select
              value={credentialForm.exchange}
              onChange={(event) =>
                handleCredentialChange("exchange", event.target.value)
              }
              className="w-full px-3 py-2 rounded-lg border border-border bg-background"
            >
              <option value="binance">Binance</option>
              <option value="bybit">Bybit</option>
              <option value="mexc">MEXC</option>
            </select>
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input
                type="checkbox"
                checked={credentialForm.is_testnet}
                onChange={(event) =>
                  handleCredentialChange("is_testnet", event.target.checked)
                }
              />
              Use testnet
            </label>
          </div>
          <div className="space-y-3">
            <label className="text-sm text-muted-foreground">API Key</label>
            <input
              type="password"
              value={credentialForm.api_key}
              onChange={(event) =>
                handleCredentialChange("api_key", event.target.value)
              }
              className="w-full px-3 py-2 rounded-lg border border-border bg-background"
              placeholder="Enter API key"
            />
          </div>
          <div className="space-y-3">
            <label className="text-sm text-muted-foreground">API Secret</label>
            <input
              type="password"
              value={credentialForm.api_secret}
              onChange={(event) =>
                handleCredentialChange("api_secret", event.target.value)
              }
              className="w-full px-3 py-2 rounded-lg border border-border bg-background"
              placeholder="Enter API secret"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleCreateCredential}
            disabled={createCredential.isPending}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground disabled:opacity-60"
          >
            {createCredential.isPending ? "Saving…" : "Save Credential"}
          </button>
          {createCredential.error && (
            <p className="text-sm text-red-500">
              Failed to save credential.
            </p>
          )}
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Saved Credentials</h3>
          {credentialsLoading && (
            <p className="text-sm text-muted-foreground">Loading…</p>
          )}
          {!credentialsLoading && (!credentials || credentials.length === 0) && (
            <p className="text-sm text-muted-foreground">No credentials yet.</p>
          )}
          {credentials?.map((cred) => (
            <div
              key={cred.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-background px-3 py-2"
            >
              <div>
                <p className="text-sm font-medium">{cred.exchange}</p>
                <p className="text-xs text-muted-foreground">
                  Added {new Date(cred.created_at).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => handleDeleteCredential(cred.id)}
                disabled={deleteCredential.isPending}
                className="text-sm text-red-400 hover:text-red-300"
              >
                Remove
              </button>
            </div>
          ))}
          {deleteCredential.error && (
            <p className="text-sm text-red-500">
              Failed to delete credential.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
