import { useAuth } from "@/hooks/use-auth";
import { BrandWordmark } from "@/components/BrandWordmark";

interface HeaderProps {
  onAuthClick: () => void;
  onNavigate: (page: "home" | "dashboard") => void;
  currentPage: "home" | "dashboard";
}

export default function Header({ onAuthClick, onNavigate, currentPage }: HeaderProps) {
  const { user, logout } = useAuth();

  return (
    <header className="border-b border-border flex flex-wrap items-center justify-between gap-y-2 px-safe pt-safe pb-2 sm:pl-[max(1.5rem,env(safe-area-inset-left,0px))] sm:pr-[max(1.5rem,env(safe-area-inset-right,0px))] touch-manipulation">
      <div className="flex flex-wrap items-center gap-3 sm:gap-6 min-w-0">
        <button
          type="button"
          onClick={() => onNavigate("home")}
          aria-label="shrt.dev — home"
          className="flex items-center gap-2 min-h-[44px] px-1 -mx-1 transition-opacity hover:opacity-90 focus-ring-terminal"
        >
          <BrandWordmark size="header" />
        </button>

        {user && (
          <nav className="flex gap-0 border border-border" aria-label="Main">
            <button
              type="button"
              onClick={() => onNavigate("home")}
              className={`min-h-[44px] px-3 sm:px-4 py-2 font-mono text-xs uppercase tracking-wider transition-interact focus-ring-terminal ${
                currentPage === "home" ? "bg-surface-raised text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Shorten
            </button>
            <button
              type="button"
              onClick={() => onNavigate("dashboard")}
              className={`min-h-[44px] px-3 sm:px-4 py-2 font-mono text-xs uppercase tracking-wider border-l border-border transition-interact focus-ring-terminal ${
                currentPage === "dashboard" ? "bg-surface-raised text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Dashboard
            </button>
          </nav>
        )}
      </div>

      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {user ? (
          <>
            <div className="flex min-h-[44px] items-center gap-2 border border-border px-2 sm:px-3 py-1 max-w-[min(100%,12rem)]">
              <div className="w-5 h-5 shrink-0 overflow-hidden border border-border">
                <img src={user.pfp} alt="" className="w-full h-full object-cover" />
              </div>
              <span className="font-mono text-xs text-foreground truncate">{user.nickname}</span>
            </div>
            <button
              type="button"
              onClick={logout}
              className="font-mono text-xs text-muted-foreground hover:text-foreground px-3 py-2 min-h-[44px] border border-border transition-interact hover:border-foreground focus-ring-terminal"
            >
              Log out
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={onAuthClick}
            className="font-mono text-xs uppercase tracking-wider px-4 py-2 min-h-[44px] border border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-interact focus-ring-terminal"
          >
            Sign in
          </button>
        )}
      </div>
    </header>
  );
}
