"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, Loader2, Hotel, ArrowLeft, KeyRound, CheckCircle2 } from "lucide-react";

type ViewState = "login" | "request" | "verify" | "reset" | "success";

export default function HotelOwnerLoginPage() {
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/hotels/auth/login.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const result = await response.json();

      if (response.ok && result.status === "success") {
        sessionStorage.setItem("hotelOwnerLoggedIn", "true");
        sessionStorage.setItem("hotelOwnerEmail", result.data.email);
        sessionStorage.setItem("hotelOwnerId", result.data.id);
        
        // Optional: you can store hotel status to show pending messages in the dashboard
        sessionStorage.setItem("hotelStatus", result.data.status);

        router.push("/hotel-owner");
      } else {
        setError(result.message || "Invalid email or password");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/hotels/auth/forgot_password.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const result = await response.json();

      if (response.ok && result.status === "success") {
        setView("verify");
      } else {
        setError(result.message || "Failed to process request.");
      }
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/hotels/auth/verify_otp.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const result = await response.json();

      if (response.ok && result.status === "success") {
        setView("reset");
      } else {
        setError(result.message || "Invalid or expired OTP.");
      }
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/hotels/auth/reset_password.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, new_password: newPassword }),
      });
      const result = await response.json();

      if (response.ok && result.status === "success") {
        setView("success");
      } else {
        setError(result.message || "Failed to reset password.");
      }
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
          href="/hotel-booking"
          className="inline-flex items-center gap-1.5 text-muted text-xs font-medium hover:text-ink transition-colors mb-8"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Hotel Booking
        </Link>

        {/* Auth Card */}
        <div className="bg-white rounded-2xl border border-border/50 shadow-xl shadow-black/5 p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/20">
              <Hotel className="w-8 h-8 text-white" />
            </div>
            <h1 className="font-heading font-black text-2xl text-ink">
              Hotel Owner Portal
            </h1>
            <p className="text-muted text-sm mt-1">
              Login to manage your hotel listing
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
                <label className="block text-xs text-muted mb-1.5 font-medium">Email Address</label>
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
                  <label className="block text-xs text-muted font-medium">Password</label>
                  <button
                    type="button"
                    onClick={() => { setView("request"); setError(""); }}
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
                    placeholder="Enter your password"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-surface rounded-xl text-sm text-ink border border-border focus:border-primary transition-colors outline-none"
                  />
                </div>
              </div>

              <button type="submit" disabled={isLoading} className="w-full py-3.5 bg-gradient-to-r from-primary to-primary-dark text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-primary/25 active:scale-[0.99] transition-all disabled:opacity-70 cursor-pointer">
                {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Logging in...</> : "Login to Dashboard"}
              </button>

              <div className="mt-6 text-center">
                <p className="text-muted text-xs">
                  Don&apos;t have an account?{" "}
                  <Link href="/hotel-registration" className="text-primary font-semibold hover:underline">
                    Register your hotel
                  </Link>
                </p>
              </div>
            </form>
          )}

          {/* VIEW: REQUEST OTP */}
          {view === "request" && (
            <form onSubmit={handleRequestOtp} className="space-y-5">
              <div className="flex items-center gap-2 mb-2">
                <button type="button" onClick={resetToLogin} className="p-1.5 bg-surface border border-border hover:bg-border/50 rounded-lg text-muted transition-colors cursor-pointer">
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <span className="text-ink font-bold text-sm">Recover Password</span>
              </div>
              <p className="text-muted text-xs leading-relaxed mb-4">
                Enter your registered hotel email address and we'll send you an OTP to reset your password.
              </p>
              <div>
                <label className="block text-xs font-medium text-muted mb-1.5">Registered Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="owner@hotel.com"
                    className="w-full pl-10 pr-4 py-3 bg-surface rounded-xl text-sm text-ink border border-border focus:border-primary transition-colors outline-none"
                  />
                </div>
              </div>
              <button type="submit" disabled={isLoading} className="w-full py-3.5 bg-gradient-to-r from-primary to-primary-dark text-white font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer">
                {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</> : "Send OTP"}
              </button>
            </form>
          )}

          {/* VIEW: VERIFY OTP */}
          {view === "verify" && (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div className="flex items-center gap-2 mb-2">
                <button type="button" onClick={() => {setView("request"); setError("");}} className="p-1.5 bg-surface border border-border hover:bg-border/50 rounded-lg text-muted transition-colors cursor-pointer">
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <span className="text-ink font-bold text-sm">Enter OTP</span>
              </div>
              <p className="text-muted text-xs leading-relaxed mb-4">
                We sent a 6-digit code to <strong className="text-ink">{email}</strong>.
              </p>
              <div>
                <label className="block text-xs font-medium text-muted mb-1.5">6-Digit Code</label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  className="w-full px-4 py-3 bg-surface rounded-xl text-center text-lg tracking-[0.5em] font-bold text-ink border border-border focus:border-primary transition-colors outline-none"
                />
              </div>
              <button type="submit" disabled={isLoading} className="w-full py-3.5 bg-gradient-to-r from-primary to-primary-dark text-white font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer">
                {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Verifying...</> : "Verify OTP"}
              </button>
            </form>
          )}

          {/* VIEW: RESET PASSWORD */}
          {view === "reset" && (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <div className="mb-2">
                <span className="text-ink font-bold text-sm">Create New Password</span>
              </div>
              <p className="text-muted text-xs leading-relaxed mb-4">
                Your identity has been verified. Please enter a new strong password.
              </p>
              <div>
                <label className="block text-xs font-medium text-muted mb-1.5">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 bg-surface rounded-xl text-sm text-ink border border-border focus:border-primary transition-colors outline-none"
                  />
                </div>
              </div>
              <button type="submit" disabled={isLoading} className="w-full py-3.5 bg-gradient-to-r from-primary to-primary-dark text-white font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer">
                {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Updating...</> : "Update Password"}
              </button>
            </form>
          )}

          {/* VIEW: SUCCESS */}
          {view === "success" && (
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              </div>
              <h3 className="font-heading font-bold text-ink text-lg mb-2">
                Password Reset Complete
              </h3>
              <p className="text-muted text-xs leading-relaxed mb-6">
                Your password has been successfully updated. You can now sign in to your dashboard.
              </p>
              <button
                type="button"
                onClick={resetToLogin}
                className="w-full py-3.5 border border-border hover:bg-surface text-ink font-bold rounded-xl transition-colors cursor-pointer"
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