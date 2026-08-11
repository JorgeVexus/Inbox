import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "outline" | "white";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-primary border-2 border-primary text-white shadow-card hover:bg-primary/90",
  outline:
    "bg-transparent border-2 border-primary text-primary shadow-card hover:bg-primary/5",
  white:
    "bg-white border-2 border-white text-primary hover:bg-white/90",
};

type CommonProps = {
  children: ReactNode;
  variant?: Variant;
  className?: string;
};

type ButtonAsButton = CommonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };

type ButtonAsLink = CommonProps & {
  href: string;
};

export function Button({
  children,
  variant = "primary",
  className = "",
  href,
  ...props
}: ButtonAsButton | ButtonAsLink) {
  const classes = `inline-flex h-[53px] items-center justify-center rounded-md px-6 font-display font-bold text-sm cursor-pointer transition-colors ${variantClasses[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button
      className={classes}
      {...(props as ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {children}
    </button>
  );
}
