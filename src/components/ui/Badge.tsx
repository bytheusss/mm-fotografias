import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "primary";
  className?: string;
}

export function Badge({
  children,
  variant = "default",
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm px-2.5 py-1 text-xs font-medium tracking-wide uppercase",
        variant === "default" && "bg-background-secondary text-muted",
        variant === "primary" && "bg-primary/10 text-primary",
        className
      )}
    >
      {children}
    </span>
  );
}
