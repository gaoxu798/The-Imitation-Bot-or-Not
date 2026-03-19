"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("code");
    if (code) {
      supabase.auth.exchangeCodeForSession(code).then(({ data, error }) => {
        if (!error && data.user) {
          // Upsert profile
          supabase
            .from("profiles")
            .upsert({
              id: data.user.id,
              email: data.user.email,
              name: data.user.user_metadata?.full_name || null,
              avatar_url: data.user.user_metadata?.avatar_url || null,
            })
            .then(() => router.push("/"));
        } else {
          router.push("/");
        }
      });
    } else {
      router.push("/");
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-neon-blue font-mono text-xl animate-pulse">
        Logging in...
      </div>
    </div>
  );
}
