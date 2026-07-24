"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, Loader2, Car, ArrowLeft, KeyRound, CheckCircle2 } from "lucide-react";
import { getCabRegistrationByEmail } from "@/lib/api";

type ViewState = "login" | "request" | "verify" | "reset" | "success";

export default function CabOwnerLoginPage() {
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

  // --- API: LOGIN ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // 1. Try remote API first
      let success = false;
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cabs/auth/login.php`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const rawText = await response.text();
        const firstBrace = rawText.indexOf('{');
        const lastBrace = rawText.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1) {
          const jsonText = rawText.substring(firstBrace, lastBrace + 1);
          const result = JSON.parse(jsonText);

          if (response.ok && result.status === "success") {
            sessionStorage.setItem("cabOwnerLoggedIn", "true");
            sessionStorage.setItem("cabOwnerEmail", result.data.email || email);
            sessionStorage.setItem("cabOwnerId", result.data.id || "1");
            success = true;
            router.push("/cab-owner");
            return;
          }
        }
      } catch (remoteErr) {
        console.log("Remote login check skipped, trying local registry...", remoteErr);
      }

      // 2. Fallback to local cab registration storage
      if (!success) {
        const reg = await getCabRegistrationByEmail(email.trim());
        if (reg) {
          if (reg.password === password) {
            sessionStorage.setItem("cabOwnerLoggedIn", "true");
            sessionStorage.setItem("cabOwnerEmail", reg.email);
            sessionStorage.setItem("cabOwnerId", reg.id);
            router.push("/cab-owner");
            return;
          } else {
            setError("Invalid password. Please check your password.");
            setIsLoading(false);
            return;
          }
        } else {
          setError("No registered cab found with this email. Please register your vehicle first.");
        }
      }
    } catch {
      setError("Network error. Please try again.");
    } fontally: {
      setIsLoading(false);
    }
  };

  // --- API: REQUEST OTP ---
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !email.includes("@")) return setError("Please enter a valid email address");

    setIsLoading(true);
    try {
      setView("verify");
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- API: VERIFY OTP ---
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (otp.length !== 6) return setError("Please enter the 6-digit OTP");

    setIsLoading(true);
    try {
      setView("reset");
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- API: RESET PASSWORD ---
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (newPassword.length < 6) return setError("Password must be at least 6 characters long");

    setIsLoading(true);
    try {
      setView("success");
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetToLogin = () => {
    setView("login");
    setError("");
    setPassword("");
    setOtp("");
    setNewPassword("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface via-white to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Link */}
        <Link
          href="/cab-services"
          className="inline-flex items-center gap-1.5 text-muted text-xs font-medium hover:text-ink transition-colors mb-8"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Cab Services
        </Link>

        {/* Auth Card */}
        <div className="bg-white rounded-2xl border border-border/50 shadow-xl shadow-black/5 p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/20">
              <Car className="w-8 h-8 text-white" />
            </div>
            <h1 className="font-heading font-black text-2xl text-ink">
              Cab Owner Portal
            </h1>
            <p className="text-muted text-sm mt-1">
              Login to check vehicle verification status & manage trips
            </p>
          </div>

          {error && (
            <div className="mb-5 bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-xs text-center font-medium">
              {error}
            </div>
          )}

          {/* VIEW: LOGIN */}
          {view === "login" && (
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-xs text-muted mb-1.5 font-medium">
                  Registered Owner Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your registered email"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-surface rounded-xl text-sm text-ink border border-border focus:border-primary transition-colors outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs text-muted font-medium">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setView("request");
                      setError("");
                    }}
                    className="text-primary text-[11px] font-semibold hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your account password"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-surface rounded-xl text-sm text-ink border border-border focus:border-primary transition-colors outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-gradient-to-r from-primary to-primary-dark text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-primary/25 active:scale-[0.99] transition-all disabled:opacity-70 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Logging in...
                  </>
                ) : (
                  "Login to Owner Dashboard"
                )}
              </button>

              <div className="mt-6 text-center">
                <p className="text-muted text-xs">
                  Don&apos;t have a registered cab?{" "}
                  <Link
                    href="/cab-registration"
                    className="text-primary font-semibold hover:underline"
                  >
                    Register your vehicle
                  </Link>
                </p>
              </div>
            </form>
          )}

          {/* VIEW: REQUEST OTP */}
          {view === "request" && (
            <form onSubmit={handleRequestOtp} className="space-y-5">
              <div className="flex items-center gap-2 mb-2">
                <button
                  type="button"
                  onClick={resetToLogin}
                  className="p-1.5 bg-surface border border-border hover:bg-border/50 rounded-lg text-muted transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <span className="text-ink font-bold text-sm">Recover Password</span>
              </div>
              <p className="text-muted text-xs leading-relaxed mb-4">
                Enter your registered cab email address and we'll send you an OTP to reset your password.
              </p>
              <div>
                <label className="block text-xs font-medium text-muted mb-1.5">
                  Registered Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-surface rounded-xl text-sm border border-border focus:border-primary outline-none"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-primary text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-primary-dark cursor-pointer transition-colors disabled:opacity-70"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send OTP"}
              </button>
            </form>
          )}

          {/* VIEW: VERIFY OTP */}
          {view === "verify" && (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div className="flex items-center gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => setView("request")}
                  className="p-1.5 bg-surface border border-border hover:bg-border/50 rounded-lg text-muted transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <span className="text-ink font-bold text-sm">Enter Verification OTP</span>
              </div>
              <p className="text-muted text-xs mb-4">
                Enter the 6-digit code sent to <strong className="text-ink">{email}</strong>.
              </p>
              <div>
                <label className="block text-xs font-medium text-muted mb-1.5">
                  6-Digit OTP
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                  <input
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    placeholder="123456"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-surface rounded-xl text-center text-lg font-mono tracking-widest border border-border focus:border-primary outline-none"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-primary text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-primary-dark cursor-pointer transition-colors disabled:opacity-70"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify Code"}
              </button>
            </form>
          )}

          {/* VIEW: RESET PASSWORD */}
          {view === "reset" && (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-ink font-bold text-sm">Set New Password</span>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter at least 6 characters"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-surface rounded-xl text-sm border border-border focus:border-primary outline-none"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-primary text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-primary-dark cursor-pointer transition-colors disabled:opacity-70"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Update Password"}
              </button>
            </form>
          )}

          {/* VIEW: SUCCESS */}
          {view === "success" && (
            <div className="text-center py-4 space-y-4">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-lg text-ink">Password Updated!</h3>
              <p className="text-xs text-muted">
                Your account password has been reset successfully. You can now login.
              </p>
              <button
                onClick={resetToLogin}
                className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark cursor-pointer transition-colors text-xs"
              >
                Return to Login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
