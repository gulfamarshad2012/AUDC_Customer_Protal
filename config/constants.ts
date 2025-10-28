'use client';
import { supabase } from "@/lib/supabase";

export const BASE_URL = "http://localhost:3000";
// export const BASE_URL = "https://audc-branding-website.vercel.app";

export const MAIN_DOMAIN = "prob.solutions";

export const api_bearer_token = async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.access_token;
};
