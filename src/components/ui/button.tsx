import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-[hsl(221.2,83.2%,53.3%)] text-white hover:opacity-90",
        destructive: "bg-[hsl(0,84.2%,60.2%)] text-white hover:opacity-90",
        outline: "border border-[hsl(214.3,31.8%,91.4%)] bg-white hover:bg-[hsl(210,40%,96%)] hover:text-[hsl(222.2,47.4%,11.2%)]",
        secondary: "bg-[hsl(210,40%,96%)] text-[hsl(222.2,47.4%,11.2%)] hover:opacity-80",
        ghost: "hover:bg-[hsl(210,40%,96%)] hover:text-[hsl(222.2,47.4%,11.2%)]",
        link: "text-[hsl(221.2,83.2%,53.3%)] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
