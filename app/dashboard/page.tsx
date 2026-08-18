"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  HiOutlineDocumentText,
  HiOutlineSearchCircle,
  HiOutlineClipboardCheck,
  HiOutlineClock,
  HiOutlineExclamationCircle,
  HiOutlineCheckCircle,
  HiOutlineEye,
  HiOutlinePlus,
  HiOutlineUserGroup,
} from "react-icons/hi";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  AreaChart,
  Area,
  ComposedChart,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import { AuthGuard } from "../../components/AuthGuard";
import { AppShell } from "../../components/AppShell";
import { getChargesheetAlertFromFir } from "../../lib/chargesheetDeadline";

type Accused = {
  name?: string;
  status?: string;
  arrestedDate?: string;
  arrestedOn?: string;
  chargesheet?: { date?: string };
};

type CaseRow = {
  _id: string;
  caseNo: string;
  year: number;
  policeStation: string;
  crimeHead?: string;
  crimeSection?: string;
  investigatingOfficer?: string;
  caseStatus: string;
  investigationStatus?: string;
  priority?: string;
  srNsr?: string;
  caseDecisionStatus?: string;
  finalChargesheetSubmitted?: boolean;
  chargesheetDeadlineType?: string;
  caseDate?: string;
  createdAt?: string;
  accused?: Accused[];
};

const STATUS_COLORS = {
  under: "#22c55e",
  disposed: "#8b5cf6",
  overdue: "#ef4444",
  pending: "#f59e0b",
  other: "#94a3b8",
  cs: "#eab308",
  detected: "#2f6fed",
  undetected: "#f97316",
  monitoring: "#06b6d4",
  normal: "#64748b",
};

const BAR_PALETTE = ["#2f6fed", "#22c55e", "#f59e0b", "#8b5cf6", "#ef4444", "#06b6d4", "#ec4899", "#14b8a6"];

function countTop(items: string[], limit = 10) {
  const map: Record<string, number> = {};
  for (const item of items) {
    const key = (item || "Unspecified").trim() || "Unspecified";
    map[key] = (map[key] || 0) + 1;
  }
  return Object.entries(map)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, limit);
}

function shortLabel(name: string, max = 14) {
  return name.length > max ? `${name.slice(0, max - 1)}…` : name;
}

function ChartCard({
  title,
  subtitle,
  children,
  className = "",
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`prism-card p-5 ${className}`}>
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      {subtitle ? <p className="mb-2 text-xs text-slate-500">{subtitle}</p> : <div className="mb-2" />}
      {children}
    </div>
  );
}

function daysSince(dateStr?: string) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  return Math.max(0, Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24)));
}

