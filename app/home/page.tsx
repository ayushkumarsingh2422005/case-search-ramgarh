"use client";

import Image from "next/image";
import {
  HiOutlineSearch,
  HiOutlineClipboardCheck,
  HiOutlineViewGrid,
  HiOutlineShieldCheck,
} from "react-icons/hi";
import { AuthGuard } from "../../components/AuthGuard";
import { AppShell } from "../../components/AppShell";

export default function HomePage() {
  return (
    <AuthGuard>
      <AppShell flush>
        <section className="relative overflow-hidden bg-[#0b1f3a] text-white">
          <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-blue-500/15" />
          <div className="absolute -bottom-20 -left-10 h-64 w-64 rounded-full bg-emerald-400/10" />
          <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 md:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:py-16">
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
                  <p className="mt-1 text-sm text-slate-300">Ramgarh Police · Jharkhand</p>
                </div>
              </div>
              <h2 className="max-w-2xl text-2xl font-semibold leading-snug sm:text-3xl">
                Police Review of Investigation Status &amp; Monitoring
              </h2>
              <p className="mt-3 max-w-2xl text-lg italic text-sky-300 sm:text-xl">
                “From FIR to Final Report—Under One Prism.”
              </p>
              <p className="mt-5 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">
                PRISM is a digital investigation monitoring and supervision platform developed by{" "}
                <span className="font-semibold text-white">Ramgarh Police</span> to ensure{" "}
                <span className="font-semibold text-white">
                  timely, quality-driven, scientific and accountable investigation
                </span>{" "}
                of criminal cases.
              </p>
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
          <div className="prism-card p-6 md:p-8">
            <h3 className="text-xl font-bold text-[#0b1f3a] md:text-2xl">From FIR to Final Report</h3>
            <p className="mt-4 text-sm leading-relaxed text-slate-700 sm:text-base">
              From the registration of an{" "}
              <span className="font-semibold">FIR to submission of the Final Report/Charge Sheet</span>, PRISM
              provides a unified view of investigation progress, key milestones, statutory timelines, evidence
              collection, arrests, forensic and technical reports, supervisory directions, and pending actions.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-slate-700 sm:text-base">
              The platform enables{" "}
              <span className="font-semibold">
                senior officers and investigating officers to monitor cases in real time
              </span>
              , identify delays and critical pendencies, issue timely directions, and ensure compliance with
              prescribed timelines.
            </p>
          </div>

          <div className="mt-10 text-center">
            <h3 className="text-2xl font-bold text-[#0b1f3a]">One Platform. One View. One Goal.</h3>
            <p className="mx-auto mt-2 max-w-3xl text-sm font-medium text-slate-600 sm:text-base">
              Better Investigation • Faster Disposal • Stronger Supervision • Greater Accountability
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: HiOutlineSearch,
                title: "Better Investigation",
                desc: "Unified view of milestones, evidence, forensic reports, and pending actions.",
              },
              {
                icon: HiOutlineClipboardCheck,
                title: "Faster Disposal",
                desc: "Track statutory timelines from FIR to Final Report / Charge Sheet.",
              },
              {
                icon: HiOutlineViewGrid,
                title: "Stronger Supervision",
                desc: "Senior officers and IOs monitor cases in real time and issue timely directions.",
              },
              {
                icon: HiOutlineShieldCheck,
                title: "Greater Accountability",
                desc: "Identify delays and critical pendencies to ensure quality-driven investigation.",
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
            <p>From FIR to Final Report—Under One Prism</p>
          </div>
        </footer>
      </AppShell>
    </AuthGuard>
  );
}
