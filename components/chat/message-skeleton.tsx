"use client";

import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function MessageSkeleton() {
  return (
    <div className="py-6 px-4 md:px-8 w-full flex justify-center bg-muted/50">
      <div className="w-full max-w-3xl flex gap-4 md:gap-6">
        <div className="flex-shrink-0 mt-1">
          <Avatar className="w-8 h-8 md:w-10 md:h-10 border border-primary/20 shadow-sm">
            <AvatarImage src="/bot-avatar.png" />
            <AvatarFallback className="bg-primary text-primary-foreground text-xs md:text-sm">
              AI
            </AvatarFallback>
          </Avatar>
        </div>

        <div className="flex-1 space-y-3 overflow-hidden mt-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-semibold text-sm">Medical Assistant</span>
          </div>
          <Skeleton className="h-4 w-3/4 rounded" />
          <Skeleton className="h-4 w-full rounded" />
          <Skeleton className="h-4 w-5/6 rounded" />
        </div>
      </div>
    </div>
  );
}
