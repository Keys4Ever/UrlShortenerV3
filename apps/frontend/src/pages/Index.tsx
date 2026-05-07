import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import Header from "@/components/Header";
import AuthModal from "@/components/AuthModal";
import UrlShortener from "@/components/UrlShortener";
import Dashboard from "@/components/Dashboard";
import { BrandWordmark } from "@/components/BrandWordmark";
import meguminHero from "@/public/megumin2.png";

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
        <main className="flex min-h-0 min-w-0 flex-1 flex-col justify-center landscape:justify-start px-safe pb-[max(4rem,env(safe-area-inset-bottom,0px))] pt-6 sm:pb-20 sm:pt-10 sm:pl-[max(1.5rem,env(safe-area-inset-left,0px))] sm:pr-[max(1.5rem,env(safe-area-inset-right,0px))] md:flex-row md:items-center md:justify-start md:gap-[15rem] md:landscape:justify-start md:pt-0 md:pl-[clamp(1.5rem,11vw,12%)] md:pr-[clamp(1.5rem,6vw,5rem)] lg:gap-[20rem]">
          <div className="min-w-0 flex-1 md:max-w-xl md:pt-0 lg:max-w-2xl">
            <div className="mb-6 min-w-0 sm:mb-8">
              <h1 className="mb-2 min-w-0">
                <BrandWordmark size="hero" />
              </h1>
              <p className="font-mono text-sm leading-relaxed text-muted-foreground sm:text-base sm:leading-normal md:text-sm">
                {user ? "Shorten a link (saved to your account)" : "Paste a URL, get a short link."}
              </p>
              <p className="font-mono text-[11px] text-muted-foreground/90 mt-3 tabular-nums">
                <span className="text-neon-dim">{user ? user.nickname : "guest"}</span>
                <span className="text-muted-foreground">@ulnk.lat</span>
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
              <div className="mt-8 max-w-md space-y-2 border border-dashed border-border border-muted-foreground/25 bg-surface/40 p-4 font-mono text-xs text-muted-foreground sm:mt-12">
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
          </div>

          <div
            className="pointer-events-none hidden shrink-0 select-none md:block md:w-[min(53vw,31rem)] lg:w-[min(48vw,36rem)]"
            aria-hidden
          >
            <img
              src={meguminHero}
              alt=""
              className="hero-fragment-float mx-auto w-full max-w-[28rem] object-contain drop-shadow-[0_0_2.5rem_rgba(74,222,128,0.12)] lg:max-w-none"
              width={512}
              height={512}
              decoding="async"
            />
          </div>
        </main>
      ) : (
        <Dashboard />
      )}

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  );
}
