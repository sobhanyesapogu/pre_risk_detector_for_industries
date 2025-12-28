"use client";

import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

type WearableNotificationProps = {
  isVisible: boolean;
};

export default function WearableNotification({
  isVisible,
}: WearableNotificationProps) {
  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 z-50 flex items-center gap-4 rounded-lg border-2 border-accent bg-background p-4 shadow-lg transition-transform duration-300 ease-in-out",
        isVisible ? "translate-x-0" : "translate-x-[calc(100%+2rem)]"
      )}
    >
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-accent">
        <AlertTriangle className="h-5 w-5 text-accent-foreground" />
      </div>
      <div>
        <h3 className="font-bold text-accent">High-Risk Period Detected</h3>
        <p className="text-sm text-foreground/80">Manual inspection recommended.</p>
      </div>
    </div>
  );
}
