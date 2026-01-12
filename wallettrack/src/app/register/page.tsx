"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Check,
  ArrowLeft,
  Shield,
  Sparkles,
  TrendingUp,
  Wallet,
  UserPlus,
} from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);

  const passwordRequirements = [
    { id: 1, text: "At least 8 characters", met: password.length >= 8 },
    { id: 2, text: "Contains a number", met: /\d/.test(password) },
    { id: 3, text: "Contains uppercase letter", met: /[A-Z]/.test(password) },
    { id: 4, text: "Contains lowercase letter", met: /[a-z]/.test(password) },
    {
      id: 5,
      text: "Contains special character",
      met: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    },
  ];

  const isPasswordValid = passwordRequirements.every((req) => req.met);
  const passwordsMatch =
    password === confirmPassword && confirmPassword.length > 0;

  async function register() {
    if (!isPasswordValid) {
      setError("Password does not meet requirements");
      return;
    }

    if (!passwordsMatch) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      if (res.ok) {
        router.push("/login?registered=true");
      } else {
        const data = await res.json();
        setError(data.message || "Registration failed");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const benefits = [
    { icon: Wallet, text: "Track all your finances in one place" },
    { icon: TrendingUp, text: "Achieve your financial goals faster" },
    { icon: Shield, text: "Bank-level security & encryption" },
    { icon: Sparkles, text: "Personalized financial insights" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* Left Column - Benefits (Lighter theme) */}
        <div className="lg:w-1/2 bg-gradient-to-br from-emerald-50 to-teal-50 p-8 lg:p-12">
          <div className="max-w-md mx-auto h-full flex flex-col justify-center">
            <div className="mb-6">
              <Link
                href="/"
                className="inline-flex items-center text-emerald-700 hover:text-emerald-800 transition-colors mb-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to home
              </Link>

              <div className="flex items-center space-x-3 mb-4">
                <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-md">
                  <Wallet className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-800">
                    WalletTrack
                  </h1>
                  <p className="text-emerald-700 font-medium">
                    Start Your Financial Journey
                  </p>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-800 mb-3">
                Join Thousands Managing Their Finances Smarter
              </h2>
              <p className="text-emerald-800 mb-6">
                Create your free account and take the first step towards
                financial freedom.
              </p>
            </div>

            <div className="space-y-4 mb-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="p-2 bg-white/80 backdrop-blur-sm rounded-lg shadow-sm">
                    <benefit.icon className="w-5 h-5 text-emerald-600" />
                  </div>
                  <span className="text-gray-700 font-medium">
                    {benefit.text}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-auto pt-6 border-t border-emerald-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/80 backdrop-blur-sm rounded-lg shadow-sm">
                  <Shield className="w-5 h-5 text-emerald-600" />
                </div>
                <p className="text-emerald-700 text-sm">
                  Your data is encrypted and secure. We never share your
                  personal information.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Registration Form */}
        <div className="lg:w-1/2 p-8 lg:p-12 flex items-center justify-center bg-white">
          <div className="max-w-md w-full">
            <div className="lg:hidden mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg shadow-md">
                  <Wallet className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    WalletTrack
                  </h1>
                  <p className="text-emerald-600 text-sm font-medium">
                    Start Your Journey
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Create Your Account
              </h2>
              <p className="text-gray-600">
                Join WalletTrack and take control of your finances
              </p>
            </div>

            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                register();
              }}
            >
              {/* Name Field */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent placeholder-gray-500 bg-white shadow-sm"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>

              {/* Email Field */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent placeholder-gray-500 bg-white shadow-sm"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent placeholder-gray-500 bg-white shadow-sm"
                    placeholder="Create a strong password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
              </div>

              {/* Password Requirements */}
              {password.length > 0 && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 shadow-sm">
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    Password Requirements
                  </p>
                  <div className="space-y-1">
                    {passwordRequirements.map((req) => (
                      <div key={req.id} className="flex items-center">
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center mr-2 ${
                            req.met ? "bg-emerald-100" : "bg-gray-200"
                          }`}
                        >
                          {req.met ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : null}
                        </div>
                        <span
                          className={`text-sm ${
                            req.met ? "text-emerald-600" : "text-gray-500"
                          }`}
                        >
                          {req.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Confirm Password Field */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    className={`block w-full pl-10 pr-10 py-2.5 border ${
                      confirmPassword.length > 0
                        ? passwordsMatch
                          ? "border-emerald-300 focus:ring-emerald-400"
                          : "border-red-300 focus:ring-red-400"
                        : "border-gray-300 focus:ring-emerald-400"
                    } rounded-xl focus:outline-none focus:ring-2 focus:border-transparent placeholder-gray-500 bg-white shadow-sm`}
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center space-x-2">
                    {confirmPassword.length > 0 && (
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center ${
                          passwordsMatch ? "bg-emerald-100" : "bg-red-100"
                        }`}
                      >
                        {passwordsMatch ? (
                          <Check className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-red-500"></div>
                        )}
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="rounded-xl bg-red-50 border border-red-200 p-3 shadow-sm">
                  <div className="flex items-center">
                    <Shield className="h-5 w-5 text-red-500 mr-2" />
                    <span className="text-sm text-red-700 font-medium">
                      {error}
                    </span>
                  </div>
                </div>
              )}

              {/* Register Button */}
              <button
                type="submit"
                disabled={loading || !isPasswordValid || !passwordsMatch}
                className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-xl font-medium text-white bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-md hover:shadow-lg"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Creating Account...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-5 h-5 mr-2" />
                    Create Account
                  </>
                )}
              </button>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">
                    Already have an account?
                  </span>
                </div>
              </div>

              {/* Login Link */}
              <div className="text-center pt-1">
                <Link
                  href="/login"
                  className="inline-flex items-center text-sm text-gray-700 hover:text-gray-900 font-medium"
                >
                  Sign in to your account
                </Link>
              </div>
            </form>

            {/* Mobile Back Link */}
            <div className="mt-6 text-center lg:hidden">
              <Link
                href="/"
                className="inline-flex items-center text-sm text-emerald-600 hover:text-emerald-800 font-medium"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
