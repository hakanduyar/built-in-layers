import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type ContainerProps = {
  children: ReactNode;
  className?: string;
};

/** DESIGN_SYSTEM §4/§6: container max-width, centered, responsive gutters. */
export function Container({ children, className }: ContainerProps) {
  return (
    <div
      className={cn("mx-auto w-full max-w-[var(--container-max)] px-4 md:px-6 lg:px-8", className)}
    >
      {children}
    </div>
  );
}
