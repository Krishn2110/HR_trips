"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, Loader2, ArrowLeft, X, KeyRound, CheckCircle2 } from "lucide-react";

export default function BanquetOwnerLoginPage() {
  const router = useRouter();

  // Login Form Data
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Forgot Password States
  const [fpStep, setFpStep] = useState<0 | 1 | 2 | 3>(0); // 0: Hidden, 1: Email, 2: OTP, 3: New Password
  const [fpEmail, setFpEmail] = useState("");
  const [fpOtp, setFpOtp] = useState("");
  const [fpNewPassword, setFpNewPassword] = useState("");
  const [fpConfirmPassword, setFpConfirmPassword] = useState("");
  const [fpLoading, setFpLoading] = useState(false);
  const [fpError, setFpError] = useState("");
  const [fpSuccess, setFpSuccess] = useState("");

  // Safe JSON parser helper
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

  const getApiUrl = (endpoint: string) => {
    const base = (process.env.NEXT_PUBLIC_API_URL || "http://localhost/hrtrips/api").replace(/\/+$/, "");
    return `${base}/${endpoint.replace(/^\/+/, "")}`;
  };

  // --- API: LOGIN ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(getApiUrl("banquets/auth/login.php"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const result = await parseResponse(response);

      if (response.ok && result.status === "success") {
        sessionStorage.setItem("banquetOwnerLoggedIn", "true");
        sessionStorage.setItem("banquetOwnerEmail", email.trim());
        if (result.data?.banquet_id) {
          sessionStorage.setItem("banquetOwnerId", String(result.data.banquet_id));
        }
        router.push("/banquet-owner");
      } else {
        throw new Error(result.message || "Invalid credentials.");
      }
    } catch (err: any) {
      setError(err?.message || "Login failed. Please verify your credentials and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- API: FORGOT PASSWORD (SEND OTP) ---
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setFpLoading(true);
    setFpError("");
    setFpSuccess("");

    try {
      const response = await fetch(getApiUrl("banquets/auth/forgot_password.php"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: fpEmail.trim() }),
      });
      const result = await parseResponse(response);

      if (response.ok && result.status === "success") {
        setFpSuccess("OTP sent to your email successfully.");
        setTimeout(() => {
          setFpSuccess("");
          setFpStep(2); // Move to OTP input
        }, 2000);
      } else {
        throw new Error(result.message || "Failed to send OTP.");
      }
    } catch (err: any) {
      setFpError(err?.message || "Something went wrong.");
    } finally {
      setFpLoading(false);
    }
  };

  // --- API: VERIFY OTP ---
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setFpLoading(true);
    setFpError("");

    try {
      const response = await fetch(getApiUrl("banquets/auth/verify_otp.php"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: fpEmail.trim(), otp: fpOtp.trim() }),
      });
      const result = await parseResponse(response);

      if (response.ok && result.status === "success") {
        setFpStep(3); // Move to New Password input
      } else {
        throw new Error(result.message || "Invalid OTP.");
      }
    } catch (err: any) {
      setFpError(err?.message || "Invalid OTP.");
    } finally {
      setFpLoading(false);
    }
  };

  // --- API: RESET PASSWORD ---
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (fpNewPassword !== fpConfirmPassword) {
      setFpError("Passwords do not match.");
      return;
    }
    if (fpNewPassword.length < 6) {
      setFpError("Password must be at least 6 characters.");
      return;
    }

    setFpLoading(true);
    setFpError("");

    try {
      const response = await fetch(getApiUrl("banquets/auth/reset_password.php"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: fpEmail.trim(), 
          otp: fpOtp.trim(),
          new_password: fpNewPassword 
        }),
      });
      const result = await parseResponse(response);

      if (response.ok && result.status === "success") {
        setFpSuccess("Password updated successfully!");
        setTimeout(() => {
          // Reset modal and fill login email
          setFpStep(0);
          setEmail(fpEmail.trim());
          setPassword("");
        }, 2000);
      } else {
        throw new Error(result.message || "Failed to reset password.");
      }
    } catch (err: any) {
      setFpError(err?.message || "Failed to reset password.");
    } finally {
      setFpLoading(false);
    }
  };

  // Modal close handler
  const closeFpModal = () => {
    setFpStep(0);
    setFpEmail("");
    setFpOtp("");
    setFpNewPassword("");
    setFpConfirmPassword("");
    setFpError("");
    setFpSuccess("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface via-white to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        
        {/* Back Link */}
        <Link href="/banquet-booking" className="inline-flex items-center gap-1.5 text-muted text-xs font-medium hover:text-ink transition-colors mb-8">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Banquet Booking
        </Link>

        {/* Login Card */}
        <div className="bg-white rounded-2xl border border-border/50 shadow-xl shadow-black/5 p-8">
          <div className="text-center mb-8">
            <img src="/logo.png" alt="HR Trips Logo" className="w-16 h-16 object-contain rounded-2xl mx-auto mb-4 shadow-lg bg-white p-1 border border-border/40" />
            <h1 className="font-heading font-black text-2xl text-ink">Banquet Owner Portal</h1>
            <p className="text-muted text-sm mt-1">Login to check venue verification status & manage event bookings</p>
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
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs text-muted font-medium">Password</label>
                {/* FORGOT PASSWORD TRIGGER */}
                <button type="button" onClick={() => setFpStep(1)} className="text-[11px] font-bold text-primary hover:underline outline-none cursor-pointer">
                  Forgot Password?
                </button>
              </div>
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
              {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Logging in...</> : "Log In to Portal"}
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

      {/* ================= FORGOT PASSWORD MODAL ================= */}
      {fpStep > 0 && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl relative">
            <button onClick={closeFpModal} className="absolute top-4 right-4 p-1.5 text-muted hover:bg-surface rounded-lg transition-colors cursor-pointer">
              <X className="w-4 h-4" />
            </button>

            {/* Error / Success Alerts */}
            {fpError && <div className="mb-4 bg-red-50 border border-red-200 text-red-600 p-2.5 rounded-lg text-xs font-semibold text-center">{fpError}</div>}
            {fpSuccess && <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-600 p-2.5 rounded-lg text-xs font-semibold text-center flex items-center justify-center gap-1.5"><CheckCircle2 className="w-4 h-4"/>{fpSuccess}</div>}

            {/* STEP 1: Enter Email */}
            {fpStep === 1 && (
              <form onSubmit={handleSendOtp} className="space-y-4 pt-2">
                <div className="text-center mb-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <KeyRound className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-heading font-bold text-lg text-ink">Reset Password</h3>
                  <p className="text-xs text-muted mt-1">Enter your registered email address to receive a secure OTP.</p>
                </div>
                <div>
                  <input type="email" required placeholder="Email Address" value={fpEmail} onChange={e => setFpEmail(e.target.value)} className="w-full px-4 py-3 bg-surface rounded-xl text-sm border border-border focus:border-primary outline-none" />
                </div>
                <button type="submit" disabled={fpLoading} className="w-full py-3 bg-primary text-white font-bold rounded-xl text-xs flex justify-center items-center cursor-pointer disabled:opacity-70">
                  {fpLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send OTP"}
                </button>
              </form>
            )}

            {/* STEP 2: Enter OTP */}
            {fpStep === 2 && (
              <form onSubmit={handleVerifyOtp} className="space-y-4 pt-2">
                <div className="text-center mb-6">
                  <h3 className="font-heading font-bold text-lg text-ink">Enter OTP</h3>
                  <p className="text-xs text-muted mt-1">We sent a 6-digit code to <br/><strong className="text-ink">{fpEmail}</strong></p>
                </div>
                <div>
                  <input type="text" required placeholder="Enter 6-digit OTP" maxLength={6} value={fpOtp} onChange={e => setFpOtp(e.target.value)} className="w-full px-4 py-3 bg-surface rounded-xl text-center tracking-[0.5em] text-lg font-bold border border-border focus:border-primary outline-none" />
                </div>
                <button type="submit" disabled={fpLoading || fpOtp.length !== 6} className="w-full py-3 bg-primary text-white font-bold rounded-xl text-xs flex justify-center items-center cursor-pointer disabled:opacity-70">
                  {fpLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify OTP"}
                </button>
              </form>
            )}

            {/* STEP 3: New Password */}
            {fpStep === 3 && (
              <form onSubmit={handleResetPassword} className="space-y-4 pt-2">
                <div className="text-center mb-6">
                  <h3 className="font-heading font-bold text-lg text-ink">Create New Password</h3>
                  <p className="text-xs text-muted mt-1">Your password must be at least 6 characters long.</p>
                </div>
                <div>
                  <input type="password" required placeholder="New Password" value={fpNewPassword} onChange={e => setFpNewPassword(e.target.value)} className="w-full px-4 py-3 mb-3 bg-surface rounded-xl text-sm border border-border focus:border-primary outline-none" />
                  <input type="password" required placeholder="Confirm New Password" value={fpConfirmPassword} onChange={e => setFpConfirmPassword(e.target.value)} className="w-full px-4 py-3 bg-surface rounded-xl text-sm border border-border focus:border-primary outline-none" />
                </div>
                <button type="submit" disabled={fpLoading} className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex justify-center items-center cursor-pointer disabled:opacity-70 transition-colors">
                  {fpLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Reset & Update Password"}
                </button>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}