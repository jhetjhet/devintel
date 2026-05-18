import { cva, type VariantProps } from "class-variance-authority";
import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-bold transition-all cursor-pointer disabled:cursor-not-allowed active:not-disabled:scale-[0.98]",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-foreground hover:bg-primary/90 disabled:bg-primary/50 disabled:text-white/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/90 disabled:bg-secondary/50 disabled:text-white/50",
        text:
          "bg-transparent text-white/60 hover:text-white hover:bg-white/5 disabled:text-white/30",
        ghost:
          "bg-white/5 hover:bg-white/10 text-white/50 hover:text-primary border border-white/10 hover:border-primary/30 disabled:bg-white/5 disabled:text-white/30 disabled:border-white/5",
      },
      size: {
        sm: "px-3 py-1.5 text-xs rounded-lg",
        md: "px-5 py-3 text-sm rounded-xl",
        lg: "py-4 text-base rounded-2xl",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>;

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
