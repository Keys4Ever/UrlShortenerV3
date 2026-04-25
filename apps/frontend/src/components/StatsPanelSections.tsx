import type { UrlItem, UrlStats } from "@/lib/api/types";
import { Check, Copy, Pencil } from "lucide-react";
import { TagPicker } from "@/components/TagPicker";

type UrlHeaderProps = {
  shortCode: string;
  copied: boolean;
  editing: boolean;
  onCopy: () => void;
  onToggleEdit: () => void;
};

export function UrlHeader({ shortCode, copied, editing, onCopy, onToggleEdit }: UrlHeaderProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="min-w-0 shrink-0 font-mono text-xs text-neon">/{shortCode}</span>
      <button
        type="button"
        onClick={onCopy}
        aria-label={copied ? "Copied to clipboard" : `Copy short URL /${shortCode}`}
        className="inline-flex h-9 min-h-9 min-w-[4.25rem] shrink-0 items-center justify-center border border-border px-3 text-muted-foreground transition-interact hover:border-foreground hover:text-foreground focus-ring-terminal touch-manipulation"
      >
        {copied ? (
          <Check className="h-3.5 w-3.5 text-neon" strokeWidth={2} aria-hidden />
        ) : (
          <Copy className="h-2.5 w-2.5" strokeWidth={2} aria-hidden />
        )}
      </button>
      <button
        type="button"
        onClick={onToggleEdit}
        className="inline-flex h-9 min-h-9 items-center gap-1 border border-border px-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground transition-interact hover:border-foreground hover:text-foreground focus-ring-terminal touch-manipulation"
      >
        <Pencil className="h-3 w-3" aria-hidden />
        {editing ? "Cancel" : "Edit"}
      </button>
    </div>
  );
}

type UrlEditFormProps = {
  urlId: number;
  orig: string;
  title: string;
  desc: string;
  tags: string[];
  saveErr: string | null;
  saving: boolean;
  setOrig: (value: string) => void;
  setTitle: (value: string) => void;
  setDesc: (value: string) => void;
  setTags: (value: string[]) => void;
  onSave: () => void;
  onCancel: () => void;
};

