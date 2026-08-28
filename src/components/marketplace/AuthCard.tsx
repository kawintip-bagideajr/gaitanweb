import { Logo } from "@/components/layout/Logo";

export function AuthCard({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="glow-field relative flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-16">
      <div className="clip-x-lg corner-brackets relative w-full max-w-sm border border-border bg-surface/80 p-8 backdrop-blur-md">
        <div className="mb-6 flex flex-col items-center gap-4 text-center">
          <Logo />
          <div>
            <h1 className="text-lg font-bold text-foreground">{title}</h1>
            {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
          </div>
        </div>

        {children}

        {footer && <div className="mt-6 text-center text-sm text-muted">{footer}</div>}
      </div>
    </div>
  );
}
