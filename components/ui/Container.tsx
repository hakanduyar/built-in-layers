import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type ContainerProps = {
  children: ReactNode;
  className?: string;
};

export function Container({ children, className }: ContainerProps) {
  return (
    <div
      className={cn("mx-auto w-full max-w-[var(--container-max)] px-4 md:px-6 lg:px-8", className)}
    >
      {children}
    </div>
  );
}
