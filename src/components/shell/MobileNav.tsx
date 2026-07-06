"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { navItems } from "@/lib/data";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";

export function MobileNav({ onClose }: { onClose: () => void }) {
  const pathname = usePathname();
  const { currentUser: authUser } = useAuth();
  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <motion.div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        exit={{ x: -300 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="glass absolute left-0 top-0 h-full w-72 rounded-none rounded-r-2xl p-4"
      >
        <div className="mb-4 flex items-center justify-between">
          <span className="font-display font-bold tracking-tight text-ink">IKLIPSE</span>
          <button onClick={onClose} className="text-faint hover:text-ink">
            <X className="size-5" />
          </button>
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => {
            if (authUser?.role === "member" && item.href !== "/calendar") return null;
            if (item.href === "/boards" && authUser?.role === "client") return null;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "block rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  active ? "bg-accent/15 text-accent" : "text-muted hover:bg-white/5 hover:text-ink",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </motion.aside>
    </div>
  );
}
