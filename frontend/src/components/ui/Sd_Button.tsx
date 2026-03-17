import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import type { VariantProps } from "class-variance-authority"

import { cn } from "@/lib/sd_utils"
import { sd_buttonVariants } from "./sd_buttonVariants"

export interface Sd_ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof sd_buttonVariants> {
  asChild?: boolean
}

const Sd_Button = React.forwardRef<HTMLButtonElement, Sd_ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(sd_buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Sd_Button.displayName = "Sd_Button"

export { Sd_Button }
