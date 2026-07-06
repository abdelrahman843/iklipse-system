"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Menu } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { MobileNav } from "./MobileNav";
import { Bolbol } from "./Bolbol";
import { useAuth } from "@/lib/auth";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { ready, currentUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (ready && !currentUser) router.replace("/login");
  }, [ready, currentUser, router]);

  if (!ready || !currentUser) {
    return (
      <div className="grid h-dvh place-items-center">
        <div className="flex items-center gap-3 text-sm text-faint">
          <span className="size-2 animate-pulse rounded-full bg-accent" />
          {ready ? "Redirecting to sign in…" : "Loading workspace…"}
        </div>
      </div>
    );
  }

  return (
    <div className="relative z-10 flex h-dvh overflow-hidden">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />

      <AnimatePresence>
        {mobileOpen && <MobileNav onClose={() => setMobileOpen(false)} />}
      </AnimatePresence>

      <div className="flex min-w-0 flex-1 flex-col">
        <motion.main
          key="main"
          className="flex-1 overflow-y-auto px-4 py-6 md:px-8 md:py-8"
        >
          <button
            onClick={() => setMobileOpen(true)}
            className="mb-4 grid size-9 place-items-center rounded-lg border border-white/10 text-muted md:hidden"
            aria-label="Open menu"
          >
            <Menu className="size-4" />
          </button>
          <div className="mx-auto max-w-[1400px]">{children}</div>
        </motion.main>
      </div>

      <Bolbol />
    </div>
  );
}
