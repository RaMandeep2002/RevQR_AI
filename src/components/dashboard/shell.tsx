"use client";

import { useState } from "react";
import { DashboardHeader } from "@/components/dashboard/header";
import { DashboardSidebar } from "@/components/dashboard/sidebar";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <DashboardSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <DashboardHeader onOpenSidebar={() => setIsSidebarOpen(true)} />
        <main className="no-scrollbar flex-1 overflow-y-auto p-8">{children}</main>
      </div>
    </div>
  );
}
