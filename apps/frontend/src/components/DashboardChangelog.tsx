import { useEffect, useState } from "react";
import { ChevronDown, X } from "lucide-react";
import changelogRaw from "../../../../changelog.md?raw";

type ParsedLine =
  | { kind: "h1"; text: string }
  | { kind: "h2"; text: string }
  | { kind: "h3"; text: string }
  | { kind: "bullet"; text: string }
  | { kind: "text"; text: string };

function parseMarkdownLines(markdown: string): ParsedLine[] {
  return markdown
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line): ParsedLine => {
      if (line.startsWith("### ")) return { kind: "h3", text: line.slice(4).trim() };
      if (line.startsWith("## ")) return { kind: "h2", text: line.slice(3).trim() };
      if (line.startsWith("# ")) return { kind: "h1", text: line.slice(2).trim() };
      if (line.startsWith("- ")) return { kind: "bullet", text: line.slice(2).trim() };
      return { kind: "text", text: line };
    });
}

const parsed = parseMarkdownLines(changelogRaw);

export function DashboardChangelog() {
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    const collapsed = window.sessionStorage.getItem("dashboard-changelog-collapsed") === "1";
    setIsExpanded(!collapsed);
  }, []);

  useEffect(() => {
    window.sessionStorage.setItem("dashboard-changelog-collapsed", isExpanded ? "0" : "1");
  }, [isExpanded]);

  return (
    <section className="mt-4 overflow-hidden border border-border bg-background/60">
      <header className="flex items-center justify-between gap-2 border-b border-border px-3 py-2">
        <button
          type="button"
          onClick={() => setIsExpanded((prev) => !prev)}
          className="inline-flex min-h-[36px] flex-1 items-center gap-2 text-left font-mono text-[11px] uppercase tracking-wider text-muted-foreground transition-interact hover:text-foreground focus-ring-terminal"
          aria-expanded={isExpanded}
          aria-label={isExpanded ? "Ocultar changelog" : "Mostrar changelog"}
        >
          <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isExpanded ? "rotate-0" : "-rotate-90"}`} />
          <span>Changelog</span>
        </button>
      </header>

      {isExpanded && (
        <div className="space-y-2 p-3 font-mono text-xs">
          {parsed.map((item, index) => {
            if (item.kind === "h1") {
              return (
                <h3 key={`h1-${index}`} className="border-b border-border/50 pb-2 text-sm text-foreground">
                  {item.text}
                </h3>
              );
            }

            if (item.kind === "h2") {
              return (
                <h4 key={`h2-${index}`} className="pt-1 text-[11px] uppercase tracking-wider text-neon-dim">
                  {item.text}
                </h4>
              );
            }

            if (item.kind === "h3") {
              return (
                <h5 key={`h3-${index}`} className="pt-1 text-[11px] text-foreground/90">
                  {item.text}
                </h5>
              );
            }

            if (item.kind === "bullet") {
              return (
                <p key={`b-${index}`} className="pl-3 leading-relaxed text-muted-foreground">
                  • {item.text}
                </p>
              );
            }

            return (
              <p key={`t-${index}`} className="text-muted-foreground">
                {item.text}
              </p>
            );
          })}
        </div>
      )}
    </section>
  );
}
