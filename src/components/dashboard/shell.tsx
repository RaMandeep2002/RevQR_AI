"use client";

import { useState } from "react";
import { DashboardHeader } from "@/components/dashboard/header";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { Toaster } from "sonner";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    // <div className="flex min-h-screen bg-gradient-to-br from-[#201D47] via-[#1B1840] to-[#0F0D24] dark:from-[#201D47] dark:via-[#17153A] dark:to-[#0B0A1A]">
    <div className="flex min-h-screen bg-white dark:bg-[#081028]">
      <DashboardSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <DashboardHeader onOpenSidebar={() => setIsSidebarOpen(true)} />
        <main className="no-scrollbar flex-1 overflow-y-auto p-8 dark:text-gray-100">
                <Toaster />
          {children}
        </main>
      </div>
    </div>
  );
}
