"use client";
import { Toaster } from "react-hot-toast";
import type React from "react";

import { SidebarDemo } from "@/components/customer-portal/sidebar";
import { useState } from "react";

export default function DashboardLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar fixed height */}
      <SidebarDemo open={isMobileOpen} setOpen={setIsMobileOpen} />

      {/* Main content should scroll independently */}
      <main className="flex-1 overflow-y-auto p-4 bg-white rounded-tl-2xl border border-neutral-200 m-2">
        {children}
        <Toaster />
      </main>
    </div>
  );
}
