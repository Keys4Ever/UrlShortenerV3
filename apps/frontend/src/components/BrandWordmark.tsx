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
        size === "hero" ? "text-4xl font-bold leading-none sm:text-5xl" : "text-sm font-bold",
        className,
      )}
    >
      <span className="text-foreground">shrt</span>
      <span className="text-neon">.</span>
      <span className="text-muted-foreground">dev</span>
    </span>
  );
}
