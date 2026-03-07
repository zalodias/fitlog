import * as React from "react";
import { Input as InputPrimitive } from "@base-ui/react/input";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-8 w-full min-w-0 rounded-lg border border-border-neutral-default bg-transparent px-2.5 py-1 text-body-large-default transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-body-medium-subtle file:text-foreground-neutral-default placeholder:text-foreground-neutral-faded focus-visible:border-foreground-neutral-default focus-visible:ring-3 focus-visible:ring-foreground-neutral-default/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-background-neutral-subtle disabled:opacity-50 aria-invalid:border-foreground-neutral-strong aria-invalid:ring-3 aria-invalid:ring-foreground-neutral-strong/20 md:text-body-medium-default",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
