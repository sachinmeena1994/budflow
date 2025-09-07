
import { cn } from "@/lib/utils";

interface TypographyProps {
  children: React.ReactNode;
  className?: string;
}

export const Heading1 = ({ children, className }: TypographyProps) => (
  <h1 className={cn("text-4xl font-bold text-slate-900 tracking-tight", className)}>
    {children}
  </h1>
);

export const Heading2 = ({ children, className }: TypographyProps) => (
  <h2 className={cn("text-2xl font-semibold text-slate-900", className)}>
    {children}
  </h2>
);

export const Heading3 = ({ children, className }: TypographyProps) => (
  <h3 className={cn("text-lg font-medium text-slate-900", className)}>
    {children}
  </h3>
);

export const BodyText = ({ children, className }: TypographyProps) => (
  <p className={cn("text-slate-600 leading-relaxed", className)}>
    {children}
  </p>
);

export const SmallText = ({ children, className }: TypographyProps) => (
  <span className={cn("text-sm text-slate-500", className)}>
    {children}
  </span>
);
