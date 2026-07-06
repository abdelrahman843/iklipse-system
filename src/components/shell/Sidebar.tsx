"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Eye,
  ListChecks,
  SquareKanban,
  Building2,
  TrendingUp,
  GraduationCap,
  BookOpen,
  Wallet,
  Calendar,
  Settings,
  ChevronLeft,
  Lock,
  UserCog,
  LogOut,
  type LucideIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import { navItems, currentUser } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/primitives";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { img } from "@/lib/landing";
import { useAuth, roleLabels } from "@/lib/auth";

const icons: Record<string, LucideIcon> = {
  LayoutDashboard,
  Eye,
  ListChecks,
  SquareKanban,
  Building2,
  TrendingUp,
  GraduationCap,
  BookOpen,
  Wallet,
  Calendar,
  Settings,
};

export function Sidebar({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  const pathname = usePathname();
  const { currentUser: authUser, logout } = useAuth();
  const isAdmin = authUser?.role === "super_admin" || authUser?.role === "admin";

  return (
    <motion.aside
      animate={{ width: collapsed ? 76 : 264 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="relative z-20 hidden h-dvh shrink-0 flex-col border-r border-white/8 bg-[rgba(10,10,12,0.62)] backdrop-blur-xl md:flex"
    >
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 px-5">
        <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-accent to-accent/60 shadow-[0_8px_24px_-8px_rgba(249,83,56,0.7)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={img.emblemWhite} alt="iklipse" className="size-5" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="font-display text-[0.95rem] font-bold leading-none tracking-tight text-ink">
              IKLIPSE
            </p>
            <p className="text-[0.62rem] uppercase tracking-[0.2em] text-faint">Central Hub</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-3">
        {navItems.map((item) => {
          // Members see only the Calendar tab
          if (authUser?.role === "member" && item.href !== "/calendar") return null;
          // Boards are never visible to clients
          if (item.href === "/boards" && authUser?.role === "client") return null;
          const Icon = icons[item.icon];
          const active = pathname === item.href;
          const restricted = "restricted" in item && item.restricted;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-300",
                active
                  ? "bg-white text-black"
                  : "text-muted hover:bg-white/5 hover:text-ink",
              )}
            >
              <Icon className={cn("size-[18px] shrink-0", active && "text-black")} />
              {!collapsed && (
                <span className="flex-1 truncate font-medium">{item.label}</span>
              )}
              {!collapsed && restricted && <Lock className="size-3 text-faint" />}
            </Link>
          );
        })}

        {isAdmin && (
          <Link
            href="/admin/users"
            title={collapsed ? "User Management" : undefined}
            className={cn(
              "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-300",
              pathname.startsWith("/admin")
                ? "bg-white text-black"
                : "text-muted hover:bg-white/5 hover:text-ink",
            )}
          >
            <UserCog className={cn("size-[18px] shrink-0", pathname.startsWith("/admin") && "text-black")} />
            {!collapsed && <span className="flex-1 truncate font-medium">User Management</span>}
          </Link>
        )}
      </nav>

      {/* User mini */}
      <div className="border-t border-white/8 p-3">
        <div
          className={cn(
            "flex items-center gap-2 rounded-xl",
            collapsed && "justify-center",
          )}
        >
          <Link
            href="/profile"
            title="Profile settings"
            className={cn(
              "flex min-w-0 flex-1 items-center gap-3 rounded-xl p-2 transition-colors hover:bg-white/5",
              collapsed && "flex-none justify-center",
            )}
          >
            <Avatar
              name={authUser?.name ?? currentUser.name}
              color="#3f3f46"
              size={collapsed ? 36 : 40}
              ring="rgba(249,83,56,0.4)"
              src={authUser?.avatar}
            />
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-sm font-medium text-ink">
                  {authUser?.name ?? currentUser.name}
                </p>
                <p className="truncate text-[0.68rem] text-accent-soft">
                  {authUser ? roleLabels[authUser.role] : currentUser.role}
                </p>
              </div>
            )}
          </Link>
          {!collapsed && (
            <>
              <ThemeToggle className="grid size-8 shrink-0 place-items-center rounded-lg text-faint transition-colors hover:bg-white/5 hover:text-ink" />
              <button
                onClick={logout}
                title="Sign out"
                className="grid size-8 shrink-0 place-items-center rounded-lg text-faint transition-colors hover:bg-white/5 hover:text-sla-red"
              >
                <LogOut className="size-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={onToggle}
        aria-label="Toggle sidebar"
        className="absolute -right-3 top-20 grid size-6 place-items-center rounded-full border border-white/10 bg-[#141417] text-muted shadow-lg transition-colors hover:text-accent"
      >
        <ChevronLeft className={cn("size-3.5 transition-transform duration-300", collapsed && "rotate-180")} />
      </button>
    </motion.aside>
  );
}
