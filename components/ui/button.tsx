"use client";

import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-body-large-subtle whitespace-nowrap transition-all outline-none select-none focus-visible:border-foreground-neutral-default focus-visible:ring-3 focus-visible:ring-foreground-neutral-default/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-foreground-neutral-strong aria-invalid:ring-3 aria-invalid:ring-foreground-neutral-strong/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        solid: "bg-background-neutral-inverse text-foreground-neutral-inverse",
        outline:
          "border-border-neutral-default bg-transparent hover:bg-background-neutral-subtle hover:text-foreground-neutral-default aria-expanded:bg-background-neutral-subtle aria-expanded:text-foreground-neutral-default",
        secondary:
          "bg-background-neutral-subtle text-foreground-neutral-default hover:bg-background-neutral-strong aria-expanded:bg-background-neutral-strong aria-expanded:text-foreground-neutral-default",
        ghost:
          "hover:bg-background-neutral-subtle hover:text-foreground-neutral-default aria-expanded:bg-background-neutral-subtle aria-expanded:text-foreground-neutral-default",
        link: "text-foreground-neutral-default underline-offset-4 hover:underline",
      },
      size: {
        small:
          "h-7 gap-1 rounded-[min(var(--radius-md),12px)] px-2.5 text-body-small-default in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        medium:
          "h-8 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        large:
          "h-9 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        icon: "size-8",
        "icon-xs":
          "size-6 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-7 rounded-[min(var(--radius-md),12px)] in-data-[slot=button-group]:rounded-lg",
        "icon-lg": "size-9",
      },
    },
    defaultVariants: {
      variant: "solid",
      size: "medium",
    },
  },
);

function Button({
  className,
  variant = "solid",
  size = "medium",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
