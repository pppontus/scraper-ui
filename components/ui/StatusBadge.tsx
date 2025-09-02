"use client";

import { cn } from "@/lib/utils";
import { getStatusColor } from "@/lib/utils";
import type { RunStatus } from "@/lib/constants";

interface StatusBadgeProps {
  status: RunStatus | string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex px-2 py-1 text-xs font-medium rounded-full",
        getStatusColor(String(status)),
        className
      )}
    >
      {status}
    </span>
  );
}

