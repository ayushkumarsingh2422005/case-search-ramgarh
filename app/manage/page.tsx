"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { SuperAdminGuard } from "../../components/AuthGuard";
import { AppShell } from "../../components/AppShell";

type Case = {
  _id: string;
  caseNo: string;
  year: number;
  policeStation: string;
  crimeHead: string;
  crimeSection: string;
  investigatingOfficer?: string;
  punishmentCategory: string;
  caseStatus: string;
  investigationStatus?: string;
  priority?: string;
  accused?: Array<{ name: string; status: string }>;
  createdAt: string;
};

export default function ManageCasesPage() {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [investigatingOfficerNames, setInvestigatingOfficerNames] = useState<string[]>([]);
  const [searchFilters, setSearchFilters] = useState({
    caseNo: "",
    year: "",
    policeStation: "",
    investigatingOfficer: "" as "" | "__none__" | string,
  });

  useEffect(() => {
    const loadIo = async () => {
      try {
        const res = await fetch("/api/investigating-officers");
        const data = await res.json();
        if (data.success) setInvestigatingOfficerNames(data.data);
      } catch {
        /* ignore */
      }
    };
    loadIo();
  }, []);

  useEffect(() => {
    fetchCases();
  }, [page, searchFilters]);

  const fetchCases = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", "0");

      if (searchFilters.caseNo) params.append("caseNo", searchFilters.caseNo);
      if (searchFilters.year) params.append("year", searchFilters.year);
      if (searchFilters.policeStation) params.append("policeStation", searchFilters.policeStation);
      if (searchFilters.investigatingOfficer === "__none__") {
        params.append("investigatingOfficer", "__none__");
      } else if (searchFilters.investigatingOfficer) {
        params.append("investigatingOfficer", searchFilters.investigatingOfficer);
      }

      const response = await fetch(`/api/cases?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setCases(data.data);
        setTotalPages(data.pagination.pages);
      } else {
        setError(data.error || "Failed to fetch cases");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (caseId: string, caseNo: string) => {
    if (!confirm(`Are you sure you want to delete case ${caseNo}?`)) {
      return;
    }

    try {
      setDeleteLoading(caseId);
      const response = await fetch(`/api/cases/${caseId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        fetchCases();
      } else {
        alert(data.error || "Failed to delete case");
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setDeleteLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      Disposed: "bg-green-100 text-green-800 ring-green-600/20",
      "Under investigation": "bg-orange-100 text-orange-800 ring-orange-600/20",
      "Decision Pending": "bg-red-100 text-red-800 ring-red-600/20",
    };
    return statusColors[status] || "bg-slate-100 text-slate-800 ring-slate-600/20";
  };

  return (
    <SuperAdminGuard>
      <AppShell title="Manage Cases" subtitle="View, edit, and delete cases">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-sm text-slate-600">Browse and maintain all case records</p>
            </div>
            <Link
              href="/add"
              className="inline-flex items-center gap-2 rounded-xl bg-[#2f6fed] px-4 py-2.5 text-white font-medium shadow-lg shadow-blue-600/20 hover:bg-blue-600"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add New Case
            </Link>
          </div>

          <div className="prism-card overflow-hidden mb-6">
            <div className="px-4 py-4 md:px-6">
              <h2 className="text-sm font-semibold text-slate-800 mb-4">Quick Filters</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Case Number</label>
                  <input
                    type="text"
                    value={searchFilters.caseNo}
                    onChange={(e) => {
                      setSearchFilters({ ...searchFilters, caseNo: e.target.value });
                      setPage(1);
                    }}
                    placeholder="e.g., 123/2024"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Year</label>
                  <input
                    type="number"
                    value={searchFilters.year}
                    onChange={(e) => {
                      setSearchFilters({ ...searchFilters, year: e.target.value });
                      setPage(1);
                    }}
                    placeholder="e.g., 2024"
                    min="2000"
                    max={new Date().getFullYear()}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Police Station</label>
                  <input
                    type="text"
                    value={searchFilters.policeStation}
                    onChange={(e) => {
                      setSearchFilters({ ...searchFilters, policeStation: e.target.value });
                      setPage(1);
                    }}
                    placeholder="e.g., Ramgarh"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Investigating Officer</label>
                  <select
                    value={searchFilters.investigatingOfficer}
                    onChange={(e) => {
                      setSearchFilters({
                        ...searchFilters,
                        investigatingOfficer: e.target.value as typeof searchFilters.investigatingOfficer,
                      });
                      setPage(1);
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All</option>
                    <option value="__none__">Not assigned</option>
                    {investigatingOfficerNames.map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {(searchFilters.caseNo ||
                searchFilters.year ||
                searchFilters.policeStation ||
                searchFilters.investigatingOfficer) && (
                <div className="mt-4 flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSearchFilters({ caseNo: "", year: "", policeStation: "", investigatingOfficer: "" });
                      setPage(1);
                    }}
                    className="text-sm text-blue-700 hover:text-blue-800 font-medium"
                  >
                    Clear Filters
                  </button>
                  <span className="text-sm text-slate-600">
                    {cases.length} result{cases.length !== 1 ? "s" : ""} found
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="prism-card overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-slate-600">Loading cases...</div>
            ) : error ? (
              <div className="p-8 text-center">
                <p className="text-red-600">{error}</p>
                <button onClick={fetchCases} className="mt-4 text-blue-700 font-medium">
                  Retry
                </button>
              </div>
            ) : cases.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-slate-600 mb-4">No cases found</p>
                <Link
                  href="/add"
                  className="inline-flex items-center gap-2 rounded-md bg-blue-800 px-4 py-2 text-white font-medium"
                >
                  Add Your First Case
                </Link>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase">Case No</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase">Year</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase">Police Station</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase">I.O.</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase">Crime Head</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase">Section</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase">Accused</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-slate-700 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                      {cases.map((caseItem) => (
                        <tr key={caseItem._id} className="hover:bg-slate-50">
                          <td className="px-4 py-3 whitespace-nowrap">
                            <Link href={`/cases/${caseItem._id}`} className="text-blue-700 font-medium">
                              {caseItem.caseNo}
                            </Link>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">{caseItem.year}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">{caseItem.policeStation}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600">
                            {caseItem.investigatingOfficer || "—"}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">{caseItem.crimeHead}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">{caseItem.crimeSection}</td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${getStatusBadge(caseItem.caseStatus)}`}
                            >
                              {caseItem.caseStatus}
                              {caseItem.caseStatus === "Under investigation" &&
                                caseItem.investigationStatus &&
                                ` (${caseItem.investigationStatus})`}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">{caseItem.accused?.length || 0}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end gap-2">
                              <Link href={`/cases/${caseItem._id}`} className="text-blue-700" title="View">
                                View
                              </Link>
                              <Link href={`/edit/${caseItem._id}`} className="text-green-700" title="Edit">
                                Edit
                              </Link>
                              <button
                                onClick={() => handleDelete(caseItem._id, caseItem.caseNo)}
                                disabled={deleteLoading === caseItem._id}
                                className="text-red-700 disabled:opacity-50"
                                title="Delete"
                              >
                                {deleteLoading === caseItem._id ? "..." : "Delete"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {totalPages > 1 && (
                  <div className="px-4 py-3 border-t border-slate-200 flex items-center justify-between">
                    <div className="text-sm text-slate-600">
                      Page {page} of {totalPages}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-3 py-1 text-sm border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-50"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="px-3 py-1 text-sm border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-50"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
      </AppShell>
    </SuperAdminGuard>
  );
}
