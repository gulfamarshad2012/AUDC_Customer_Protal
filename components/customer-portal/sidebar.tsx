"use client";
import type React from "react";
import { useState, useEffect } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import {
  Building,
  FileText,
  DollarSign,
  Package,
  CreditCard,
  User2,
  LogOut,
  Users,
  Receipt,
  List,
} from "lucide-react";
import { motion } from "motion/react";
import { usePathname, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabase";
import { Button } from "../ui/button";
import { BASE_URL } from "@/config/constants";
import Link from "next/link";

interface SidebarDemoProps {
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}

export function SidebarDemo({ open, setOpen }: SidebarDemoProps) {
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("");
  const pathname = usePathname();
  const router = useRouter();

  const links = [
    {
      label: "Accounts",
      href: "/dashboard/accounts",
      icon: <Users className="h-5 w-5 shrink-0" />,
    },
    {
      label: "Account Tenants",
      href: "/dashboard/tenants",
      icon: <Building className="h-5 w-5 shrink-0" />,
    },
    {
      label: "Invoice Headers",
      href: "/dashboard/invoice-headers",
      icon: <Receipt className="h-5 w-5 shrink-0" />,
    },
    {
      label: "Invoice Lines",
      href: "/dashboard/invoice-lines",
      icon: <List className="h-5 w-5 shrink-0" />,
    },
    {
      label: "Billing History",
      href: "/dashboard/billing-history",
      icon: <FileText className="h-5 w-5 shrink-0" />,
    },
    {
      label: "Billing Account",
      href: "/dashboard/billing-account",
      icon: <DollarSign className="h-5 w-5 shrink-0" />,
    },
    {
      label: "Subscriptions",
      href: "/dashboard/subscriptions",
      icon: <Package className="h-5 w-5 shrink-0" />,
    },
    {
      label: "Payment Methods",
      href: "/dashboard/payment-methods",
      icon: <CreditCard className="h-5 w-5 shrink-0" />,
    },
  ];

  // Logout function
  const handleLogOut = async () => {
    await supabase.auth.signOut();
    window.location.href = `${BASE_URL}/login`;
  };

  useEffect(() => {
    handleLoginUserOnMounted();
  }, []);

  const handleLoginUserOnMounted = async () => {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      toast.error("error fetching user:" + error.message);
    } else {
      setUser(user);
    }
    if (!user) {
      window.location.href = "BASE_URL/login";
    }
    console.log("user id:" + user?.id);
  };

  useEffect(() => {
    if (pathname) {
      setActiveTab(pathname);
    }
  }, [pathname]);

  return (
    <Sidebar open={open} setOpen={setOpen}>
      <SidebarBody className="justify-between gap-10">
        <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
          <Logo />
          <div className="mt-8 flex flex-col gap-2">
            {links.map((link, idx) => (
              <SidebarLink
                key={idx}
                link={link}
                className={`${
                  pathname === link.href
                    ? "bg-gray-300 text-blue-400"
                    : "hover:bg-gray-200"
                } rounded-md pl-1`}
              />
            ))}
          </div>
        </div>
        {open ? (
          <div className="border-t border-slate-200">
            <div className="flex justify-center items-center space-x-3 py-3 text-slate-600">
              <User2 className="w-5 h-5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {user?.user_metadata.full_name}
                </p>
                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
              </div>
            </div>
            <Button
              onClick={handleLogOut}
              variant="ghost"
              size="sm"
              className="flex justify-center cursor-pointer text-slate-600"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        ) : (
          <div className="border-t border-slate-200 space-y-2">
            <div className="flex items-center justify-center text-slate-600">
              <User2 className="w-5 h-5" />
            </div>
            <Button
              onClick={handleLogOut}
              variant="ghost"
              size="sm"
              className="w-full justify-center text-slate-600 hover:text-slate-900"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        )}
      </SidebarBody>
    </Sidebar>
  );
}

export const Logo = () => {
  return (
    <Link
      href="/dashboard"
      className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black"
    >
      <div className="h-5 w-6 shrink-0 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-black" />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-medium whitespace-pre text-black"
      >
        Customer Portal
      </motion.span>
    </Link>
  );
};