import { ChevronDown, X } from "lucide-react";
import { useCallback, useEffect, useId, useState } from "react";
import { useTagsStore } from "@/stores/tags-store";
import { cn } from "@/lib/utils";

function tagKey(name: string) {
  return name.trim().toLowerCase();
}

function isSelected(selected: string[], name: string) {
  return selected.some((t) => tagKey(t) === tagKey(name));
}

type TagPickerProps = {
  value: string[];
  onChange: (tags: string[]) => void;
  className?: string;
};

export function TagPicker({ value, onChange, className }: TagPickerProps) {
  const panelId = useId();
  const knownTags = useTagsStore((s) => s.knownTags);
  const catalogMatches = useTagsStore((s) => s.catalogMatches);
  const catalogLoading = useTagsStore((s) => s.catalogLoading);
  const searchCatalog = useTagsStore((s) => s.searchCatalog);

  const [open, setOpen] = useState(false);
  const [panelQuery, setPanelQuery] = useState("");
  const [draft, setDraft] = useState("");

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => {
      void searchCatalog(panelQuery);
    }, 280);
    return () => window.clearTimeout(t);
  }, [panelQuery, open, searchCatalog]);

  useEffect(() => {
    if (!open) setPanelQuery("");
  }, [open]);

  const q = panelQuery.trim().toLowerCase();
  const filteredMine = knownTags.filter(
    (n) => !isSelected(value, n) && (q === "" || tagKey(n).includes(q)),
  );

  const catalogToShow = catalogMatches.filter((t) => !isSelected(value, t.name));

  const add = useCallback(
    (name: string) => {
      const n = name.trim();
      if (!n || isSelected(value, n)) return;
      onChange([...value, n]);
    },
    [value, onChange],
  );

  const remove = (name: string) => {
    onChange(value.filter((t) => tagKey(t) !== tagKey(name)));
  };

  const commitDraft = () => {
    const parts = draft
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (parts.length === 0) return;
    let next = [...value];
    for (const p of parts) {
      if (!next.some((t) => tagKey(t) === tagKey(p))) next.push(p);
    }
    onChange(next);
    setDraft("");
  };

  const onDraftKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commitDraft();
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex flex-wrap gap-1.5 min-h-[36px] items-center">
        {value.map((t) => (
          <span
            key={tagKey(t)}
            className="inline-flex items-center gap-1 font-mono text-[11px] tracking-wide border border-border px-2 py-1 bg-surface-raised text-foreground"
          >
            {t}
            <button
              type="button"
              onClick={() => remove(t)}
              className="p-0.5 rounded-sm focus-ring-terminal text-muted-foreground hover:text-foreground"
              aria-label={`Remove tag ${t}`}
            >
              <X className="h-3 w-3" strokeWidth={2.5} aria-hidden />
            </button>
          </span>
        ))}
        {value.length === 0 && (
          <span className="font-mono text-[11px] text-muted-foreground/90">No tags yet.</span>
        )}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((o) => !o)}
          className="inline-flex items-center justify-center gap-2 min-h-11 shrink-0 border border-border px-4 font-mono text-[10px] uppercase tracking-wider text-muted-foreground hover:border-foreground hover:text-foreground focus-ring-terminal sm:w-auto"
        >
          Known tags
          <ChevronDown className={cn("h-4 w-4 transition-transform shrink-0", open && "rotate-180")} aria-hidden />
        </button>
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onDraftKeyDown}
          placeholder="New tag, Enter to add"
          className={cn(
            "box-border min-w-0 flex-1 min-h-11 w-full border border-dashed border-border bg-transparent",
            "px-3 py-2 font-mono text-xs leading-5 text-foreground placeholder:text-muted-foreground",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary",
          )}
        />
      </div>

      {open && (
        <div
          id={panelId}
          className="mt-1 border border-border bg-background shadow-[0_8px_24px_hsl(0_0%_0%/0.25)] max-h-[min(18rem,50vh)] overflow-hidden flex flex-col"
        >
          <div className="p-2 border-b border-border shrink-0">
            <input
              type="search"
              value={panelQuery}
              onChange={(e) => setPanelQuery(e.target.value)}
              placeholder="Search your tags & catalog…"
              className="box-border w-full min-h-11 bg-surface-raised border border-border px-3 py-2 font-mono text-xs leading-5 text-foreground placeholder:text-muted-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
          </div>
          <div className="overflow-y-auto flex-1 p-2 space-y-3 text-left">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">Your tags</p>
              {filteredMine.length === 0 ? (
                <p className="font-mono text-[11px] text-muted-foreground/80 py-1">No matches in your links.</p>
              ) : (
                <ul className="space-y-0.5">
                  {filteredMine.map((n) => (
                    <li key={tagKey(n)}>
                      <button
                        type="button"
                        onClick={() => add(n)}
                        className="w-full text-left font-mono text-xs py-1.5 px-2 hover:bg-surface-raised focus-ring-terminal rounded-sm"
                      >
                        {n}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">
                Catalog{catalogLoading ? " — loading…" : ""}
              </p>
              {catalogToShow.length === 0 && !catalogLoading ? (
                <p className="font-mono text-[11px] text-muted-foreground/80 py-1">Type above to search existing tags.</p>
              ) : (
                <ul className="space-y-0.5">
                  {catalogToShow.map((t) => (
                    <li key={t.id}>
                      <button
                        type="button"
                        onClick={() => add(t.name)}
                        className="w-full text-left font-mono text-xs py-1.5 px-2 hover:bg-surface-raised focus-ring-terminal rounded-sm"
                      >
                        {t.name}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
