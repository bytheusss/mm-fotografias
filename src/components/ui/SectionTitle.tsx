import { cn } from "@/lib/utils";

interface SectionTitleProps {
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  className?: string;
}

export function SectionTitle({
  title,
  subtitle,
  align = "center",
  className,
}: SectionTitleProps) {
  return (
    <div
      className={cn(
        "mb-12 md:mb-16",
        align === "center" && "text-center",
        className
      )}
    >
      <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-4 max-w-2xl text-base text-muted sm:text-lg md:mx-auto">
          {subtitle}
        </p>
      )}
      <div
        className={cn(
          "mt-6 h-0.5 w-12 bg-primary",
          align === "center" && "mx-auto"
        )}
      />
    </div>
  );
}
