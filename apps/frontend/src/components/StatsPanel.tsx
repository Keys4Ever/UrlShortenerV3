import type { UrlItem, UrlStats } from "@/lib/api/types";
import { useCallback, useEffect, useState } from "react";
import { ApiError } from "@/lib/api/client";
import { updateUrl } from "@/lib/api/urls-api";
import { useAuthStore } from "@/stores/auth-store";
import { useTagsStore } from "@/stores/tags-store";
import { cn } from "@/lib/utils";
import { DashboardSideTtyBar } from "./DashboardSideSlot";
import {
  ClickSummary,
  CountryBreakdown,
  DeviceBreakdown,
  ReferrerBreakdown,
  UrlEditForm,
  UrlHeader,
  UrlReadOnlyInfo,
} from "./StatsPanelSections";

interface StatsPanelProps {
  url: UrlItem;
  stats: UrlStats;
  onClose: () => void;
  embedded?: boolean;
  onHideSide?: () => void;
  onUrlSaved?: () => void;
}

export default function StatsPanel({
  url,
  stats,
  onClose,
  embedded = false,
  onHideSide,
  onUrlSaved = () => {},
}: StatsPanelProps) {
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);
  const [orig, setOrig] = useState(url.originalUrl);
  const [title, setTitle] = useState(url.title ?? "");
  const [desc, setDesc] = useState(url.description ?? "");
  const [tags, setTags] = useState<string[]>(() => [...url.tags]);
  const [saveErr, setSaveErr] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setEditing(false);
    setOrig(url.originalUrl);
    setTitle(url.title ?? "");
    setDesc(url.description ?? "");
    setTags([...url.tags]);
    setSaveErr(null);
  }, [url.id]);

  const resetDraftFromUrl = useCallback(() => {
    setOrig(url.originalUrl);
    setTitle(url.title ?? "");
    setDesc(url.description ?? "");
    setTags([...url.tags]);
    setSaveErr(null);
  }, [url]);

  const beginEdit = () => {
    resetDraftFromUrl();
    setEditing(true);
  };

  const cancelEdit = () => {
    resetDraftFromUrl();
    setEditing(false);
  };

  const handleSave = async () => {
    const token = useAuthStore.getState().accessToken;
    if (!token) {
      setSaveErr("Not authenticated.");
      return;
    }
    const trimmed = orig.trim();
    if (!trimmed) {
      setSaveErr("Destination URL is required.");
      return;
    }
    setSaving(true);
    setSaveErr(null);
    try {
      await updateUrl(token, url.id, {
        originalUrl: trimmed,
        title: title.trim(),
        description: desc.trim(),
        tags,
      });
      useTagsStore.getState().addKnownFromNames(tags);
      onUrlSaved();
      setEditing(false);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Could not save changes";
      setSaveErr(message);
    } finally {
      setSaving(false);
    }
  };

  const copyUrl = () => {
    void navigator.clipboard.writeText(url.shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const header = (
    <DashboardSideTtyBar
      srTitle={`Link details: /${url.shortCode}`}
      onBack={embedded ? onClose : undefined}
      onCollapse={embedded && onHideSide ? onHideSide : !embedded ? onClose : undefined}
      closeAriaLabel={!embedded ? "Close details" : "Close side panel"}
    />
  );

  const body = (
    <div className="space-y-3 px-safe py-3 sm:px-3">
      <div className="space-y-1.5">
        <UrlHeader
          shortCode={url.shortCode}
          copied={copied}
          editing={editing}
          onCopy={copyUrl}
          onToggleEdit={editing ? cancelEdit : beginEdit}
        />

        {editing ? (
          <UrlEditForm
            urlId={url.id}
            orig={orig}
            title={title}
            desc={desc}
            tags={tags}
            saveErr={saveErr}
            saving={saving}
            setOrig={setOrig}
            setTitle={setTitle}
            setDesc={setDesc}
            setTags={setTags}
            onSave={() => void handleSave()}
            onCancel={cancelEdit}
          />
        ) : (
          <UrlReadOnlyInfo url={url} />
        )}
      </div>

      <ClickSummary stats={stats} />
      <DeviceBreakdown stats={stats} />
      <ReferrerBreakdown stats={stats} />
      <CountryBreakdown stats={stats} />
    </div>
  );

  if (embedded) {
    return (
      <div className="flex min-h-0 w-full flex-1 flex-col touch-manipulation bg-surface pb-[env(safe-area-inset-bottom,0px)]">
        {header}
        <div className="min-h-0 flex-1 overflow-y-auto">{body}</div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex w-full touch-manipulation flex-col pb-[env(safe-area-inset-bottom,0px)]",
        "max-h-[min(52dvh,calc(100dvh-10rem))] flex-shrink-0 overflow-auto border-t border-border bg-card shadow-[0_0_28px_hsl(110_100%_55%/0.05)] md:max-h-none md:w-[min(320px,38vw)] md:max-w-[min(320px,38vw)] md:border-l md:border-t-0",
      )}
    >
      {header}
      {body}
    </div>
  );
}
