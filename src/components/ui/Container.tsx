import { cn } from "@/lib/utils";
import { ElementType } from "react";

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  as?: ElementType;
  id?: string;
}

export function Container({
  children,
  className,
  as: Component = "div",
  id,
}: ContainerProps) {
  return (
    <Component
      id={id}
      className={cn(
        "mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8",
        className
      )}
    >
      {children}
    </Component>
  );
}