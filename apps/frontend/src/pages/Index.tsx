import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import Header from "@/components/Header";
import AuthModal from "@/components/AuthModal";
import UrlShortener from "@/components/UrlShortener";
import Dashboard from "@/components/Dashboard";
import { BrandWordmark } from "@/components/BrandWordmark";

export default function Index() {
  const { user } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [page, setPage] = useState<"home" | "dashboard">("home");

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background">
      <Header
        onAuthClick={() => setAuthOpen(true)}
        onNavigate={setPage}
        currentPage={page}
      />

      {page === "home" ? (
        <main className="flex-1 flex flex-col justify-center landscape:justify-start px-safe pb-[max(4rem,env(safe-area-inset-bottom,0px))] pt-10 sm:pb-20 sm:pl-[max(1.5rem,env(safe-area-inset-left,0px))] sm:pr-[max(1.5rem,env(safe-area-inset-right,0px))] md:justify-center md:landscape:justify-center md:pt-0 md:pl-[clamp(1.5rem,11vw,12%)] md:pr-8">
          <div className="mb-8">
            <h1 className="mb-2">
              <BrandWordmark size="hero" />
            </h1>
            <p className="font-mono text-base leading-relaxed text-muted-foreground sm:text-sm sm:leading-normal">
              {user ? "Shorten a link (saved to your account)" : "Paste a URL, get a short link."}
            </p>
            <p className="font-mono text-[11px] text-muted-foreground/90 mt-3 tabular-nums">
              <span className="text-neon-dim">{user ? user.nickname : "guest"}</span>
              <span className="text-muted-foreground">@shrt.dev</span>
              <span className="text-muted-foreground">:~$ </span>
              <span className="text-muted-foreground/70">shorten</span>
              <span
                className="inline-block w-[0.45em] h-[1em] ml-0.5 align-text-bottom bg-neon/80 animate-blink motion-reduce:animate-none motion-reduce:opacity-90"
                aria-hidden
              />
            </p>
          </div>

          <UrlShortener />

          {!user && (
            <div className="mt-12 font-mono text-sm text-muted-foreground max-w-md space-y-2 border border-border border-dashed border-muted-foreground/25 p-4 bg-surface/40 sm:text-xs">
              <p>
                <span className="text-neon-dim"># </span>
                Without an account, new links are deleted after 30 days.
              </p>
              <p>
                <span className="text-neon-dim"># </span>
                <button
                  type="button"
                  onClick={() => setAuthOpen(true)}
                  className="text-neon underline-offset-2 hover:underline min-h-[44px] inline-flex items-center transition-interact rounded-sm focus-ring-terminal"
                >
                  Sign in
                </button>{" "}
                to keep links until you remove them.
              </p>
            </div>
          )}
        </main>
      ) : (
        <Dashboard />
      )}

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  );
}
