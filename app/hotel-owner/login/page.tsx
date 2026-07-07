"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, Loader2, Hotel, ArrowLeft } from "lucide-react";
import { getHotelRegistrationByEmail } from "@/lib/api";

export default function HotelOwnerLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const reg = await getHotelRegistrationByEmail(email);

      if (!reg) {
        setError("No hotel registration found with this email.");
        setIsLoading(false);
        return;
      }

      if (reg.password !== password) {
        setError("Invalid password. Please try again.");
        setIsLoading(false);
        return;
      }

      // Save session
      sessionStorage.setItem("hotelOwnerLoggedIn", "true");
      sessionStorage.setItem("hotelOwnerEmail", reg.email);
      sessionStorage.setItem("hotelOwnerId", reg.id);

      router.push("/hotel-owner");
    } catch {
      setError("Something went wrong. Please try again.");
      setIsLoading(false);
    }
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

        {/* Login Card */}
        <div className="bg-white rounded-2xl border border-border/50 shadow-xl shadow-black/5 p-8">
          {/* Header */}
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

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs text-muted mb-1.5 font-medium">
                Email Address
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
              <label className="block text-xs text-muted mb-1.5 font-medium">
                Password
              </label>
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

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-xs text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-gradient-to-r from-primary to-primary-dark text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-primary/25 active:scale-[0.99] transition-all disabled:opacity-70 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                "Login to Dashboard"
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-muted text-xs">
              Don&apos;t have an account?{" "}
              <Link
                href="/hotel-registration"
                className="text-primary font-semibold hover:underline"
              >
                Register your hotel
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
