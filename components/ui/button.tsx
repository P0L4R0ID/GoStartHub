import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white hover:from-cyan-400 hover:via-blue-500 hover:to-purple-500 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 glow-blue border border-cyan-400/30",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border-2 border-cyan-400/50 bg-transparent backdrop-blur-sm hover:bg-cyan-500/10 hover:border-cyan-400 hover:text-cyan-300 transition-all duration-300 glass-futuristic",
        secondary:
          "bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-foreground hover:from-blue-500/30 hover:to-purple-500/30 backdrop-blur-sm border border-blue-400/30 transition-all duration-300",
        ghost: "hover:bg-cyan-500/10 hover:text-cyan-400 transition-all duration-300",
        link: "text-cyan-400 underline-offset-4 hover:text-cyan-300 hover:underline transition-colors",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }

