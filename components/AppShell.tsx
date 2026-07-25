"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import {
  HiOutlineViewGrid,
  HiOutlineSearch,
  HiOutlineExclamation,
  HiOutlineFolderOpen,
  HiOutlineCog,
  HiOutlinePlus,
  HiOutlineLogout,
  HiOutlineMenu,
  HiOutlineX,
  HiOutlineShieldCheck,
} from "react-icons/hi";
import { useAuth } from "../contexts/AuthContext";

type NavItem = {
  href: string;
  label: string;
  shortLabel?: string;
  icon: ReactNode;
  match?: (path: string) => boolean;
  superAdminOnly?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: <HiOutlineViewGrid className="h-4 w-4" />,
    match: (p) => p === "/dashboard",
  },
  {
    href: "/",
    label: "Search",
    icon: <HiOutlineSearch className="h-4 w-4" />,
    match: (p) => p === "/",
  },
  {
    href: "/chargesheet-status",
    label: "Pending Chargesheet",
    shortLabel: "Pending CS",
    icon: <HiOutlineExclamation className="h-4 w-4" />,
    match: (p) => p.startsWith("/chargesheet-status"),
  },
  {
    href: "/manage",
    label: "Manage",
    icon: <HiOutlineFolderOpen className="h-4 w-4" />,
    superAdminOnly: true,
    match: (p) => p === "/manage" || p.startsWith("/add") || p.startsWith("/edit"),
  },
  {
    href: "/admin",
    label: "Admin",
    icon: <HiOutlineCog className="h-4 w-4" />,
    superAdminOnly: true,
    match: (p) => p.startsWith("/admin"),
  },
];

function isActive(pathname: string, item: NavItem) {
  return item.match ? item.match(pathname) : pathname === item.href;
}

export function AppShell({
  children,
  actions,
}: {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  const pathname = usePathname() || "/";
  const { user, logout } = useAuth();
  const isSuperAdmin = user?.role === "SuperAdmin";
  const [mobileOpen, setMobileOpen] = useState(false);

  const visibleItems = NAV_ITEMS.filter((item) => !item.superAdminOnly || isSuperAdmin);

  return (
    <div className="min-h-screen bg-[#f4f7fb]">
      <header className="sticky top-0 z-30 bg-[#0b1f3a] text-white shadow-md">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-3 px-4 py-3 md:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Link href="/dashboard" className="flex shrink-0 items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#2f6fed] text-white">
                <HiOutlineShieldCheck className="h-5 w-5" />
              </span>
              <span className="hidden min-w-0 sm:block">
                <span className="block text-sm font-bold leading-tight tracking-wide text-white">PRISM</span>
                <span className="block truncate text-[10px] leading-tight text-slate-300">Ramgarh Police</span>
              </span>
            </Link>

            <nav className="ml-1 hidden items-center gap-1 lg:flex">
              {visibleItems.map((item) => {
                const active = isActive(pathname, item);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      active
                        ? "bg-[#2f6fed] text-white"
                        : "text-slate-200 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {actions}
            {isSuperAdmin && (
              <Link
                href="/add"
                className="hidden items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-400 sm:inline-flex"
              >
                <HiOutlinePlus className="h-4 w-4" />
                Add Case
              </Link>
            )}
            <div className="hidden items-center gap-2 rounded-full bg-white/10 py-1 pl-1 pr-3 ring-1 ring-white/20 md:flex">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2f6fed] text-xs font-bold text-white">
                {(user?.email?.[0] || "U").toUpperCase()}
              </span>
              <span className="max-w-[140px] text-left">
                <span className="block truncate text-xs font-semibold text-white">{user?.email}</span>
                <span className="block text-[10px] text-slate-300">{user?.role}</span>
              </span>
            </div>
            <button
              type="button"
              onClick={() => logout()}
              className="rounded-lg p-2 text-slate-200 hover:bg-white/10 hover:text-white"
              title="Logout"
            >
              <HiOutlineLogout className="h-5 w-5" />
            </button>
            <button
              type="button"
              className="rounded-lg p-2 text-slate-200 hover:bg-white/10 hover:text-white lg:hidden"
              onClick={() => setMobileOpen((o) => !o)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <HiOutlineX className="h-5 w-5" /> : <HiOutlineMenu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="border-t border-white/10 bg-[#071526] px-3 py-3 lg:hidden">
            <nav className="flex flex-col gap-1">
              {visibleItems.map((item) => {
                const active = isActive(pathname, item);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium ${
                      active ? "bg-[#2f6fed] text-white" : "text-slate-200 hover:bg-white/10"
                    }`}
                  >
                    {item.icon}
                    {item.shortLabel || item.label}
                  </Link>
                );
              })}
              {isSuperAdmin && (
                <Link
                  href="/add"
                  onClick={() => setMobileOpen(false)}
                  className="mt-1 flex items-center gap-2 rounded-lg bg-emerald-500/20 px-3 py-2.5 text-sm font-medium text-emerald-100 ring-1 ring-emerald-400/40"
                >
                  <HiOutlinePlus className="h-4 w-4" />
                  Add New Case
                </Link>
              )}
            </nav>
          </div>
        )}
      </header>

      <main className="mx-auto max-w-[1600px] p-4 md:p-6">{children}</main>
    </div>
  );
}
