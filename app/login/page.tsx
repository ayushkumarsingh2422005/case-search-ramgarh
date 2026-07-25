"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { HiOutlineLockClosed, HiOutlineMail, HiOutlineShieldCheck } from "react-icons/hi";
import { useAuth } from "../../contexts/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { user, login, loading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && user) {
      router.push("/dashboard");
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await login(email, password);

    if (result.success) {
      router.push("/dashboard");
      router.refresh();
    } else {
      setError(result.error || "Login failed");
    }

    setLoading(false);
  };

  if (authLoading || user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b1f3a]">
        <div className="text-center text-white">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          <p className="text-slate-300">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-[45%] flex-col justify-between bg-[#0b1f3a] p-10 text-white relative overflow-hidden">
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-blue-500/20" />
        <div className="absolute -bottom-16 -left-10 h-64 w-64 rounded-full bg-emerald-400/10" />
        <div className="relative">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#2f6fed] text-white">
              <HiOutlineShieldCheck className="h-7 w-7" />
            </span>
            <div>
              <div className="text-2xl font-bold tracking-wide">PRISM</div>
              <div className="text-xs text-slate-300">Ramgarh Police, Jharkhand</div>
            </div>
          </div>
        </div>
        <div className="relative space-y-4 max-w-md">
          <h2 className="text-3xl font-bold leading-tight">
            Police Review of Investigation Status & Monitoring
          </h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            Search cases, track chargesheets, monitor investigations, and manage station records in one place.
          </p>
          <p className="text-sm text-slate-400 pt-4">सुरक्षा • सेवा • विश्वास</p>
        </div>
        <div className="relative text-xs text-slate-500">© Ramgarh Police</div>
      </div>

      <div className="flex flex-1 items-center justify-center px-4 py-12 bg-[#f4f7fb]">
        <div className="w-full max-w-md">
          <div className="prism-card p-8">
            <div className="mb-8 lg:hidden flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0b1f3a] text-white">
                <HiOutlineShieldCheck className="h-5 w-5" />
              </span>
              <div>
                <div className="font-bold text-slate-900">PRISM</div>
                <div className="text-xs text-slate-500">Ramgarh Police</div>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-1">Welcome back</h1>
            <p className="text-sm text-slate-600 mb-8">Sign in to continue to the case system</p>

            {error && (
              <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <HiOutlineMail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <HiOutlineLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder="Enter your password"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-[#0b1f3a] px-4 py-3 font-semibold text-white shadow-lg shadow-slate-900/15 hover:bg-[#123056] disabled:opacity-50"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