function KpiCard({
  title,
  value,
  hint,
  icon,
  tone,
}: {
  title: string;
  value: string | number;
  hint: string;
  icon: React.ReactNode;
  tone: "blue" | "green" | "amber" | "sky" | "red" | "violet";
}) {
  const tones = {
    blue: "from-blue-500 to-blue-600 shadow-blue-500/25",
    green: "from-emerald-500 to-emerald-600 shadow-emerald-500/25",
    amber: "from-amber-400 to-amber-500 shadow-amber-500/25",
    sky: "from-sky-400 to-sky-500 shadow-sky-500/25",
    red: "from-rose-500 to-rose-600 shadow-rose-500/25",
    violet: "from-violet-500 to-violet-600 shadow-violet-500/25",
  };
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${tones[tone]} p-4 text-white shadow-lg`}>
      <div className="absolute -right-3 -top-3 h-20 w-20 rounded-full bg-white/10" />
      <div className="absolute -bottom-6 -left-4 h-24 w-24 rounded-full bg-white/5" />
      <div className="relative flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-medium text-white/85">{title}</p>
          <p className="mt-1 text-3xl font-bold tabular-nums tracking-tight">{value}</p>
          <p className="mt-1 text-[11px] text-white/80">{hint}</p>
        </div>
        <div className="rounded-xl bg-white/20 p-2.5 backdrop-blur-sm">{icon}</div>
      </div>
    </div>
  );
}

export default function StatsDashboardPage() {
  const [cases, setCases] = useState<CaseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stationFilter, setStationFilter] = useState("");
  const [tableTab, setTableTab] = useState<"all" | "important" | "overdue">("all");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/cases?limit=0");
        const data = await res.json();
        if (data.success) setCases(data.data || []);
        else setError(data.error || "Failed to load cases");
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filteredCases = useMemo(() => {
    if (!stationFilter) return cases;
    return cases.filter((c) => c.policeStation === stationFilter);
  }, [cases, stationFilter]);

  const stations = useMemo(() => {
    return Array.from(new Set(cases.map((c) => c.policeStation).filter(Boolean))).sort();
  }, [cases]);

  const stats = useMemo(() => {
    const total = filteredCases.length;
    let underInvestigation = 0;
    let disposed = 0;
    let monitoring = 0;
    let finalCs = 0;
    let pendingCs = 0;
    let overdueCs = 0;
    let due7 = 0;
    let detected = 0;
    let undetected = 0;
    let arrested = 0;
    let notArrested = 0;
    let decisionPending = 0;
    let totalAccused = 0;

    const monthBuckets: Record<string, { registered: number; disposed: number; chargeSheeted: number }> = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = d.toLocaleString("en-US", { month: "short" });
      monthBuckets[key] = { registered: 0, disposed: 0, chargeSheeted: 0 };
    }

    const ageingMap = {
      "0–30d": 0,
      "31–60d": 0,
      "61–90d": 0,
      "91–180d": 0,
      "180+d": 0,
    };
    let deadline60 = 0;
    let deadline90 = 0;
    let deadlineUnset = 0;
    let ioAssigned = 0;
    let ioUnassigned = 0;
    const stationStatusMap: Record<string, { under: number; disposed: number; other: number }> = {};

    for (const c of filteredCases) {
      if (c.caseStatus === "Under investigation") underInvestigation += 1;
      if (c.caseStatus === "Disposed") disposed += 1;
      if (c.priority === "Under monitoring") monitoring += 1;
      if (c.finalChargesheetSubmitted) finalCs += 1;
      if (c.investigationStatus === "Detected") detected += 1;
      if (c.investigationStatus === "Undetected") undetected += 1;

      if (c.investigatingOfficer?.trim()) ioAssigned += 1;
      else ioUnassigned += 1;

      if (c.chargesheetDeadlineType === "90") deadline90 += 1;
      else if (c.chargesheetDeadlineType === "60") deadline60 += 1;
      else deadlineUnset += 1;

      const stationKey = (c.policeStation || "Unspecified").trim() || "Unspecified";
      if (!stationStatusMap[stationKey]) stationStatusMap[stationKey] = { under: 0, disposed: 0, other: 0 };
      if (c.caseStatus === "Under investigation") stationStatusMap[stationKey].under += 1;
      else if (c.caseStatus === "Disposed") stationStatusMap[stationKey].disposed += 1;
      else stationStatusMap[stationKey].other += 1;

      if (c.caseStatus === "Under investigation") {
        const age = daysSince(c.caseDate || c.createdAt);
        if (age !== null) {
          if (age <= 30) ageingMap["0–30d"] += 1;
          else if (age <= 60) ageingMap["31–60d"] += 1;
          else if (age <= 90) ageingMap["61–90d"] += 1;
          else if (age <= 180) ageingMap["91–180d"] += 1;
          else ageingMap["180+d"] += 1;
        }
      }

      for (const acc of c.accused || []) {
        totalAccused += 1;
        const st = (acc.status || "").toLowerCase();
        if (st === "arrested" || st === "true") arrested += 1;
        else if (st.includes("not arrest") || st === "false") notArrested += 1;
        else if (st.includes("decision pending")) decisionPending += 1;
      }

      const created = c.caseDate || c.createdAt;
      if (created) {
        const d = new Date(created);
        if (!isNaN(d.getTime())) {
          const key = d.toLocaleString("en-US", { month: "short" });
          if (key in monthBuckets) {
            monthBuckets[key].registered += 1;
            if (c.caseStatus === "Disposed") monthBuckets[key].disposed += 1;
            if (c.finalChargesheetSubmitted) monthBuckets[key].chargeSheeted += 1;
          }
        }
      }

      if (!c.finalChargesheetSubmitted) {
        const alert = getChargesheetAlertFromFir(c);
        if (alert) {
          pendingCs += 1;
          if (alert.isOverdue) overdueCs += 1;
          else if (alert.daysRemaining <= 7) due7 += 1;
        }
      }
    }

    const pct = (n: number) => (total ? ((n / total) * 100).toFixed(1) : "0.0");

    const donut = [
      { name: "Under Investigation", value: underInvestigation, color: STATUS_COLORS.under },
      { name: "Charge-sheeted", value: finalCs, color: STATUS_COLORS.cs },
      { name: "Disposed", value: disposed, color: STATUS_COLORS.disposed },
      { name: "Other / Pending", value: Math.max(0, total - underInvestigation - disposed), color: STATUS_COLORS.other },
    ].filter((d) => d.value > 0);

    const trend = Object.entries(monthBuckets).map(([month, v]) => ({
      month,
      registered: v.registered,
      disposed: v.disposed,
      chargeSheeted: v.chargeSheeted,
    }));

    const byStation = countTop(
      filteredCases.map((c) => c.policeStation),
      12
    ).map((r) => ({ ...r, label: shortLabel(r.name, 12) }));

    const byStationStatus = Object.entries(stationStatusMap)
      .map(([name, v]) => ({
        name,
        label: shortLabel(name, 12),
        under: v.under,
        disposed: v.disposed,
        other: v.other,
        total: v.under + v.disposed + v.other,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 8);

    const byIo = countTop(
      filteredCases.map((c) => (c.investigatingOfficer?.trim() ? c.investigatingOfficer : "Not assigned")),
      10
    ).map((r) => ({ ...r, label: shortLabel(r.name, 14) }));

    const byCrimeHead = countTop(
      filteredCases.map((c) => c.crimeHead || ""),
      10
    ).map((r) => ({ ...r, label: shortLabel(r.name, 14) }));

    const byCrimeSection = countTop(
      filteredCases.map((c) => c.crimeSection || ""),
      8
    ).map((r) => ({ ...r, label: shortLabel(r.name, 16) }));

    const byYear = countTop(
      filteredCases.map((c) => String(c.year || "Unknown")),
      12
    ).sort((a, b) => Number(a.name) - Number(b.name));

    const ageingBars = Object.entries(ageingMap).map(([name, value]) => ({ name, value }));

    const deadlinePie = [
      { name: "60 days", value: deadline60, color: "#2f6fed" },
      { name: "90 days", value: deadline90, color: "#f59e0b" },
      { name: "Not set", value: deadlineUnset, color: STATUS_COLORS.other },
    ].filter((d) => d.value > 0);

    const ioAssignPie = [
      { name: "IO Assigned", value: ioAssigned, color: "#22c55e" },
      { name: "Not Assigned", value: ioUnassigned, color: "#ef4444" },
    ].filter((d) => d.value > 0);

    const pipeline = [
      { name: "Total", value: total, fill: "#2f6fed" },
      { name: "Under Inv.", value: underInvestigation, fill: "#22c55e" },
      { name: "Detected", value: detected, fill: "#06b6d4" },
      { name: "Final CS", value: finalCs, fill: "#eab308" },
      { name: "Disposed", value: disposed, fill: "#8b5cf6" },
    ];

    const radarStats = [
      { metric: "Under Inv.", value: underInvestigation },
      { metric: "Detected", value: detected },
      { metric: "Monitoring", value: monitoring },
      { metric: "Final CS", value: finalCs },
      { metric: "Overdue CS", value: overdueCs },
      { metric: "Disposed", value: disposed },
    ];

    const investigationPie = [
      { name: "Detected", value: detected, color: STATUS_COLORS.detected },
      { name: "Undetected", value: undetected, color: STATUS_COLORS.undetected },
      { name: "Not set", value: Math.max(0, total - detected - undetected), color: STATUS_COLORS.other },
    ].filter((d) => d.value > 0);

    const priorityPie = [
      { name: "Under monitoring", value: monitoring, color: STATUS_COLORS.monitoring },
      { name: "Normal / Other", value: Math.max(0, total - monitoring), color: STATUS_COLORS.normal },
    ].filter((d) => d.value > 0);

    const accusedPie = [
      { name: "Arrested", value: arrested, color: "#ef4444" },
      { name: "Not Arrested", value: notArrested, color: "#22c55e" },
      { name: "Decision Pending", value: decisionPending, color: "#8b5cf6" },
      {
        name: "Other",
        value: Math.max(0, totalAccused - arrested - notArrested - decisionPending),
        color: STATUS_COLORS.other,
      },
    ].filter((d) => d.value > 0);

    const csBar = [
      { name: "Final CS", value: finalCs, fill: "#22c55e" },
      { name: "Pending", value: Math.max(0, pendingCs - overdueCs), fill: "#f59e0b" },
      { name: "Overdue", value: overdueCs, fill: "#ef4444" },
      { name: "Due 7d", value: due7, fill: "#06b6d4" },
    ];

    const bySrNsr = countTop(
      filteredCases.map((c) => c.srNsr || "Not set"),
      5
    );
    const byDecision = countTop(
      filteredCases.map((c) => c.caseDecisionStatus || "Not set"),
      6
    ).map((r) => ({ ...r, label: shortLabel(r.name, 16) }));

    const alerts = [
      overdueCs > 0
        ? { tone: "red" as const, title: `${overdueCs} overdue chargesheet(s)`, desc: "Immediate attention required" }
        : null,
      due7 > 0
        ? { tone: "amber" as const, title: `${due7} due within 7 days`, desc: "Upcoming chargesheet deadlines" }
        : null,
      monitoring > 0
        ? { tone: "blue" as const, title: `${monitoring} under monitoring`, desc: "Priority cases to review" }
        : null,
      pendingCs > 0
        ? { tone: "green" as const, title: `${pendingCs} pending chargesheet(s)`, desc: "Accused-level pending CS" }
        : null,
    ].filter(Boolean) as Array<{ tone: "red" | "amber" | "blue" | "green"; title: string; desc: string }>;

    return {
      total,
      underInvestigation,
      disposed,
      finalCs,
      pendingCs,
      overdueCs,
      due7,
      monitoring,
      totalAccused,
      pct,
      donut,
      trend,
      alerts,
      byStation,
      byStationStatus,
      byIo,
      byCrimeHead,
      byCrimeSection,
      byYear,
      investigationPie,
      priorityPie,
      accusedPie,
      csBar,
      bySrNsr,
      byDecision,
      ageingBars,
      deadlinePie,
      ioAssignPie,
      pipeline,
      radarStats,
    };
  }, [filteredCases]);

  const recentRows = useMemo(() => {
    let rows = [...filteredCases];
    if (tableTab === "important") {
      rows = rows.filter((c) => c.priority === "Under monitoring");
    } else if (tableTab === "overdue") {
      rows = rows.filter((c) => Boolean(getChargesheetAlertFromFir(c)?.isOverdue));
    }
    return rows
      .sort((a, b) => {
        const da = new Date(a.caseDate || a.createdAt || 0).getTime();
        const db = new Date(b.caseDate || b.createdAt || 0).getTime();
        return db - da;
      })
      .slice(0, 8);
  }, [filteredCases, tableTab]);

  const statusBadge = (status: string) => {
    if (status === "Disposed") return "bg-violet-100 text-violet-800 ring-violet-600/20";
    if (status === "Under investigation") return "bg-emerald-100 text-emerald-800 ring-emerald-600/20";
    return "bg-slate-100 text-slate-700 ring-slate-500/20";
  };

  return (
    <AuthGuard>
      <AppShell>
        {loading ? (
          <div className="prism-card flex h-64 items-center justify-center text-slate-500">Loading dashboard…</div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Dashboard</h2>
                <p className="text-sm text-slate-600">
                  Live overview of <span className="font-semibold text-slate-900">{stats.total}</span> cases
                  {stationFilter ? ` at ${stationFilter}` : " across all stations"} ·{" "}
                  <span className="font-medium">{stats.totalAccused}</span> accused
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={stationFilter}
                  onChange={(e) => setStationFilter(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="">All Police Stations</option>
                  {stations.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <Link
                  href="/add"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#2f6fed] px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-600"
                >
                  <HiOutlinePlus className="h-4 w-4" />
                  Add Case
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 xl:grid-cols-6">
              <KpiCard title="Total Cases" value={stats.total} hint="All registered cases" tone="blue" icon={<HiOutlineDocumentText className="h-5 w-5" />} />
              <KpiCard title="Under Investigation" value={stats.underInvestigation} hint={`${stats.pct(stats.underInvestigation)}% of total`} tone="green" icon={<HiOutlineSearchCircle className="h-5 w-5" />} />
              <KpiCard title="Charge-sheeted" value={stats.finalCs} hint={`${stats.pct(stats.finalCs)}% final CS filed`} tone="amber" icon={<HiOutlineClipboardCheck className="h-5 w-5" />} />
              <KpiCard title="Due in 7 Days" value={stats.due7} hint="Action required" tone="sky" icon={<HiOutlineClock className="h-5 w-5" />} />
              <KpiCard title="Overdue CS" value={stats.overdueCs} hint="Immediate attention" tone="red" icon={<HiOutlineExclamationCircle className="h-5 w-5" />} />
              <KpiCard title="Disposed" value={stats.disposed} hint={`${stats.pct(stats.disposed)}% of total`} tone="violet" icon={<HiOutlineCheckCircle className="h-5 w-5" />} />
            </div>

            {/* Row: status / trend / alerts */}
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
              <ChartCard title="Case Status Overview" subtitle="Distribution of current case status">
                <div className="h-56">
                  {stats.donut.length === 0 ? (
                    <div className="flex h-full items-center justify-center text-sm text-slate-400">No data</div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={stats.donut} dataKey="value" nameKey="name" innerRadius={55} outerRadius={80} paddingAngle={3}>
                          {stats.donut.map((entry) => (
                            <Cell key={entry.name} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </ChartCard>

              <ChartCard title="Case Trend (Last 6 Months)" subtitle="Registered vs disposed by month">
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats.trend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Area type="monotone" dataKey="registered" name="Registered" stroke="#2f6fed" fill="#2f6fed33" strokeWidth={2} />
                      <Area type="monotone" dataKey="disposed" name="Disposed" stroke="#8b5cf6" fill="#8b5cf633" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>

              <ChartCard title="Alerts & Notifications" subtitle="Priority attention items">
                <div className="mb-2 text-right">
                  <Link href="/chargesheet-status" className="text-xs font-medium text-blue-700 hover:underline">
                    View all →
                  </Link>
                </div>
                <div className="max-h-52 space-y-2.5 overflow-y-auto prism-scroll">
                  {stats.alerts.length === 0 ? (
                    <p className="py-8 text-center text-sm text-slate-400">No urgent alerts</p>
                  ) : (
                    stats.alerts.map((a) => {
                      const toneClass =
                        a.tone === "red"
                          ? "bg-rose-50 border-rose-200 text-rose-800"
                          : a.tone === "amber"
                            ? "bg-amber-50 border-amber-200 text-amber-900"
                            : a.tone === "blue"
                              ? "bg-blue-50 border-blue-200 text-blue-900"
                              : "bg-emerald-50 border-emerald-200 text-emerald-900";
                      const Icon =
                        a.tone === "red"
                          ? HiOutlineExclamationCircle
                          : a.tone === "amber"
                            ? HiOutlineClock
                            : a.tone === "blue"
                              ? HiOutlineSearchCircle
                              : HiOutlineClipboardCheck;
                      return (
                        <div key={a.title} className={`flex gap-3 rounded-xl border p-3 ${toneClass}`}>
                          <Icon className="mt-0.5 h-5 w-5 shrink-0" />
                          <div>
                            <p className="text-sm font-semibold">{a.title}</p>
                            <p className="text-xs opacity-80">{a.desc}</p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </ChartCard>
            </div>

            {/* Row: station + IO bars */}
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              <ChartCard title="Cases by Police Station" subtitle="Top stations by case count">
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.byStation} layout="vertical" margin={{ left: 8, right: 12 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                      <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                      <YAxis type="category" dataKey="label" width={90} tick={{ fontSize: 10 }} />
                      <Tooltip formatter={(v) => [v, "Cases"]} labelFormatter={(_, payload) => payload?.[0]?.payload?.name || ""} />
                      <Bar dataKey="value" name="Cases" radius={[0, 6, 6, 0]}>
                        {stats.byStation.map((_, i) => (
                          <Cell key={i} fill={BAR_PALETTE[i % BAR_PALETTE.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>

              <ChartCard title="Cases by Investigating Officer" subtitle="Top IOs by assigned cases">
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.byIo} layout="vertical" margin={{ left: 8, right: 12 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                      <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                      <YAxis type="category" dataKey="label" width={100} tick={{ fontSize: 10 }} />
                      <Tooltip formatter={(v) => [v, "Cases"]} labelFormatter={(_, payload) => payload?.[0]?.payload?.name || ""} />
                      <Bar dataKey="value" name="Cases" radius={[0, 6, 6, 0]}>
                        {stats.byIo.map((_, i) => (
                          <Cell key={i} fill={BAR_PALETTE[(i + 2) % BAR_PALETTE.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>
            </div>

            {/* Row: station status stack + ageing + pipeline */}
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
              <ChartCard title="Station × Status" subtitle="Under investigation vs disposed (top 8)">
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.byStationStatus} margin={{ left: 0, right: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="label" tick={{ fontSize: 10 }} interval={0} angle={-25} textAnchor="end" height={55} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                      <Tooltip labelFormatter={(_, payload) => payload?.[0]?.payload?.name || ""} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Bar dataKey="under" name="Under Inv." stackId="a" fill="#22c55e" radius={[0, 0, 0, 0]} />
                      <Bar dataKey="disposed" name="Disposed" stackId="a" fill="#8b5cf6" />
                      <Bar dataKey="other" name="Other" stackId="a" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>

              <ChartCard title="Case Ageing" subtitle="Days open — under investigation only">
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.ageingBars}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="value" name="Cases" radius={[6, 6, 0, 0]}>
                        {stats.ageingBars.map((entry, i) => (
                          <Cell
                            key={entry.name}
                            fill={["#22c55e", "#84cc16", "#f59e0b", "#f97316", "#ef4444"][i] || "#94a3b8"}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>

              <ChartCard title="Case Pipeline" subtitle="Funnel across key stages">
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.pipeline} layout="vertical" margin={{ left: 8, right: 12 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                      <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                      <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="value" name="Count" radius={[0, 6, 6, 0]}>
                        {stats.pipeline.map((e) => (
                          <Cell key={e.name} fill={e.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>
            </div>

            {/* Row: crime head + year + CS status */}
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
              <ChartCard title="Cases by Crime Head" subtitle="Top crime categories" className="xl:col-span-1">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.byCrimeHead}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="label" tick={{ fontSize: 10 }} interval={0} angle={-25} textAnchor="end" height={55} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(v) => [v, "Cases"]} labelFormatter={(_, payload) => payload?.[0]?.payload?.name || ""} />
                      <Bar dataKey="value" name="Cases" radius={[6, 6, 0, 0]} fill="#8b5cf6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>

              <ChartCard title="Cases by Year" subtitle="Registration year distribution">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.byYear}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="value" name="Cases" radius={[6, 6, 0, 0]} fill="#2f6fed" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>

              <ChartCard title="Chargesheet Status" subtitle="Filed / pending / overdue">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.csBar}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="value" name="Count" radius={[6, 6, 0, 0]}>
                        {stats.csBar.map((entry) => (
                          <Cell key={entry.name} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>
            </div>

            {/* Row: section / deadline / IO assign / radar */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              <ChartCard title="Top Crime Sections" subtitle="Most frequent sections">
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.byCrimeSection} layout="vertical" margin={{ left: 4, right: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                      <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10 }} />
                      <YAxis type="category" dataKey="label" width={88} tick={{ fontSize: 9 }} />
                      <Tooltip labelFormatter={(_, payload) => payload?.[0]?.payload?.name || ""} />
                      <Bar dataKey="value" name="Cases" radius={[0, 6, 6, 0]} fill="#0ea5e9" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>

              <ChartCard title="CS Deadline Type" subtitle="60-day vs 90-day window">
                <div className="h-52">
                  {stats.deadlinePie.length === 0 ? (
                    <div className="flex h-full items-center justify-center text-sm text-slate-400">No data</div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={stats.deadlinePie} dataKey="value" nameKey="name" innerRadius={40} outerRadius={70} paddingAngle={2}>
                          {stats.deadlinePie.map((e) => (
                            <Cell key={e.name} fill={e.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend wrapperStyle={{ fontSize: 10 }} iconType="circle" />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </ChartCard>

              <ChartCard title="IO Assignment" subtitle="Cases with investigating officer">
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={stats.ioAssignPie} dataKey="value" nameKey="name" innerRadius={40} outerRadius={70} paddingAngle={2}>
                        {stats.ioAssignPie.map((e) => (
                          <Cell key={e.name} fill={e.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: 10 }} iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>

              <ChartCard title="Workload Radar" subtitle="Key operational metrics">
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={stats.radarStats} cx="50%" cy="50%" outerRadius="70%">
                      <PolarGrid stroke="#e2e8f0" />
                      <PolarAngleAxis dataKey="metric" tick={{ fontSize: 9, fill: "#64748b" }} />
                      <PolarRadiusAxis tick={{ fontSize: 9 }} />
                      <Radar name="Count" dataKey="value" stroke="#2f6fed" fill="#2f6fed" fillOpacity={0.35} />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>
            </div>

            {/* Row: investigation / priority / accused / decision */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              <ChartCard title="Investigation Status" subtitle="Detected vs undetected">
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={stats.investigationPie} dataKey="value" nameKey="name" innerRadius={40} outerRadius={70} paddingAngle={2}>
                        {stats.investigationPie.map((e) => (
                          <Cell key={e.name} fill={e.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: 10 }} iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>

              <ChartCard title="Priority Mix" subtitle="Monitoring vs normal">
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={stats.priorityPie} dataKey="value" nameKey="name" innerRadius={40} outerRadius={70} paddingAngle={2}>
                        {stats.priorityPie.map((e) => (
                          <Cell key={e.name} fill={e.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: 10 }} iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>

              <ChartCard title="Accused Status" subtitle={`Total accused: ${stats.totalAccused}`}>
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={stats.accusedPie} dataKey="value" nameKey="name" innerRadius={40} outerRadius={70} paddingAngle={2}>
                        {stats.accusedPie.map((e) => (
                          <Cell key={e.name} fill={e.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: 10 }} iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>

              <ChartCard title="Case Decision Status" subtitle="True / False / Pendency">
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.byDecision}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="label" tick={{ fontSize: 9 }} interval={0} angle={-20} textAnchor="end" height={50} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                      <Tooltip labelFormatter={(_, payload) => payload?.[0]?.payload?.name || ""} />
                      <Bar dataKey="value" name="Cases" radius={[6, 6, 0, 0]} fill="#14b8a6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>
            </div>

            {/* SR/NSR line summary */}
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
              <ChartCard title="SR / NSR Distribution" subtitle="Special report classification" className="xl:col-span-1">
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.bySrNsr}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="value" name="Cases" radius={[6, 6, 0, 0]} fill="#ec4899" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>

              <ChartCard title="Monthly Activity" subtitle="Registered · disposed · charge-sheeted" className="xl:col-span-2">
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={stats.trend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Bar dataKey="registered" name="Registered" fill="#2f6fed" radius={[4, 4, 0, 0]} />
                      <Line type="monotone" dataKey="disposed" name="Disposed" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 3 }} />
                      <Line type="monotone" dataKey="chargeSheeted" name="Charge-sheeted" stroke="#22c55e" strokeWidth={3} dot={{ r: 3 }} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>
            </div>

            {/* Recent cases + quick actions */}
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
              <div className="prism-card overflow-hidden xl:col-span-2">
                <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <h3 className="text-sm font-semibold text-slate-900">Recent Cases</h3>
                  <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
                    {(
                      [
                        ["all", "All Cases"],
                        ["important", "Important"],
                        ["overdue", "Overdue"],
                      ] as const
                    ).map(([id, label]) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setTableTab(id)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                          tableTab === id ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="px-4 py-3 font-medium">Case No.</th>
                        <th className="px-4 py-3 font-medium">Police Station</th>
                        <th className="px-4 py-3 font-medium">Section</th>
                        <th className="px-4 py-3 font-medium">Status</th>
                        <th className="px-4 py-3 font-medium">I.O.</th>
                        <th className="px-4 py-3 font-medium">Days</th>
                        <th className="px-4 py-3 text-right font-medium">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {recentRows.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-4 py-10 text-center text-slate-400">
                            No cases in this view
                          </td>
                        </tr>
                      ) : (
                        recentRows.map((row) => {
                          const elapsed = daysSince(row.caseDate || row.createdAt);
                          return (
                            <tr key={row._id} className="hover:bg-slate-50/80">
                              <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-900">{row.caseNo}</td>
                              <td className="whitespace-nowrap px-4 py-3 text-slate-600">{row.policeStation}</td>
                              <td className="max-w-[140px] truncate px-4 py-3 text-slate-600">{row.crimeSection || "—"}</td>
                              <td className="whitespace-nowrap px-4 py-3">
                                <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${statusBadge(row.caseStatus)}`}>
                                  {row.caseStatus}
                                </span>
                              </td>
                              <td className="whitespace-nowrap px-4 py-3 text-slate-600">{row.investigatingOfficer || "—"}</td>
                              <td className="px-4 py-3 tabular-nums text-slate-600">{elapsed ?? "—"}</td>
                              <td className="px-4 py-3 text-right">
                                <Link href={`/cases/${row._id}`} className="inline-flex rounded-lg p-1.5 text-blue-700 hover:bg-blue-50" title="View">
                                  <HiOutlineEye className="h-4 w-4" />
                                </Link>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="border-t border-slate-100 px-5 py-3 text-right">
                  <Link href="/manage" className="text-sm font-medium text-blue-700 hover:underline">
                    View All Cases →
                  </Link>
                </div>
              </div>

              <div className="prism-card p-5">
                <h3 className="mb-1 text-sm font-semibold text-slate-900">Quick Actions</h3>
                <p className="mb-4 text-xs text-slate-500">Jump to common workflows</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { href: "/add", label: "Add Case", icon: HiOutlinePlus, color: "bg-blue-50 text-blue-700" },
                    { href: "/search", label: "Search Cases", icon: HiOutlineSearchCircle, color: "bg-emerald-50 text-emerald-700" },
                    { href: "/chargesheet-status", label: "Pending CS", icon: HiOutlineExclamationCircle, color: "bg-rose-50 text-rose-700" },
                    { href: "/manage", label: "Manage", icon: HiOutlineClipboardCheck, color: "bg-amber-50 text-amber-700" },
                    { href: "/admin", label: "Admin", icon: HiOutlineDocumentText, color: "bg-violet-50 text-violet-700" },
                    { href: "/dashboard", label: "Accused Stats", icon: HiOutlineUserGroup, color: "bg-sky-50 text-sky-700" },
                  ].map((a) => (
                    <Link
                      key={a.label}
                      href={a.href}
                      className={`flex flex-col items-center gap-2 rounded-2xl p-4 text-center transition hover:scale-[1.02] ${a.color}`}
                    >
                      <a.icon className="h-6 w-6" />
                      <span className="text-xs font-semibold leading-tight">{a.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </AppShell>
    </AuthGuard>
  );
}
