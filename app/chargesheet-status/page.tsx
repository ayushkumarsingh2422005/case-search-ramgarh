"use client";
import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { AuthGuard } from "../../components/AuthGuard";
import { AppShell } from "../../components/AppShell";
import { useAuth } from "../../contexts/AuthContext";
import { getChargesheetAlertFromFir } from "../../lib/chargesheetDeadline";

type CaseRow = {
    _id: string;
    caseNo: string;
    year: number;
    policeStation: string;
    crimeSection: string;
    caseDate?: string;
    caseStatus: string;
    finalChargesheetSubmitted?: boolean;
    chargesheetDeadlineType?: string;
};

export default function ChargesheetStatusPage() {
    const { user } = useAuth();
    const scopedPoliceStation = user?.role === "Viewer" ? (user.policeStation || "") : "";
    const [data, setData] = useState<CaseRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        deadlineType: "" as "" | "60" | "90",
        status: "" as "" | "Overdue" | "Pending",
        policeStation: "",
    });

    useEffect(() => {
        if (scopedPoliceStation) {
            setFilters((prev) => ({ ...prev, policeStation: scopedPoliceStation }));
        }
    }, [scopedPoliceStation]);

    useEffect(() => {
        fetchCases();
    }, []);

    const fetchCases = async () => {
        try {
            setLoading(true);
            const response = await fetch("/api/cases?limit=0");
            const result = await response.json();
            if (result.success) setData(result.data || []);
        } catch (error) {
            console.error("Failed to fetch cases:", error);
        } finally {
            setLoading(false);
        }
    };

    const pendingList = useMemo(() => {
        return data
            .map((row) => {
                const alert = getChargesheetAlertFromFir(row);
                if (!alert) return null;
                return { row, alert };
            })
            .filter((item): item is { row: CaseRow; alert: NonNullable<ReturnType<typeof getChargesheetAlertFromFir>> } => item !== null)
            .sort((a, b) => a.alert.daysRemaining - b.alert.daysRemaining);
    }, [data]);

    const filteredList = useMemo(() => {
        return pendingList.filter((item) => {
            if (filters.deadlineType && item.alert.deadlineType !== filters.deadlineType) return false;
            if (filters.status === "Overdue" && !item.alert.isOverdue) return false;
            if (filters.status === "Pending" && item.alert.isOverdue) return false;
            if (filters.policeStation && !item.row.policeStation.toLowerCase().includes(filters.policeStation.toLowerCase())) return false;
            return true;
        });
    }, [pendingList, filters]);

    const resetFilters = () => {
        setFilters({ deadlineType: "", status: "", policeStation: scopedPoliceStation || "" });
    };

    const hasActiveFilters = Boolean(filters.deadlineType || filters.status || filters.policeStation);

    return (
        <AuthGuard>
            <AppShell title="Pending Chargesheet" subtitle="60/90-day window counted from FIR date">
                <div className="flex items-center justify-between mb-6">
                    <p className="text-sm text-slate-600">Deadline starts from FIR / case date</p>
                    <div className="text-sm font-medium text-slate-700 bg-orange-50 ring-1 ring-orange-200 rounded-full px-3 py-1">
                        {filteredList.length} of {pendingList.length} cases
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm ring-1 ring-slate-200 mb-6 overflow-hidden">
                    <div className="px-4 py-3 md:px-6 border-b border-slate-200">
                        <h3 className="text-sm font-semibold text-slate-800">Filters</h3>
                    </div>
                    <div className="px-4 py-4 md:px-6">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-700 mb-1.5">Deadline Type</label>
                                <select
                                    value={filters.deadlineType}
                                    onChange={(e) => setFilters({ ...filters, deadlineType: e.target.value as "" | "60" | "90" })}
                                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                >
                                    <option value="">All Types</option>
                                    <option value="60">60 Days</option>
                                    <option value="90">90 Days</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-700 mb-1.5">Status</label>
                                <select
                                    value={filters.status}
                                    onChange={(e) => setFilters({ ...filters, status: e.target.value as "" | "Overdue" | "Pending" })}
                                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                >
                                    <option value="">All Statuses</option>
                                    <option value="Overdue">Overdue</option>
                                    <option value="Pending">Pending</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-700 mb-1.5">Police Station</label>
                                <input
                                    type="text"
                                    value={scopedPoliceStation || filters.policeStation}
                                    onChange={(e) => {
                                        if (scopedPoliceStation) return;
                                        setFilters({ ...filters, policeStation: e.target.value });
                                    }}
                                    disabled={Boolean(scopedPoliceStation)}
                                    placeholder="Search station..."
                                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm disabled:bg-slate-100 disabled:text-slate-600"
                                />
                            </div>
                        </div>
                        {hasActiveFilters && (
                            <div className="mt-4 flex items-center gap-2">
                                <button type="button" onClick={resetFilters} className="text-sm text-blue-700 hover:text-blue-800 font-medium">
                                    Clear Filters
                                </button>
                                <span className="text-sm text-slate-600">
                                    {filteredList.length} result{filteredList.length !== 1 ? "s" : ""} found
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <svg className="animate-spin h-8 w-8 text-blue-600" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow ring-1 ring-slate-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Case</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">FIR Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Deadline Status</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-200">
                                    {filteredList.map((item) => (
                                        <tr key={item.row._id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="text-sm font-medium text-slate-900">Case No: {item.row.caseNo}</span>
                                                    <span>
                                                        <span className="text-xs text-slate-600">Year: {item.row.year}</span>
                                                        {" | "}
                                                        <span className="text-xs text-slate-600 font-medium">PS: {item.row.policeStation}</span>
                                                    </span>
                                                    <span className="text-xs text-slate-500">{item.row.crimeSection}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm text-slate-700">
                                                    {item.row.caseDate ? new Date(item.row.caseDate).toLocaleDateString() : "—"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div
                                                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ring-1 ring-inset ${
                                                        item.alert.isOverdue
                                                            ? "bg-red-100 text-red-800 ring-red-600/20"
                                                            : item.alert.daysRemaining <= 7
                                                              ? "bg-orange-100 text-orange-800 ring-orange-600/20"
                                                              : "bg-blue-100 text-blue-800 ring-blue-600/20"
                                                    }`}
                                                >
                                                    {item.alert.isOverdue
                                                        ? `Overdue: ${Math.abs(item.alert.daysRemaining)}d (${item.alert.deadlineType})`
                                                        : `${item.alert.daysRemaining} days left (${item.alert.deadlineType})`}
                                                </div>
                                                <div className="text-xs text-slate-500 mt-1">
                                                    Deadline: {new Date(item.alert.deadlineDate).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <Link href={`/cases/${item.row._id}`} className="text-blue-600 hover:text-blue-900">
                                                    View Case
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredList.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                                                {hasActiveFilters ? "No cases match your filters." : "No pending chargesheets found."}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </AppShell>
        </AuthGuard>
    );
}
