import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export function Card({ children, className, hover = false }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-sm border border-border bg-card p-6 transition-all duration-300",
        hover && "hover:border-muted/50 hover:shadow-lg hover:shadow-black/20",
        className
      )}
    >
      {children}
    </div>
  );
}
