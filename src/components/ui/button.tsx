import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
  {
    variants: {
      variant: {
        default: 'bg-[linear-gradient(135deg,#ff8a5b_0%,#e85d75_48%,#7b173d_100%)] text-primary-foreground shadow-[0_18px_35px_-18px_rgba(123,23,61,0.8)] hover:-translate-y-0.5 hover:shadow-[0_24px_40px_-18px_rgba(123,23,61,0.9)]',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input bg-[linear-gradient(180deg,rgba(255,255,255,0.86),rgba(255,241,230,0.94))] text-acai-purple hover:bg-[linear-gradient(135deg,#fff7ef,#ffd7b0)] hover:text-acai-purple',
        secondary: 'bg-[linear-gradient(135deg,#fff0e3,#ffd4ab)] text-secondary-foreground hover:bg-[linear-gradient(135deg,#ffe7d0,#ffc88d)]',
        ghost: 'hover:bg-[linear-gradient(135deg,#fff7ef,#ffe0bf)] hover:text-acai-purple',
        link: 'text-primary underline-offset-4 hover:underline',
        acai: 'bg-acai-purple text-white hover:bg-acai-purple-dark',
        green: 'bg-acai-green text-white hover:bg-acai-green/90',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-xl px-8',
        xl: 'h-14 rounded-2xl px-10 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
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
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
