import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({
  label,
  error,
  className,
  id,
  ...props
}: InputProps) {
  const inputId = id ?? props.name;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="mb-2 block text-sm font-medium text-muted"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          "w-full rounded-sm border border-border bg-background-secondary px-4 py-3 text-foreground placeholder:text-muted/60 transition-all duration-300",
          "focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary",
          "disabled:cursor-not-allowed disabled:opacity-50",
          error && "border-primary focus:ring-primary",
          className
        )}
        {...props}
      />
      {error && (
        <p className="mt-1.5 text-sm text-primary" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