export function UrlEditForm({
  urlId,
  orig,
  title,
  desc,
  tags,
  saveErr,
  saving,
  setOrig,
  setTitle,
  setDesc,
  setTags,
  onSave,
  onCancel,
}: UrlEditFormProps) {
  return (
    <div className="space-y-2 border border-border p-2 bg-surface/30">
      <div className="space-y-1">
        <label htmlFor={`edit-dest-${urlId}`} className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          Destination
        </label>
        <input
          id={`edit-dest-${urlId}`}
          type="url"
          value={orig}
          onChange={(e) => setOrig(e.target.value)}
          className="w-full min-h-[40px] bg-transparent border border-border px-2 py-1.5 font-mono text-[11px] text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
        />
      </div>
      <div className="space-y-1">
        <label htmlFor={`edit-title-${urlId}`} className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          Title
        </label>
        <input
          id={`edit-title-${urlId}`}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full min-h-[40px] bg-transparent border border-border px-2 py-1.5 font-mono text-[11px] text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
        />
      </div>
      <div className="space-y-1">
        <label htmlFor={`edit-desc-${urlId}`} className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          Description
        </label>
        <textarea
          id={`edit-desc-${urlId}`}
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          rows={2}
          className="w-full resize-y min-h-[3.5rem] bg-transparent border border-border px-2 py-1.5 font-mono text-[11px] text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
        />
      </div>
      <div className="space-y-1">
        <span className="block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Tags</span>
        <TagPicker value={tags} onChange={setTags} />
      </div>
      {saveErr && (
        <p className="font-mono text-[11px] text-destructive" role="alert">
          {saveErr}
        </p>
      )}
      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="min-h-[40px] flex-1 border border-border bg-primary px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-primary-foreground hover:opacity-90 disabled:opacity-50 focus-ring-terminal"
        >
          {saving ? "Saving…" : "Save"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="min-h-[40px] flex-1 border border-border px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground hover:border-foreground hover:text-foreground disabled:opacity-50 focus-ring-terminal"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export function UrlReadOnlyInfo({ url }: { url: UrlItem }) {
  return (
    <>
      <div className="font-mono text-[11px] text-muted-foreground break-all leading-snug">{url.originalUrl}</div>
      {url.title ? <div className="text-xs text-foreground">{url.title}</div> : null}
      {(url.description ?? "").trim() ? (
        <div className="space-y-0.5 border-l-2 border-neon/25 pl-2">
          <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground/90">Description</span>
          <p className="text-[11px] text-muted-foreground leading-relaxed whitespace-pre-wrap">{url.description.trim()}</p>
        </div>
      ) : null}
      <div className="flex gap-1 flex-wrap">
        {url.tags.map((t) => (
          <span key={t} className="font-mono text-[10px] px-1 py-0.5 border border-border text-muted-foreground">
            {t}
          </span>
        ))}
      </div>
    </>
  );
}

export function ClickSummary({ stats }: { stats: UrlStats }) {
  return (
    <div className="border-t border-border pt-3">
      <div className="flex gap-5 mb-2">
        <div>
          <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">All-time clicks</div>
          <div className="font-mono text-lg font-bold tabular-nums leading-tight text-foreground">{stats.totalClicks.toLocaleString()}</div>
        </div>
        <div>
          <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">Last 24 hours</div>
          <div className="font-mono text-lg font-bold tabular-nums leading-tight text-neon">{stats.clicksLast24h.toLocaleString()}</div>
        </div>
      </div>
    </div>
  );
}

export function DeviceBreakdown({ stats }: { stats: UrlStats }) {
  const deviceCounts = stats.deviceBreakdown.map((d) => d.count);
  const maxDevice = deviceCounts.length ? Math.max(...deviceCounts) : 1;

  return (
    <div className="border-t border-border pt-3">
      <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Devices</div>
      <div className="space-y-1.5">
        {stats.deviceBreakdown.length === 0 && (
          <p className="font-mono text-[11px] text-muted-foreground">No device data yet.</p>
        )}
        {stats.deviceBreakdown.map((d) => (
          <div key={d.type} className="flex items-center gap-2">
            <span className="font-mono text-[11px] text-muted-foreground w-14 shrink-0">{d.type}</span>
            <div className="flex-1 h-2 bg-surface-raised border border-border overflow-hidden">
              <div className="h-full bg-primary" style={{ width: `${maxDevice ? (d.count / maxDevice) * 100 : 0}%` }} />
            </div>
            <span className="font-mono text-[11px] text-foreground w-8 shrink-0 text-right tabular-nums">{d.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ReferrerBreakdown({ stats }: { stats: UrlStats }) {
  if (stats.topReferrers.length === 0) return null;
  const referrerCounts = stats.topReferrers.map((r) => r.count);
  const maxReferrer = referrerCounts.length ? Math.max(...referrerCounts) : 1;

  return (
    <div className="border-t border-border pt-3">
      <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Referrers</div>
      <div className="space-y-1.5">
        {stats.topReferrers.map((r) => (
          <div key={r.referrer} className="flex items-center gap-2">
            <span className="min-w-0 max-w-[45%] shrink truncate font-mono text-[11px] text-muted-foreground sm:max-w-none sm:w-28">
              {r.referrer}
            </span>
            <div className="flex-1 h-2 bg-surface-raised border border-border overflow-hidden">
              <div className="h-full bg-neon-dim" style={{ width: `${(r.count / maxReferrer) * 100}%` }} />
            </div>
            <span className="font-mono text-[11px] text-foreground w-8 shrink-0 text-right tabular-nums">{r.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CountryBreakdown({ stats }: { stats: UrlStats }) {
  if (stats.countryBreakdown.length === 0) return null;

  return (
    <div className="border-t border-border pt-3">
      <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Countries</div>
      <div className="flex flex-wrap gap-1.5">
        {stats.countryBreakdown.map((c) => (
          <div key={c.country} className="font-mono text-[11px] border border-border px-1.5 py-0.5 text-muted-foreground">
            {c.country} <span className="text-foreground">{c.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
