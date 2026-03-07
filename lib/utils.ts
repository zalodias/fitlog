import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        "text-display-large-strong",
        "text-display-medium-strong",
        "text-display-small-strong",
        "text-title-large-strong",
        "text-title-medium-strong",
        "text-title-small-strong",
        "text-body-large-strong",
        "text-body-large-subtle",
        "text-body-large-default",
        "text-body-medium-strong",
        "text-body-medium-subtle",
        "text-body-medium-default",
        "text-body-small-subtle",
        "text-body-small-default",
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
