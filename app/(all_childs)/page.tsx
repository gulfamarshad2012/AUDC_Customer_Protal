"use client";

import CTA from "@/components/home/CTA";
import Features from "@/components/home/Features";
import Hero from "@/components/home/Hero";
import Stats from "@/components/home/States";
import { BASE_URL } from "@/config/constants";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";

export default function Index() {
  const [user, setUser] = useState<User | null>(null);

  const currentUser = async () => {
    const { data, error } = await supabase.auth.getUser();

    if (data?.user && !error) {
      setUser(data.user);
    }

    if (!user) {
      redirect(`${BASE_URL}/login`);
    }
  };

  useEffect(() => {
    currentUser();
  }, []);

  return (
    <div className="min-h-screen">
      {user ? (
        <div>
          <Hero />
          <Features />
          <Stats />
          <CTA />

          {/* Footer */}
          <footer className="bg-gray-900 text-white py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="col-span-1 md:col-span-2">
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
                    AUDC Platform
                  </h3>
                  <p className="text-gray-400 mb-4 max-w-md">
                    The leading multi-tenant automated user data collection
                    platform trusted by enterprises worldwide for secure,
                    scalable, and intelligent data solutions.
                  </p>
                  <div className="flex space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
                      <span className="text-white font-bold">T</span>
                    </div>
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
                      <span className="text-white font-bold">L</span>
                    </div>
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
                      <span className="text-white font-bold">F</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold mb-4">Product</h4>
                  <ul className="space-y-2 text-gray-400">
                    <li>
                      <a
                        href="#"
                        className="hover:text-white transition-colors"
                      >
                        Features
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        className="hover:text-white transition-colors"
                      >
                        Pricing
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        className="hover:text-white transition-colors"
                      >
                        Security
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        className="hover:text-white transition-colors"
                      >
                        Integrations
                      </a>
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-lg font-semibold mb-4">Company</h4>
                  <ul className="space-y-2 text-gray-400">
                    <li>
                      <a
                        href="#"
                        className="hover:text-white transition-colors"
                      >
                        About
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        className="hover:text-white transition-colors"
                      >
                        Careers
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        className="hover:text-white transition-colors"
                      >
                        Contact
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        className="hover:text-white transition-colors"
                      >
                        Blog
                      </a>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
                <p className="text-gray-400 text-sm">
                  © 2025 AUDC Platform. All rights reserved.
                </p>
                <div className="flex space-x-6 mt-4 md:mt-0">
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white text-sm transition-colors"
                  >
                    Privacy Policy
                  </a>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white text-sm transition-colors"
                  >
                    Terms of Service
                  </a>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white text-sm transition-colors"
                  >
                    Cookie Policy
                  </a>
                </div>
              </div>
            </div>
          </footer>
        </div>
      ) : (
        "redirect"
      )}
    </div>
  );
}
