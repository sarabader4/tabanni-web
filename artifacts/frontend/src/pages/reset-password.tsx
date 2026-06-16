import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Eye, EyeOff, Loader2, CheckCircle } from "lucide-react";
import halfLogo from "@assets/half_logo_1776716170746.PNG";

export default function ResetPassword() {
  const [, navigate] = useLocation();
  const token = new URLSearchParams(window.location.search).get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const inputCls = (hasError?: boolean) =>
    `w-full border rounded-lg px-3.5 py-2.5 text-sm text-[#333E48] placeholder:text-gray-400 outline-none focus:ring-2 transition-all ${
      hasError ? "border-red-400 focus:ring-red-200" : "border-gray-200 focus:ring-[#FA8D29]/30 focus:border-[#FA8D29]"
    }`;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 6 || !/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/[0-9]/.test(password) || !/[^a-zA-Z0-9]/.test(password)) {
      setError("Password must contain uppercase, lowercase, number, and symbol");
      return;
    }
    setIsLoading(true);
    try {
      const base = import.meta.env.BASE_URL.replace(/\/$/, "");
      const res = await fetch(`${base}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message ?? "Failed to reset password");
      } else {
        setSuccess(true);
        setTimeout(() => navigate("/login"), 3000);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-[#FFFAF7] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-md w-full text-center">
          <p className="text-red-500 font-semibold">Invalid reset link.</p>
          <Link href="/login" className="text-[#FA8D29] font-semibold mt-4 block">Back to Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFAF7] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block group">
            <img src={halfLogo} alt="tabanni" className="h-20 w-auto mx-auto group-hover:scale-105 transition-transform" />
          </Link>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h1 className="text-xl font-bold text-[#333E48] mb-2">Reset Password</h1>
          <p className="text-sm text-gray-500 mb-6">Enter your new password below.</p>

          {success ? (
            <div className="text-center py-6">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <p className="font-semibold text-green-600">Password reset successfully!</p>
              <p className="text-sm text-gray-500 mt-1">Redirecting to login...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg border border-red-100">{error}</div>
              )}
              <div>
                <label className="block text-sm font-medium text-[#333E48] mb-1.5">New Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    className={inputCls()}
                    disabled={isLoading}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute end-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#333E48] mb-1.5">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat password"
                  className={inputCls()}
                  disabled={isLoading}
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 bg-[#FA8D29] text-white font-bold text-sm rounded-lg hover:bg-[#FA8D29]/90 disabled:opacity-60 transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Resetting...</> : "Reset Password"}
              </button>
              <p className="text-center text-sm text-gray-500">
                <Link href="/login" className="text-[#FA8D29] font-semibold hover:underline">Back to Login</Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}