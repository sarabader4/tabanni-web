import { useState } from "react";
import { Link } from "wouter";
import { Loader2, CheckCircle } from "lucide-react";
import halfLogo from "@assets/half_logo_1776716170746.PNG";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const inputCls = `w-full border rounded-lg px-3.5 py-2.5 text-sm text-[#333E48] placeholder:text-gray-400 outline-none focus:ring-2 transition-all border-gray-200 focus:ring-[#FA8D29]/30 focus:border-[#FA8D29]`;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }
    setIsLoading(true);
    try {
      const base = import.meta.env.BASE_URL.replace(/\/$/, "");
      const res = await fetch(`${base}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message ?? "Something went wrong");
      } else {
        setSuccess(true);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
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
          <h1 className="text-xl font-bold text-[#333E48] mb-2">Forgot Password?</h1>
          <p className="text-sm text-gray-500 mb-6">Enter your email and we'll send you a reset link.</p>

          {success ? (
            <div className="text-center py-6">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <p className="font-semibold text-green-600">Check your email!</p>
              <p className="text-sm text-gray-500 mt-1">If an account exists, a reset link has been sent.</p>
              <Link href="/login" className="text-[#FA8D29] font-semibold text-sm mt-4 block hover:underline">
                Back to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg border border-red-100">{error}</div>
              )}
              <div>
                <label className="block text-sm font-medium text-[#333E48] mb-1.5">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className={inputCls}
                  disabled={isLoading}
                  autoComplete="email"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 bg-[#FA8D29] text-white font-bold text-sm rounded-lg hover:bg-[#FA8D29]/90 disabled:opacity-60 transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</> : "Send Reset Link"}
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