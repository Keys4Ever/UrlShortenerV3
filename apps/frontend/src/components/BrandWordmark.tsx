import { cn } from "@/lib/utils";

type BrandWordmarkProps = {
  className?: string;
  size?: "hero" | "header";
};

export function BrandWordmark({ className, size = "header" }: BrandWordmarkProps) {
  return (
    <span
      className={cn(
        "font-mono inline-flex items-baseline tracking-tight",
        size === "hero"
          ? "text-[clamp(1.65rem,7.5vw,2.75rem)] font-bold leading-none sm:text-5xl"
          : "text-sm font-bold",
        className,
      )}
    >
      <span className="text-foreground">ulnk</span>
      <span className="text-neon">.</span>
      <span className="text-muted-foreground">lat</span>
    </span>
  );
}
