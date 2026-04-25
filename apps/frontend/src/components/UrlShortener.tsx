import { Link2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { ApiError } from "@/lib/api/client";
import { createAnonymousUrl, createAuthenticatedUrl } from "@/lib/api/urls-api";
import type { AnonymousUrlResult } from "@/lib/api/types";
import { useAuthStore } from "@/stores/auth-store";
import { useUrlsStore } from "@/stores/urls-store";
import { useTagsStore } from "@/stores/tags-store";
import { TagPicker } from "@/components/TagPicker";
import { cn } from "@/lib/utils";
import {
  AnonymousResultCard,
  AuthMetaDetails,
  AuthResultCard,
  GuestHelpDetails,
} from "@/components/UrlShortenerSections";

export type UrlShortenerVariant = "page" | "embed";

type UrlShortenerProps = {
  variant?: UrlShortenerVariant;
};

const HTTP_PROTOCOL_RE = /^https?:\/\//i;
const URL_WITH_SCHEME_RE = /^[a-z][a-z\d+\-.]*:\/\//i;

function normalizeAndValidateOriginalUrl(rawUrl: string): { normalizedUrl?: string; error?: string } {
  const trimmed = rawUrl.trim();
  if (!trimmed) {
    return { error: "Ingresa una URL." };
  }

  const normalized = URL_WITH_SCHEME_RE.test(trimmed) ? trimmed : `https://${trimmed}`;
  if (!HTTP_PROTOCOL_RE.test(normalized)) {
    return { error: "La URL debe usar http o https." };
  }

  try {
    const parsed = new URL(normalized);
    if (!parsed.hostname || !parsed.hostname.includes(".")) {
      return { error: "La URL debe tener formato tipo dominio.tld." };
    }
    return { normalizedUrl: normalized };
  } catch {
    return { error: "La URL no es valida." };
  }
}

export default function UrlShortener({ variant = "page" }: UrlShortenerProps) {
  const { user } = useAuth();
  const isEmbed = variant === "embed";
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [result, setResult] = useState<AnonymousUrlResult | null>(null);
  const [authResult, setAuthResult] = useState<{ shortUrl: string; shortCode: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [metaHintPulse, setMetaHintPulse] = useState(true);

  useEffect(() => {
    if (!user) {
      useTagsStore.getState().reset();
      setTitle("");
      setDescription("");
      setTags([]);
      return;
    }
    const token = useAuthStore.getState().accessToken;
    if (!token) return;
    void useTagsStore.getState().hydrateKnownTags(token);
  }, [user]);

  const handleShorten = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = normalizeAndValidateOriginalUrl(url);
    if (!validation.normalizedUrl) {
      setError(validation.error ?? "La URL no es valida.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const normalizedUrl = validation.normalizedUrl;
      if (user) {
        const token = useAuthStore.getState().accessToken;
        if (!token) {
          setError("Not authenticated.");
          return;
        }
        const body = {
          originalUrl: normalizedUrl,
          ...(title.trim() ? { title: title.trim() } : {}),
          ...(description.trim() ? { description: description.trim() } : {}),
          ...(tags.length > 0 ? { tags } : {}),
        };
        const data = await createAuthenticatedUrl(token, body);
        setAuthResult({ shortUrl: data.shortUrl, shortCode: data.shortCode });
        setResult(null);
        useTagsStore.getState().addKnownFromNames(tags);
        setUrl("");
        setTitle("");
        setDescription("");
        setTags([]);
        setMetaHintPulse(true);
        void useUrlsStore.getState().loadDashboard(token);
      } else {
        const data = await createAnonymousUrl({ originalUrl: normalizedUrl });
        setResult(data);
        setAuthResult(null);
        setUrl("");
      }
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Could not shorten URL";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, kind: "link" | "secret") => {
    void navigator.clipboard.writeText(text);
    if (kind === "link") {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 1500);
    } else {
      setCopiedSecret(true);
      setTimeout(() => setCopiedSecret(false), 1500);
    }
  };

  const inputBase =
    "w-full bg-transparent border border-border px-3 py-2 font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary";
  const labelBase = "font-mono text-[10px] uppercase tracking-wider text-muted-foreground";

  const metaBorder = "border border-border border-t-0";

  if (isEmbed) {
    return (
      <div className="w-full min-w-0">
        <form onSubmit={handleShorten} className="touch-manipulation min-w-0">
          <div className="rounded-none border border-border bg-surface/30 overflow-hidden">
            <div className="flex items-center gap-2 border-b border-border/80 bg-surface/50 px-3 py-2">
              <Link2 className="h-3.5 w-3.5 shrink-0 text-neon-dim" aria-hidden />
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">New short link</span>
            </div>

            <div className="p-3 space-y-3">
              <div className="space-y-1">
                <label htmlFor="embed-shorten-url" className={labelBase}>
                  Destination URL
                </label>
                <input
                  id="embed-shorten-url"
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="example.com o https://example.com"
                  aria-label="Destination URL to shorten"
                  required
                  className={cn(inputBase, "min-h-[44px] text-xs")}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full min-h-[44px] border border-border bg-primary px-3 py-2.5 font-mono text-[11px] uppercase tracking-wider text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50 focus-ring-terminal"
              >
                {loading ? "Creating…" : "Create short link"}
              </button>

              {user && (
                <AuthMetaDetails
                  title={title}
                  description={description}
                  tags={tags}
                  setTitle={setTitle}
                  setDescription={setDescription}
                  setTags={setTags}
                  labelBase={labelBase}
                  inputBase={inputBase}
                  metaHintPulse={metaHintPulse}
                  onMetaHintInteract={() => setMetaHintPulse(false)}
                />
              )}

              {!user && (
                <GuestHelpDetails compact />
              )}
            </div>
          </div>
        </form>

        {error && (
          <p className="mt-2 px-1 font-mono text-[11px] text-destructive leading-snug" role="alert">
            {error}
          </p>
        )}

        {authResult && user && (
          <AuthResultCard
            shortUrl={authResult.shortUrl}
            copiedLink={copiedLink}
            onCopy={() => copyToClipboard(authResult.shortUrl, "link")}
            compact
          />
        )}

        {result && !user && (
          <AnonymousResultCard
            shortUrl={result.shortUrl}
            secret={result.secret}
            copiedLink={copiedLink}
            copiedSecret={copiedSecret}
            onCopyLink={() => copyToClipboard(result.shortUrl, "link")}
            onCopySecret={() => copyToClipboard(result.secret, "secret")}
            compact
          />
        )}
      </div>
    );
  }

  return (
    <div className={cn("w-full", "max-w-2xl")}>
      <form onSubmit={handleShorten} className="touch-manipulation">
        <div className="flex flex-col sm:flex-row sm:items-stretch border border-border">
          <div
            className="flex items-center justify-center px-3 py-3 border-b border-border sm:border-b-0 sm:border-r sm:py-0 shrink-0 font-mono text-xs text-neon select-none"
            title="Prompt"
            aria-hidden
          >
            $
          </div>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="example.com o https://example.com"
            aria-label="URL to shorten"
            required
            className="flex-1 min-h-[48px] bg-transparent px-4 py-3 font-mono text-base sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
          />
          <button
            type="submit"
            disabled={loading}
            className="min-h-[48px] px-6 py-3 bg-primary text-primary-foreground font-mono text-xs uppercase tracking-widest transition-[opacity,background-color] duration-200 ease-out hover:opacity-90 disabled:opacity-50 border-t border-border sm:border-t-0 sm:border-l sm:border-border focus-ring-terminal"
          >
            {loading ? "Shortening…" : "Shorten"}
          </button>
        </div>

        {user && (
          <div className={cn(metaBorder, "p-3 sm:p-4 space-y-3 bg-surface/20")}>
            <div className="space-y-1.5">
              <label htmlFor="url-title" className={labelBase}>
                Title (optional)
              </label>
              <input
                id="url-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Friendly name for this link"
                className={cn(inputBase, "min-h-[44px] text-sm")}
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="url-desc" className={labelBase}>
                Description (optional)
              </label>
              <textarea
                id="url-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Notes for you — not shown on redirect"
                rows={3}
                className="w-full resize-y min-h-[4.5rem] bg-transparent border border-border px-3 py-2 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
              />
            </div>
            <div className="space-y-1.5">
              <span className="block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Tags</span>
              <TagPicker value={tags} onChange={setTags} />
            </div>
          </div>
        )}

        {!user && (
          <details className={cn(metaBorder, "group bg-surface/15 open:bg-surface/25")}>
            <summary className="cursor-pointer list-none px-3 py-2.5 font-mono text-[11px] uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground focus-ring-terminal [&::-webkit-details-marker]:hidden">
              <span className="inline-flex w-full items-center justify-between gap-2">
                <span>Guest links — how it works</span>
                <span className="text-neon-dim group-open:rotate-90 transition-transform">›</span>
              </span>
            </summary>
            <div className="space-y-2 border-t border-border/60 px-3 pb-3 pt-2 font-mono text-xs leading-relaxed text-muted-foreground">
              <p>
                <span className="text-neon-dim"># </span>
                You will receive a secret key—save it to claim or delete this URL later.
              </p>
              <p>
                <span className="text-neon-dim"># </span>
                Without an account, links are removed after 30 days.
              </p>
              <p>
                <span className="text-neon-dim"># </span>
                Sign in for titles, tags, and links that stay until you delete them.
              </p>
            </div>
          </details>
        )}
      </form>

      {error && (
        <p className="mt-3 font-mono text-xs text-destructive" role="alert">
          {error}
        </p>
      )}

      {result && !user && (
        <AnonymousResultCard
          shortUrl={result.shortUrl}
          secret={result.secret}
          copiedLink={copiedLink}
          copiedSecret={copiedSecret}
          onCopyLink={() => copyToClipboard(result.shortUrl, "link")}
          onCopySecret={() => copyToClipboard(result.secret, "secret")}
        />
      )}

      {authResult && user && (
        <AuthResultCard
          shortUrl={authResult.shortUrl}
          copiedLink={copiedLink}
          onCopy={() => copyToClipboard(authResult.shortUrl, "link")}
        />
      )}
    </div>
  );
}
