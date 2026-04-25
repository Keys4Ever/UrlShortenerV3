import { Check, Copy } from "lucide-react";
import { TagPicker } from "@/components/TagPicker";
import { cn } from "@/lib/utils";

type AuthMetaDetailsProps = {
  title: string;
  description: string;
  tags: string[];
  setTitle: (value: string) => void;
  setDescription: (value: string) => void;
  setTags: (value: string[]) => void;
  labelBase: string;
  inputBase: string;
  metaHintPulse: boolean;
  onMetaHintInteract: () => void;
};

export function AuthMetaDetails({
  title,
  description,
  tags,
  setTitle,
  setDescription,
  setTags,
  labelBase,
  inputBase,
  metaHintPulse,
  onMetaHintInteract,
}: AuthMetaDetailsProps) {
  return (
    <details className="group border border-dashed border-border/70 bg-background/30 open:border-border open:bg-background/50">
      <summary
        className={`cursor-pointer list-none px-2 py-2 font-mono text-[10px] uppercase tracking-wider transition-colors [&::-webkit-details-marker]:hidden ${
          metaHintPulse
            ? "animate-pulse bg-primary text-primary-foreground hover:text-primary-foreground"
            : "text-muted-foreground hover:text-foreground"
        }`}
        onClick={onMetaHintInteract}
      >
        <span className="inline-flex w-full items-center justify-between gap-2">
          <span>Title, notes & tags</span>
          <span
            className={`group-open:rotate-90 transition-transform ${
              metaHintPulse ? "text-primary-foreground" : "text-neon-dim"
            }`}
          >
            ›
          </span>
        </span>
      </summary>
      <div className="space-y-3 border-t border-border/50 px-2 pb-3 pt-3">
        <div className="space-y-1">
          <label htmlFor="embed-url-title" className={labelBase}>
            Title
          </label>
          <input
            id="embed-url-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Optional"
            className={cn(inputBase, "min-h-[40px] text-xs")}
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="embed-url-desc" className={labelBase}>
            Notes
          </label>
          <textarea
            id="embed-url-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Private description"
            rows={2}
            className={cn(inputBase, "min-h-[4rem] resize-y text-xs")}
          />
        </div>
        <div className="space-y-1">
          <span className={cn(labelBase, "block")}>Tags</span>
          <TagPicker value={tags} onChange={setTags} className="[&_button]:text-[10px]" />
        </div>
      </div>
    </details>
  );
}

type GuestHelpDetailsProps = {
  compact?: boolean;
};

export function GuestHelpDetails({ compact = false }: GuestHelpDetailsProps) {
  return (
    <details className="group border border-dashed border-border/70 bg-background/30 open:border-border/90 open:bg-background/40">
      <summary className="cursor-pointer list-none px-2 py-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground [&::-webkit-details-marker]:hidden">
        <span className="inline-flex w-full items-center justify-between gap-2">
          <span>Guest links — how it works</span>
          <span className="text-neon-dim group-open:rotate-90 transition-transform">›</span>
        </span>
      </summary>
      <div
        className={cn(
          "space-y-2 border-t border-border/50 font-mono text-muted-foreground",
          compact ? "px-2 pb-3 pt-2 text-[11px] leading-relaxed" : "px-3 pb-3 pt-2 text-xs leading-relaxed",
        )}
      >
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
  );
}

type AuthResultCardProps = {
  shortUrl: string;
  copiedLink: boolean;
  onCopy: () => void;
  compact?: boolean;
};

