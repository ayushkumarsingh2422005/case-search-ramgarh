"use client";

import Image from "next/image";
import Link from "next/link";
import {
  HiOutlineSearch,
  HiOutlineClipboardCheck,
  HiOutlineViewGrid,
  HiOutlineShieldCheck,
  HiOutlineLogin,
} from "react-icons/hi";
import { useAuth } from "../contexts/AuthContext";

export default function LandingPage() {
  const { user, loading } = useAuth();

  return (
    <div className="min-h-screen bg-[#f4f7fb] text-slate-900">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#0b1f3a] text-white shadow-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 md:px-6">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="Jharkhand Police"
              width={52}
              height={52}
              className="h-12 w-12 object-contain mix-blend-screen"
              priority
            />
            <span>
              <span className="block text-lg font-bold tracking-wide">PRISM</span>
              <span className="block text-[11px] text-slate-300">Ramgarh Police, Jharkhand</span>
            </span>
          </Link>
          {!loading &&
            (user ? (
              <Link
                href="/dashboard"
                className="rounded-lg bg-[#2f6fed] px-4 py-2 text-sm font-semibold text-white hover:bg-blue-600"
              >
                Go to Dashboard
              </Link>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-lg bg-[#2f6fed] px-4 py-2 text-sm font-semibold text-white hover:bg-blue-600"
              >
                <HiOutlineLogin className="h-4 w-4" />
                Login
              </Link>
            ))}
        </div>
      </header>

      <section className="relative overflow-hidden bg-[#0b1f3a] text-white">
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-blue-500/15" />
        <div className="absolute -bottom-20 -left-10 h-64 w-64 rounded-full bg-emerald-400/10" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 md:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:py-16">
          <div>
            <div className="mb-6 flex items-center gap-4">
              <Image
                src="/logo.png"
                alt="Jharkhand Police"
                width={140}
                height={140}
                className="h-28 w-28 object-contain mix-blend-screen sm:h-36 sm:w-36"
                priority
              />
              <div>
                <p className="text-sm font-medium text-amber-300">झारखण्ड पुलिस · सेवा ही लक्ष्य</p>
                <h1 className="mt-1 text-4xl font-bold tracking-wide sm:text-5xl">PRISM</h1>
                <p className="mt-1 text-sm text-slate-300">Ramgarh District · Jharkhand Police</p>
              </div>
            </div>
            <h2 className="max-w-xl text-2xl font-semibold leading-snug sm:text-3xl">
              Police Review of Investigation Status &amp; Monitoring
            </h2>
            <p className="mt-3 max-w-xl text-lg italic text-sky-300 sm:text-xl">
              “From FIR to Final Report—Under One Prism.”
            </p>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-300 sm:text-base">
              Search cases, track chargesheets, monitor investigations, and manage station records for
              Ramgarh Police in one secure system.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {user ? (
                <Link
                  href="/dashboard"
                  className="rounded-xl bg-[#2f6fed] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-900/30 hover:bg-blue-600"
                >
                  Open Dashboard
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="rounded-xl bg-[#2f6fed] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-900/30 hover:bg-blue-600"
                >
                  Officer Login
                </Link>
              )}
              <Link
                href={user ? "/search" : "/login"}
                className="rounded-xl border border-white/20 bg-white/5 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10"
              >
                Search Cases
              </Link>
            </div>
          </div>

          <div className="mx-auto w-full max-w-sm">
            <div className="overflow-hidden rounded-3xl bg-white shadow-2xl shadow-black/30">
              <div className="bg-slate-50 px-4 pt-5">
                <Image
                  src="/sp.png"
                  alt="Mukesh Kumar Lunayat, IPS, Superintendent of Police, Ramgarh"
                  width={480}
                  height={600}
                  className="mx-auto h-auto w-full object-contain object-top"
                  priority
                />
              </div>
              <div className="bg-[#0b1f3a] px-5 py-4 text-center">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-amber-300">
                  Superintendent of Police
                </p>
                <h3 className="mt-1 text-lg font-bold text-white">Mukesh Kumar Lunayat, IPS</h3>
                <p className="mt-0.5 text-sm text-slate-300">Ramgarh, Jharkhand</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 md:px-6 md:py-16">
        <h3 className="text-center text-2xl font-bold text-[#0b1f3a]">What officers can do</h3>
        <p className="mx-auto mt-2 max-w-2xl text-center text-sm text-slate-600">
          PRISM helps Ramgarh Police review investigation status, pending chargesheets, and station-wise case records.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: HiOutlineSearch,
              title: "Search cases",
              desc: "Find cases by number, station, crime head, IO, and status.",
            },
            {
              icon: HiOutlineClipboardCheck,
              title: "Pending chargesheets",
              desc: "Track deadlines, overdue filings, and accused-level CS status.",
            },
            {
              icon: HiOutlineViewGrid,
              title: "Live dashboard",
              desc: "See station-wise stats, ageing, and investigation progress.",
            },
            {
              icon: HiOutlineShieldCheck,
              title: "Secure access",
              desc: "Role-based login for SuperAdmin and Viewer officers.",
            },
          ].map((item) => (
            <div key={item.title} className="prism-card p-5">
              <item.icon className="h-7 w-7 text-[#2f6fed]" />
              <h4 className="mt-3 font-semibold text-slate-900">{item.title}</h4>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 text-center text-sm text-slate-500 md:flex-row md:px-6 md:text-left">
          <p>© Ramgarh Police · Jharkhand Police · PRISM</p>
          <p>सुरक्षा · सेवा · विश्वास</p>
        </div>
      </footer>
    </div>
  );
}
