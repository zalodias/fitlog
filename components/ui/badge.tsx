import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-4xl border border-transparent px-2 py-0.5 text-body-small-subtle whitespace-nowrap transition-all focus-visible:border-foreground-neutral-default focus-visible:ring-[3px] focus-visible:ring-foreground-neutral-default/50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-foreground-neutral-strong aria-invalid:ring-foreground-neutral-strong/20 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default:
          "bg-foreground-neutral-default text-background-neutral-default [a]:hover:bg-foreground-neutral-default/90",
        secondary:
          "bg-background-neutral-subtle text-foreground-neutral-default [a]:hover:bg-background-neutral-strong",
        destructive:
          "bg-background-neutral-strong text-foreground-neutral-default focus-visible:ring-foreground-neutral-strong/20 [a]:hover:bg-background-neutral-strong/80",
        outline:
          "border-border-neutral-default text-foreground-neutral-default [a]:hover:bg-background-neutral-subtle [a]:hover:text-foreground-neutral-faded",
        ghost:
          "hover:bg-background-neutral-subtle hover:text-foreground-neutral-faded",
        link: "text-foreground-neutral-default underline-offset-4 hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({
  className,
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props,
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  });
}

export { Badge, badgeVariants };