export function AuthResultCard({ shortUrl, copiedLink, onCopy, compact = false }: AuthResultCardProps) {
  if (compact) {
    return (
      <div className="mt-3 flex min-w-0 flex-col gap-2 border border-neon/25 bg-surface/40 px-3 py-2.5">
        <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">Created</span>
        <div className="flex min-w-0 items-start gap-2">
          <p className="min-w-0 flex-1 font-mono text-xs text-neon break-all leading-snug">{shortUrl}</p>
          <button
            type="button"
            onClick={onCopy}
            aria-label={copiedLink ? "Copied" : "Copy link"}
            className="shrink-0 inline-flex h-9 w-9 items-center justify-center border border-border text-muted-foreground hover:border-foreground hover:text-foreground focus-ring-terminal"
          >
            {copiedLink ? <Check className="h-4 w-4 text-neon" strokeWidth={2.25} /> : <Copy className="h-4 w-4" strokeWidth={2.25} />}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 border border-border p-4 glow-neon">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <span className="font-mono text-xs text-muted-foreground uppercase tracking-wider">Short link</span>
          <div className="font-mono text-sm text-neon mt-1 break-all">{shortUrl}</div>
        </div>
        <button
          type="button"
          onClick={onCopy}
          aria-label={copiedLink ? "Copied to clipboard" : "Copy short URL"}
          className="inline-flex h-11 min-w-[5.75rem] shrink-0 items-center justify-center border border-border px-5 font-mono text-muted-foreground transition-interact hover:border-foreground hover:text-foreground focus-ring-terminal"
        >
          {copiedLink ? (
            <Check className="h-[18px] w-[18px] text-neon" strokeWidth={2.25} aria-hidden />
          ) : (
            <Copy className="h-[18px] w-[18px]" strokeWidth={2.25} aria-hidden />
          )}
        </button>
      </div>
    </div>
  );
}

type AnonymousResultCardProps = {
  shortUrl: string;
  secret: string;
  copiedLink: boolean;
  copiedSecret: boolean;
  onCopyLink: () => void;
  onCopySecret: () => void;
  compact?: boolean;
};

export function AnonymousResultCard({
  shortUrl,
  secret,
  copiedLink,
  copiedSecret,
  onCopyLink,
  onCopySecret,
  compact = false,
}: AnonymousResultCardProps) {
  if (compact) {
    return (
      <div className="mt-3 space-y-2 border border-border bg-surface/40 p-3 text-left">
        <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Anonymous link</p>
        <div className="flex min-w-0 items-start gap-2">
          <p className="min-w-0 flex-1 font-mono text-xs text-neon break-all">{shortUrl}</p>
          <button
            type="button"
            onClick={onCopyLink}
            className="shrink-0 inline-flex h-9 w-9 items-center justify-center border border-border focus-ring-terminal"
            aria-label="Copy"
          >
            {copiedLink ? <Check className="h-4 w-4 text-neon" /> : <Copy className="h-4 w-4" />}
          </button>
        </div>
        <p className="font-mono text-[10px] text-muted-foreground">Secret (save it):</p>
        <div className="flex gap-2">
          <code className="min-w-0 flex-1 break-all border border-border bg-surface-raised px-2 py-1.5 font-mono text-[10px]">{secret}</code>
          <button
            type="button"
            onClick={onCopySecret}
            className="shrink-0 h-9 w-9 border border-border inline-flex items-center justify-center"
            aria-label="Copy secret"
          >
            {copiedSecret ? <Check className="h-4 w-4 text-neon" /> : <Copy className="h-4 w-4" />}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 border border-border bg-surface/30 p-4 space-y-3 glow-neon">
      <div className="flex flex-col gap-1 font-mono text-[11px] text-muted-foreground uppercase tracking-wider border-b border-border/80 pb-2">
        <span>stdout — 200 OK</span>
        <span className="text-neon-dim normal-case tracking-normal"># anonymous session</span>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <span className="font-mono text-xs text-muted-foreground uppercase tracking-wider">Short link</span>
          <div className="font-mono text-sm text-neon mt-1 break-all">{shortUrl}</div>
        </div>
        <button
          type="button"
          onClick={onCopyLink}
          aria-label={copiedLink ? "Copied to clipboard" : "Copy short URL"}
          className="inline-flex h-11 min-w-[5.75rem] shrink-0 items-center justify-center border border-border px-5 font-mono text-muted-foreground transition-interact hover:border-foreground hover:text-foreground focus-ring-terminal"
        >
          {copiedLink ? (
            <Check className="h-[18px] w-[18px] text-neon" strokeWidth={2.25} aria-hidden />
          ) : (
            <Copy className="h-[18px] w-[18px]" strokeWidth={2.25} aria-hidden />
          )}
        </button>
      </div>

      <div className="border-t border-border pt-3">
        <span className="font-mono text-xs text-muted-foreground uppercase tracking-wider">Secret key</span>
        <p className="font-mono text-[11px] text-muted-foreground/90 mt-1 mb-2 leading-snug">
          Store this token—required later to claim or delete this link.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
          <div className="font-mono text-xs flex-1 bg-surface-raised border border-border px-3 py-2 text-foreground break-all select-all min-h-[44px] flex items-center">
            {secret}
          </div>
          <button
            type="button"
            onClick={onCopySecret}
            aria-label={copiedSecret ? "Secret copied" : "Copy secret key"}
            className="inline-flex h-11 min-w-[5.75rem] shrink-0 items-center justify-center border border-border px-5 font-mono text-muted-foreground transition-interact hover:border-foreground hover:text-foreground focus-ring-terminal"
          >
            {copiedSecret ? (
              <Check className="h-[18px] w-[18px] text-neon" strokeWidth={2.25} aria-hidden />
            ) : (
              <Copy className="h-[18px] w-[18px]" strokeWidth={2.25} aria-hidden />
            )}
          </button>
        </div>
      </div>

      <div className="border-t border-border pt-3">
        <p className="font-mono text-xs text-destructive">
          <span className="text-neon-dim">! </span>
          No account: link removed after 30 days. Losing this key means losing control of the link.
        </p>
      </div>
    </div>
  );
}
