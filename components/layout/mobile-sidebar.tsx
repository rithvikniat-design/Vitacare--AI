"use client";

import React from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Sidebar } from "./sidebar";

interface MobileSidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export function MobileSidebar({ isOpen, setIsOpen }: MobileSidebarProps) {
  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent side="left" className="p-0 w-64 border-r-0">
        <Sidebar />
      </SheetContent>
    </Sheet>
  );
}
