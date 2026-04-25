type DashboardFiltersBarProps = {
  search: string;
  selectedTag: string;
  availableTags: string[];
  onSearchChange: (value: string) => void;
  onTagChange: (value: string) => void;
};

export function DashboardFiltersBar({
  search,
  selectedTag,
  availableTags,
  onSearchChange,
  onTagChange,
}: DashboardFiltersBarProps) {
  return (
    <div className="border-b border-border px-safe py-3 sm:pl-[max(1.5rem,env(safe-area-inset-left,0px))] sm:pr-[max(1.5rem,env(safe-area-inset-right,0px))]">
      <div className="flex flex-col gap-2 md:flex-row md:items-center">
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Filter by code, URL, title, description or tag"
          className="w-full min-h-[44px] bg-input border border-border px-3 py-2 font-mono text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary md:min-h-[40px] md:flex-1"
          aria-label="Filter links by text"
        />
        <select
          value={selectedTag}
          onChange={(e) => onTagChange(e.target.value)}
          className="w-full min-h-[44px] bg-input border border-border px-3 py-2 font-mono text-xs text-foreground focus:outline-none focus:border-primary focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary md:min-h-[40px] md:w-56"
          aria-label="Filter links by tag"
        >
          <option value="all">All tags</option>
          {availableTags.map((tag) => (
            <option key={tag} value={tag}>
              {tag}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
