import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'success';
type ButtonSize = 'default' | 'compact';

interface AppButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
}

export function AppButton({
  variant = 'primary',
  size = 'default',
  className,
  children,
  ...props
}: AppButtonProps) {
  return (
    <button
      {...props}
      className={joinClassNames(getButtonClassName(variant, size), className)}
    >
      {children}
    </button>
  );
}

export function getButtonClassName(
  variant: ButtonVariant = 'primary',
  size: ButtonSize = 'default',
): string {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-[var(--radius-control)] px-5 font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60';
  const sizeClass = size === 'compact' ? 'min-h-10 text-sm' : 'min-h-11 text-sm';

  const variantClass =
    variant === 'secondary'
      ? 'border border-line bg-surface-muted text-foreground hover:border-line-strong'
      : variant === 'ghost'
        ? 'border border-transparent bg-transparent text-muted hover:border-line hover:bg-surface-muted hover:text-foreground'
        : variant === 'success'
          ? 'bg-[var(--color-success)] text-[#163735] hover:bg-[var(--color-success-strong)]'
          : 'bg-accent text-white hover:bg-accent-strong';

  return `${base} ${sizeClass} ${variantClass}`;
}

export function getIconButtonClassName(): string {
  return 'inline-flex h-10 w-10 items-center justify-center rounded-full border border-transparent bg-transparent text-muted transition-colors hover:border-line hover:bg-surface-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60';
}

function joinClassNames(...values: Array<string | undefined>): string {
  return values.filter(Boolean).join(' ');
}
