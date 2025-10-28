// This file will remain a Server Component
// The metadata and viewport exports must be here
import { Metadata, Viewport } from "next";
import { siteConfig } from "@/config/site";
import DashboardLayoutContent from "./layout-content";

export const metadata: Metadata = {
  title: {
    default: "Customer Portal",
    template: "- OnBoarding",
  },
  description: siteConfig.description,
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "white" },
  ],
};

// This component is the server-side layout wrapper.
// It renders the client-side component (DashboardLayoutContent).
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayoutContent>{children}</DashboardLayoutContent>;
}
