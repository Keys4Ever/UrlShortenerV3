import { BrandWordmark } from "@/components/BrandWordmark";

const NotFound = () => {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-safe pb-safe touch-manipulation">
      <div className="text-left max-w-md font-mono">
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">404</p>
        <h1 className="text-2xl font-bold text-foreground mb-3">No page at this URL</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Check the address, or open the app from the home screen.
        </p>
        <a
          href="/"
          className="text-sm text-neon inline-flex items-center gap-2 underline underline-offset-2 hover:text-neon/90 transition-interact rounded-sm py-1 -my-1 focus-ring-terminal"
        >
          <span aria-hidden>←</span>
          <span>Back to</span>
          <BrandWordmark size="header" />
        </a>
      </div>
    </div>
  );
};

export default NotFound;
