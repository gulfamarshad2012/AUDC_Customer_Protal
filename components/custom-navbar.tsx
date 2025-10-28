// components/CustomNavbar.tsx
"use client"; // This ensures it's a Client Component
import React, { useEffect, useState } from "react";
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
  Link, // Keep Link if you use it elsewhere for actual <a> tags
  Button, // This is your HeroUI Button
} from "@heroui/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";
import type { User } from "@supabase/supabase-js";
import { BASE_URL } from "@/config/constants";

function CustomNavbar() {
  const router = useRouter();
  const [findUser, setFindUser] = useState<User | null>(null);
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const menuItems = [
    { name: "services", href: "/services" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  // Helper function for navigation to keep it consistent
  const handleGetEnrollmentClick = () => {
    router.push("/get-enrollment");
  };

  useEffect(() => {
    findCurrentUser();
  }, []);

  const findCurrentUser = async () => {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      // toast.error("Error fetching user:" + error.message);
      console.log("Error fetching user: " + error.message);
      return null;
    }
    setFindUser(user);
    console.log("user id:" + user?.id);
    return user;
  };

  const handleLogOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Logout failed: " + error.message);
    } else {
      toast.success("Logged out successfully");
      setFindUser(null); // UI update
      window.location.href = `${BASE_URL}/login`;
    }
  };

  return (
    <Navbar isBordered isMenuOpen={isMenuOpen} onMenuOpenChange={setIsMenuOpen}>
      <NavbarContent className="sm:hidden" justify="start">
        <NavbarMenuToggle
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        />
      </NavbarContent>

      <NavbarContent
        className="pr-3 sm:flex-1"
        justify="center"
        onClick={() => router.push("/")}
      >
        <NavbarBrand className="cursor-pointer gap-3">
          <Image
            src="/header-logo.png"
            alt="header logo"
            width={30}
            height={30}
          />
          <p className="font-bold text-inherit">Prob Solutions</p>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent className="hidden sm:flex gap-4" justify="center">
        {menuItems.map((item) => (
          <NavbarItem key={item.name}>
            <Link color="foreground" href={item.href}>
              {item.name}
            </Link>
          </NavbarItem>
        ))}
      </NavbarContent>

      <NavbarContent
        justify="end"
        className="hidden sm:flex justify-between items-baseline"
      >
        <NavbarItem>
          {/* Directly use onClick with the router.push helper */}
          {findUser ? (
            <Button color="primary" onClick={handleGetEnrollmentClick}>
              Get Enrolment
            </Button>
          ) : (
            <Button
              className="mt-4"
              color="primary"
              onClick={() => (window.location.href = `${BASE_URL}/login`)}
            >
              Login
            </Button>
          )}
        </NavbarItem>
        <NavbarItem>
          {findUser && (
            <Button
              color="primary"
              className="w-full mt-4"
              onClick={() => router.push("/dashboard/tenants")}
            >
              Console
            </Button>
          )}
        </NavbarItem>
      </NavbarContent>

      <NavbarMenu>
        {menuItems.map((item, index) => (
          <NavbarMenuItem key={`${item.name}-${index}`}>
            <Link
              className="w-full"
              color="foreground"
              href={item.href}
              size="lg"
            >
              {item.name}
            </Link>
          </NavbarMenuItem>
        ))}
        <NavbarMenuItem>
          {/* For the mobile menu button, use the same logic */}

          {findUser ? (
            <Button
              color="primary"
              className="w-full mt-4"
              onClick={handleGetEnrollmentClick}
            >
              Get Enrolment
            </Button>
          ) : (
            <Button
              color="primary"
              className="w-full mt-4"
              onClick={() => router.push("/login")}
            >
              Login
            </Button>
          )}
        </NavbarMenuItem>
        <NavbarMenuItem>
          {findUser && (
            <Button
              color="primary"
              className="w-full mt-4"
              onClick={handleLogOut}
            >
              Log out
            </Button>
          )}
        </NavbarMenuItem>
      </NavbarMenu>
    </Navbar>
  );
}

export default CustomNavbar;
