import type * as React from "react";
import { cn } from "@/lib/utils";

type LabelProps = React.ComponentProps<"label"> & {
  children: React.ReactNode;
  htmlFor: string;
};

export function Label({ children, className, htmlFor, ...props }: LabelProps) {
  return (
    <label
      className={cn("font-medium text-muted-foreground text-sm", className)}
      htmlFor={htmlFor}
      {...props}
    >
      {children}
    </label>
  );
}
