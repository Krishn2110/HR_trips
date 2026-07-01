"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { adminLoginSchema, type AdminLoginFormData } from "@/lib/validators";
import { Mail, Lock, Loader2, ArrowLeft, KeyRound, CheckCircle2 } from "lucide-react";
import Link from "next/link";

type ViewState = "login" | "request" | "verify" | "reset" | "success";

export default function AdminLoginPage() {
  const router = useRouter();
  
  // View State Manager
  const [view, setView] = useState<ViewState>("login");
  
  // Form Data States
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  
  // UI States
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AdminLoginFormData>({
    resolver: zodResolver(adminLoginSchema),
  });

  // 1. LOGIN API
  const onLoginSubmit = async (data: AdminLoginFormData) => {
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json();

      if (response.ok && result.status === "success") {
        sessionStorage.setItem("isAdminLoggedIn", "true");
        sessionStorage.setItem("adminData", JSON.stringify(result.data));
        router.push("/admin");
      } else {
        setError(result.message || "Invalid admin email or password");
      }
    } catch (err) {
      setError("Network error. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  // 2. REQUEST OTP API
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/forgot_password.php`, {
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
    } catch (err) {
      setError("Network error. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  // 3. VERIFY OTP API
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (otp.length !== 6) {
      setError("Please enter the 6-digit OTP");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify_otp.php`, {
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
    } catch (err) {
      setError("Network error. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  // 4. RESET PASSWORD API
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/reset_password.php`, {
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
    } catch (err) {
      setError("Network error. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to reset states when going back
  const resetToLogin = () => {
    setView("login");
    setError("");
    setEmail("");
    setOtp("");
    setNewPassword("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0d0d0f] relative overflow-hidden px-4">
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[140px] translate-x-1/3 translate-y-1/3" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/[0.04] rounded-2xl shadow-xl border border-white/10 mb-4 animate-float overflow-hidden">
            <img src="/logo.png" alt="HR Trips Logo" className="w-16 h-16 object-contain" />
          </div>
          <h1 className="font-heading font-black text-3xl text-white tracking-tight">
            HR Trips Admin
          </h1>
          <p className="text-white/40 text-xs mt-1">
            Sign in to manage travel packages & bookings
          </p>
        </div>

        <div className="bg-white/[0.03] backdrop-blur-md rounded-3xl border border-white/[0.08] p-8 shadow-2xl">
          {error && (
            <div className="mb-5 p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-medium text-center">
              {error}
            </div>
          )}

          {/* VIEW: LOGIN */}
          {view === "login" && (
            <form onSubmit={handleSubmit(onLoginSubmit)} className="space-y-5">
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-white/50 mb-2">
                  Admin Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    {...register("email")}
                    type="email"
                    placeholder="admin@hrtrips.com"
                    className="w-full pl-11 pr-4 py-3.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white placeholder:text-white/20 focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all outline-none"
                  />
                </div>
                {errors.email && <p className="text-red-400 text-xs mt-1.5">{errors.email.message}</p>}
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-white/50">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => { setView("request"); setError(""); }}
                    className="text-primary text-[11px] font-semibold hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    {...register("password")}
                    type="password"
                    placeholder="••••••••"
                    className="w-full pl-11 pr-4 py-3.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white placeholder:text-white/20 focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all outline-none"
                  />
                </div>
                {errors.password && <p className="text-red-400 text-xs mt-1.5">{errors.password.message}</p>}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-gradient-to-r from-primary to-primary-dark text-white font-semibold rounded-xl flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-primary/25 active:scale-[0.98] transition-all disabled:opacity-60 cursor-pointer"
              >
                {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Authenticating...</> : "Sign In to Dashboard"}
              </button>
            </form>
          )}

          {/* VIEW: REQUEST OTP */}
          {view === "request" && (
            <form onSubmit={handleRequestOtp} className="space-y-5">
              <div className="flex items-center gap-2 mb-2">
                <button type="button" onClick={resetToLogin} className="p-1.5 bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] rounded-lg text-white/60 transition-colors">
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <span className="text-white font-semibold text-sm">Recover Password</span>
              </div>
              <p className="text-white/40 text-xs leading-relaxed mb-4">
                Enter your admin email address and we'll send you an OTP to reset your password.
              </p>
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-white/50 mb-2">Admin Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@hrtrips.com"
                    className="w-full pl-11 pr-4 py-3.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white focus:border-primary transition-all outline-none"
                  />
                </div>
              </div>
              <button type="submit" disabled={isLoading} className="w-full py-4 bg-gradient-to-r from-primary to-primary-dark text-white font-semibold rounded-xl flex justify-center gap-2 disabled:opacity-60 cursor-pointer">
                {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</> : "Send OTP"}
              </button>
            </form>
          )}

          {/* VIEW: VERIFY OTP */}
          {view === "verify" && (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div className="flex items-center gap-2 mb-2">
                <button type="button" onClick={() => {setView("request"); setError("");}} className="p-1.5 bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] rounded-lg text-white/60 transition-colors">
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <span className="text-white font-semibold text-sm">Enter OTP</span>
              </div>
              <p className="text-white/40 text-xs leading-relaxed mb-4">
                We sent a 6-digit code to <strong className="text-white/70">{email}</strong>.
              </p>
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-white/50 mb-2">6-Digit OTP</label>
                <div className="relative">
                  <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="w-full pl-11 pr-4 py-3.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white tracking-[0.5em] focus:border-primary transition-all outline-none"
                  />
                </div>
              </div>
              <button type="submit" disabled={isLoading} className="w-full py-4 bg-gradient-to-r from-primary to-primary-dark text-white font-semibold rounded-xl flex justify-center gap-2 disabled:opacity-60 cursor-pointer">
                {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Verifying...</> : "Verify OTP"}
              </button>
            </form>
          )}

          {/* VIEW: RESET PASSWORD */}
          {view === "reset" && (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <div className="mb-2">
                <span className="text-white font-semibold text-sm">Create New Password</span>
              </div>
              <p className="text-white/40 text-xs leading-relaxed mb-4">
                Your OTP was verified. Please enter a new strong password.
              </p>
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-white/50 mb-2">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-4 py-3.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white focus:border-primary transition-all outline-none"
                  />
                </div>
              </div>
              <button type="submit" disabled={isLoading} className="w-full py-4 bg-gradient-to-r from-primary to-primary-dark text-white font-semibold rounded-xl flex justify-center gap-2 disabled:opacity-60 cursor-pointer">
                {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Updating...</> : "Update Password"}
              </button>
            </form>
          )}

          {/* VIEW: SUCCESS */}
          {view === "success" && (
            <div className="text-center py-6">
              <div className="w-12 h-12 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="font-heading font-semibold text-white text-lg mb-2">
                Password Reset Complete
              </h3>
              <p className="text-white/40 text-xs leading-relaxed mb-6">
                Your password has been successfully updated. You can now sign in with your new credentials.
              </p>
              <button
                type="button"
                onClick={resetToLogin}
                className="w-full py-4 bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-white font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Return to Login
              </button>
            </div>
          )}
        </div>

        <div className="text-center mt-6">
          <Link href="/" className="text-xs text-white/30 hover:text-white/60 transition-colors">
            ← Return to public website
          </Link>
        </div>
      </div>
    </div>
  );
}