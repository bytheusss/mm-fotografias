import Link from "next/link";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonBaseProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
}

interface ButtonAsButton extends ButtonBaseProps {
  href?: undefined;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
}

interface ButtonAsLink extends ButtonBaseProps {
  href: string;
  type?: undefined;
  onClick?: undefined;
}

type ButtonProps = ButtonAsButton | ButtonAsLink;

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-foreground hover:bg-primary-hover border border-primary",
  secondary:
    "bg-card text-foreground hover:bg-background-secondary border border-border",
  outline:
    "bg-transparent text-foreground hover:bg-card border border-border hover:border-muted",
  ghost: "bg-transparent text-muted hover:text-foreground hover:bg-card/50",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-2.5 text-sm",
  lg: "px-8 py-3 text-base",
};

const baseStyles =
  "inline-flex items-center justify-center gap-2 rounded-sm font-medium transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]";

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  disabled,
  loading,
  ...props
}: ButtonProps) {
  const classes = cn(
    baseStyles,
    variantStyles[variant],
    sizeStyles[size],
    className
  );

  const content = (
    <>
      {loading && (
        <span
          className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
          aria-hidden="true"
        />
      )}
      {children}
    </>
  );

  if ("href" in props && props.href) {
    return (
      <Link href={props.href} className={classes}>
        {content}
      </Link>
    );
  }

  const { type = "button", onClick } = props as ButtonAsButton;

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {content}
    </button>
  );
}
