"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import {
  HiOutlineViewGrid,
  HiOutlineHome,
  HiOutlineSearch,
  HiOutlineExclamation,
  HiOutlineFolderOpen,
  HiOutlineCog,
  HiOutlinePlus,
  HiOutlineLogout,
  HiOutlineMenu,
  HiOutlineX,
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
    href: "/home",
    label: "Home",
    icon: <HiOutlineHome className="h-5 w-5" />,
    match: (p) => p === "/home",
  },
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: <HiOutlineViewGrid className="h-5 w-5" />,
    match: (p) => p === "/dashboard",
  },
  {
    href: "/search",
    label: "Search",
    icon: <HiOutlineSearch className="h-5 w-5" />,
    match: (p) => p === "/search",
  },
  {
    href: "/chargesheet-status",
    label: "Pending Chargesheet",
    shortLabel: "Pending CS",
    icon: <HiOutlineExclamation className="h-5 w-5" />,
    match: (p) => p.startsWith("/chargesheet-status"),
  },
  {
    href: "/manage",
    label: "Manage",
    icon: <HiOutlineFolderOpen className="h-5 w-5" />,
    superAdminOnly: true,
    match: (p) => p === "/manage" || p.startsWith("/add") || p.startsWith("/edit"),
  },
  {
    href: "/admin",
    label: "Admin",
    icon: <HiOutlineCog className="h-5 w-5" />,
    superAdminOnly: true,
    match: (p) => p.startsWith("/admin"),
  },
];

function isActive(pathname: string, item: NavItem) {
  return item.match ? item.match(pathname) : pathname === item.href;
}

function NavLinks({
  items,
  pathname,
  isSuperAdmin,
  onNavigate,
}: {
  items: NavItem[];
  pathname: string;
  isSuperAdmin: boolean;
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex flex-1 flex-col gap-1 px-3 pt-5">
      {items.map((item) => {
        const active = isActive(pathname, item);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
              active ? "bg-[#2f6fed] text-white shadow-sm" : "text-slate-200 hover:bg-white/10 hover:text-white"
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        );
      })}
      {isSuperAdmin && (
        <Link
          href="/add"
          onClick={onNavigate}
          className="mt-2 flex items-center gap-3 rounded-xl bg-emerald-500 px-3 py-2.5 text-sm font-semibold text-white hover:bg-emerald-400"
        >
          <HiOutlinePlus className="h-5 w-5" />
          Add Case
        </Link>
      )}
    </nav>
  );
}

export function AppShell({
  children,
  actions,
  flush = false,
}: {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  flush?: boolean;
}) {
  const pathname = usePathname() || "/";
  const { user, logout } = useAuth();
  const isSuperAdmin = user?.role === "SuperAdmin";
  const [mobileOpen, setMobileOpen] = useState(false);

  const visibleItems = NAV_ITEMS.filter((item) => !item.superAdminOnly || isSuperAdmin);

  const sidebar = (
    <>
      <div className="border-b border-white/10 px-3 py-5">
        <Link href="/home" className="flex flex-col items-center text-center" onClick={() => setMobileOpen(false)}>
          <Image
            src="/logo.png"
            alt="Jharkhand Police"
            width={112}
            height={112}
            className="h-28 w-28 object-contain mix-blend-screen"
            priority
          />
          <span className="mt-2 block text-lg font-bold leading-tight tracking-wide text-white">PRISM</span>
          <span className="mt-0.5 block text-[11px] leading-snug text-slate-300">Ramgarh Police</span>
        </Link>
      </div>

      <NavLinks
        items={visibleItems}
        pathname={pathname}
        isSuperAdmin={isSuperAdmin}
        onNavigate={() => setMobileOpen(false)}
      />

      <div className="mt-auto border-t border-white/10 p-3">
        <div className="mb-2 flex items-center gap-2 rounded-xl bg-white/10 px-2 py-2 ring-1 ring-white/10">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#2f6fed] text-xs font-bold text-white">
            {(user?.email?.[0] || "U").toUpperCase()}
          </span>
          <span className="min-w-0 flex-1 text-left">
            <span className="block truncate text-xs font-semibold text-white">{user?.email}</span>
            <span className="block text-[10px] text-slate-300">
              {user?.role}
              {user?.policeStation ? ` · ${user.policeStation}` : user?.role === "SuperAdmin" ? " · All PS" : ""}
            </span>
          </span>
        </div>
        <button
          type="button"
          onClick={() => logout()}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-200 hover:bg-white/10 hover:text-white"
        >
          <HiOutlineLogout className="h-5 w-5" />
          Logout
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[#f4f7fb]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-[#0b1f3a] text-white shadow-xl lg:flex">
        {sidebar}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/50"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative flex h-full w-64 flex-col bg-[#0b1f3a] text-white shadow-2xl">
            <button
              type="button"
              className="absolute right-3 top-4 rounded-lg p-1.5 text-slate-200 hover:bg-white/10"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
            >
              <HiOutlineX className="h-5 w-5" />
            </button>
            {sidebar}
          </aside>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-slate-200 bg-white/90 px-4 py-2.5 backdrop-blur md:px-6 lg:hidden">
          <button
            type="button"
            className="rounded-lg p-2 text-slate-700 hover:bg-slate-100"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <HiOutlineMenu className="h-5 w-5" />
          </button>
          <Link href="/home" className="flex items-center gap-2 font-bold text-[#0b1f3a]">
            <Image src="/logo.png" alt="Jharkhand Police" width={44} height={44} className="h-11 w-11 object-contain" />
            PRISM
          </Link>
          <div className="flex items-center gap-2">{actions}</div>
        </header>

        {actions && (
          <div className="hidden items-center justify-end gap-2 px-4 pt-4 md:px-6 lg:flex">{actions}</div>
        )}

        <main className={flush ? "" : "mx-auto max-w-[1600px] p-4 md:p-6"}>{children}</main>
      </div>
    </div>
  );
}
