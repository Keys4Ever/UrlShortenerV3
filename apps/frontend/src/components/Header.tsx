import { useAuth } from "@/hooks/use-auth";
import { BrandWordmark } from "@/components/BrandWordmark";
import { cn } from "@/lib/utils";

interface HeaderProps {
  onAuthClick: () => void;
  onNavigate: (page: "home" | "dashboard") => void;
  currentPage: "home" | "dashboard";
}

const navBtn =
  "min-h-[44px] flex-1 px-3 font-mono text-xs uppercase tracking-wider transition-interact focus-ring-terminal sm:flex-none sm:px-4";

export default function Header({ onAuthClick, onNavigate, currentPage }: HeaderProps) {
  const { user, logout } = useAuth();

  const nav = user ? (
    <nav
      className={cn(
        "flex w-full overflow-hidden border border-border md:w-auto md:shrink-0",
        "md:gap-0",
      )}
      aria-label="Main"
    >
      <button
        type="button"
        onClick={() => onNavigate("home")}
        className={cn(
          navBtn,
          currentPage === "home" ? "bg-surface-raised text-foreground" : "text-muted-foreground hover:text-foreground",
        )}
      >
        Shorten
      </button>
      <button
        type="button"
        onClick={() => onNavigate("dashboard")}
        className={cn(
          navBtn,
          "border-l border-border md:border-l",
          currentPage === "dashboard" ? "bg-surface-raised text-foreground" : "text-muted-foreground hover:text-foreground",
        )}
      >
        Dashboard
      </button>
    </nav>
  ) : null;

  return (
    <header className="border-b border-border px-safe pt-safe pb-3 touch-manipulation sm:pb-2 sm:pl-[max(1.5rem,env(safe-area-inset-left,0px))] sm:pr-[max(1.5rem,env(safe-area-inset-right,0px))]">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-4">
        <div className="flex min-w-0 w-full items-center gap-3 md:w-auto md:min-w-0 md:flex-1">
          <button
            type="button"
            onClick={() => onNavigate("home")}
            aria-label="shrt.dev — home"
            className="flex min-h-[44px] min-w-0 shrink-0 items-center px-1 -mx-1 transition-opacity hover:opacity-90 focus-ring-terminal"
          >
            <BrandWordmark size="header" />
          </button>

          {user ? <div className="hidden md:block">{nav}</div> : null}

          <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
            {user ? (
              <>
                <div className="flex max-w-[min(100%,11rem)] min-h-[44px] items-center gap-2 border border-border px-2 py-1 sm:max-w-[12rem] sm:px-3">
                  <div className="h-5 w-5 shrink-0 overflow-hidden border border-border">
                    <img src={user.pfp} alt="" className="h-full w-full object-cover" />
                  </div>
                  <span className="truncate font-mono text-xs text-foreground">{user.nickname}</span>
                </div>
                <button
                  type="button"
                  onClick={logout}
                  className="min-h-[44px] border border-border px-3 py-2 font-mono text-xs text-muted-foreground transition-interact hover:border-foreground hover:text-foreground focus-ring-terminal"
                >
                  Log out
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={onAuthClick}
                className="min-h-[44px] border border-primary px-4 py-2 font-mono text-xs uppercase tracking-wider text-primary transition-interact hover:bg-primary hover:text-primary-foreground focus-ring-terminal"
              >
                Sign in
              </button>
            )}
          </div>
        </div>

        {user ? <div className="md:hidden">{nav}</div> : null}
      </div>
    </header>
  );
}
