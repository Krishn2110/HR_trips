"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, Loader2, GlassWater, ArrowLeft, KeyRound, CheckCircle2 } from "lucide-react";

type ViewState = "login" | "request" | "verify" | "reset" | "success";

export default function BanquetOwnerLoginPage() {
  const router = useRouter();

  // View State
  const [view, setView] = useState<ViewState>("login");

  // Form Data
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Safe JSON parser
  const parseResponse = async (res: Response) => {
    const rawText = await res.text();
    const firstBrace = rawText.indexOf('{');
    const lastBrace = rawText.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
      const jsonText = rawText.substring(firstBrace, lastBrace + 1);
      return JSON.parse(jsonText);
    }
    throw new Error("Invalid server response");
  };

  // --- API: LOGIN ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      let remoteOk = false;
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/banquets/auth/login.php`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim(), password }),
        });

        const result = await parseResponse(response);

        if (response.ok && result.status === "success") {
          remoteOk = true;
          sessionStorage.setItem("banquetOwnerLoggedIn", "true");
          sessionStorage.setItem("banquetOwnerEmail", email.trim());
          if (result.banquet_id) sessionStorage.setItem("banquetOwnerId", String(result.banquet_id));
          router.push("/banquet-owner");
        }
      } catch (err) {
        // fallback
      }

      if (!remoteOk) {
        const localRegsStr = localStorage.getItem("hr_trips_banquet_registrations");
        if (localRegsStr) {
          const regs = JSON.parse(localRegsStr);
          const found = regs.find((r: any) => r.email === email.trim());
          if (found) {
            sessionStorage.setItem("banquetOwnerLoggedIn", "true");
            sessionStorage.setItem("banquetOwnerEmail", email.trim());
            sessionStorage.setItem("banquetOwnerId", found.id);
            router.push("/banquet-owner");
            return;
          }
        }
        setError("Invalid email address or password.");
      }
    } catch (err: any) {
      setError(err?.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface via-white to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Link */}
        <Link
          href="/banquet-booking"
          className="inline-flex items-center gap-1.5 text-muted text-xs font-medium hover:text-ink transition-colors mb-8"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Banquet Booking
        </Link>

        {/* Auth Card */}
        <div className="bg-white rounded-2xl border border-border/50 shadow-xl shadow-black/5 p-8">
          <div className="text-center mb-8">
            <img src="/logo.png" alt="HR Trips Logo" className="w-16 h-16 object-contain rounded-2xl mx-auto mb-4 shadow-lg bg-white p-1 border border-border/40" />
            <h1 className="font-heading font-black text-2xl text-ink">
              Banquet Owner Portal
            </h1>
            <p className="text-muted text-sm mt-1">
              Login to check venue verification status & manage event bookings
            </p>
          </div>

          {error && (
            <div className="mb-5 bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-xs text-center font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs text-muted mb-1.5 font-medium">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter registered owner email"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-surface rounded-xl text-sm text-ink border border-border focus:border-primary transition-colors outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-muted mb-1.5 font-medium">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-surface rounded-xl text-sm text-ink border border-border focus:border-primary transition-colors outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl text-xs shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Loggin in...
                </>
              ) : (
                "Log In to Portal"
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-border/50 text-center space-y-3">
            <p className="text-xs text-muted">
              Don't have a registered banquet venue yet?{" "}
              <Link href="/banquet-registration" className="text-primary font-bold hover:underline">
                Register Your Banquet
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
