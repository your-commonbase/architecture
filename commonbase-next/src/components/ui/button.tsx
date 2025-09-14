import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "neo-btn inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-bold disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-[#A6FAFF] text-black hover:bg-[#79F7FF]",
        destructive:
          "bg-[#FF9F9F] text-black hover:bg-[#fa7a7a]",
        outline:
          "bg-white text-black hover:bg-violet-200",
        secondary:
          "bg-[#A8A6FF] text-black hover:bg-[#918efa]",
        ghost:
          "border-transparent shadow-none hover:bg-lime-200 hover:border-black hover:shadow-[4px_4px_0px_0px_#000000]",
        link: "text-black underline-offset-4 hover:underline border-transparent shadow-none",
        accent: "bg-[#FFF066] text-black hover:bg-[#FFE500]",
        pink: "bg-[#FFA6F6] text-black hover:bg-[#fa8cef]",
        orange: "bg-[#FFC29F] text-black hover:bg-[#FF965B]",
      },
      size: {
        default: "h-10 px-6 py-3 has-[>svg]:px-4",
        sm: "h-8 gap-1.5 px-4 py-2 has-[>svg]:px-3",
        lg: "h-12 px-8 py-4 has-[>svg]:px-6",
        icon: "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
