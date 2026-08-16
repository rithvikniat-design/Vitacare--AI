"use client";

import React, { useState, Suspense } from "react";
import { Sidebar } from "./sidebar";
import { MobileSidebar } from "./mobile-sidebar";

interface ChatLayoutProps {
  children: React.ReactNode;
}

export function ChatLayout({ children }: ChatLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex h-full flex-shrink-0">
        <Suspense fallback={<div className="w-64 h-full bg-muted/30 border-r" />}>
          <Sidebar />
        </Suspense>
      </div>

      {/* Mobile Sidebar */}
      <Suspense fallback={null}>
        <MobileSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      </Suspense>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full min-w-0">
        {/* Mobile Header (only visible on mobile) */}
        <header className="md:hidden flex items-center justify-between p-4 border-b">
          <h1 className="font-semibold">Medical AI</h1>
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 -mr-2 rounded-md hover:bg-muted"
            aria-label="Open sidebar"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-6 h-6"
            >
              <line x1="3" x2="21" y1="6" y2="6" />
              <line x1="3" x2="21" y1="12" y2="12" />
              <line x1="3" x2="21" y1="18" y2="18" />
            </svg>
          </button>
        </header>

        <main className="flex-1 relative overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
