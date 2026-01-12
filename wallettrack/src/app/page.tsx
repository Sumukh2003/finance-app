"use client";
import Link from "next/link";
import {
  TrendingUp,
  Target,
  PieChart,
  Wallet,
  Shield,
  Sparkles,
  ArrowRight,
  CheckCircle,
  CreditCard,
  BarChart3,
  Calendar,
  Download,
  Smartphone,
  Eye,
  Users,
  Globe,
  Zap,
  Bell,
  TrendingDown,
  Menu,
} from "lucide-react";
import { useState } from "react";

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const features = [
    {
      icon: CreditCard,
      title: "Smart Expense Tracking",
      description:
        "Automatically categorize and track every transaction with intelligent AI-powered categorization.",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      icon: Target,
      title: "Goal-Oriented Budgeting",
      description:
        "Set financial goals and create budgets that help you achieve them faster.",
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
    },
    {
      icon: PieChart,
      title: "Visual Analytics",
      description:
        "Beautiful charts and insights that make understanding your finances simple.",
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
    },
  ];

  const stats = [
    {
      value: "50K+",
      label: "Active Users",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      value: "₹10M+",
      label: "Tracked Monthly",
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      value: "98%",
      label: "Satisfaction Rate",
      icon: Sparkles,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      value: "24/7",
      label: "Support Available",
      icon: Globe,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ];

  const testimonials = [
    {
      quote:
        "WalletTrack helped me save 30% more every month. The insights are game-changing!",
      author: "Sarah M.",
      role: "Software Engineer",
      color: "bg-blue-50",
      borderColor: "border-blue-100",
    },
    {
      quote:
        "Finally, a budgeting app that actually works and looks beautiful doing it.",
      author: "Raj K.",
      role: "Freelance Designer",
      color: "bg-green-50",
      borderColor: "border-green-100",
    },
    {
      quote:
        "The expense tracking features are incredibly accurate and easy to use.",
      author: "Michael T.",
      role: "Business Owner",
      color: "bg-purple-50",
      borderColor: "border-purple-100",
    },
  ];

  const additionalFeatures = [
    {
      icon: Smartphone,
      text: "Mobile App",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      icon: Calendar,
      text: "Monthly Reports",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      icon: Download,
      text: "Export Data",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      icon: Shield,
      text: "Bank-Level Security",
      color: "text-gray-600",
      bgColor: "bg-gray-50",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 relative">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-lg border-b border-gray-200 fixed w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-sm">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  WalletTrack
                </h1>
                <p className="text-xs text-gray-500">Financial Intelligence</p>
              </div>
            </div>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link
                href="/login"
                className="text-gray-700 hover:text-blue-600 font-medium px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-5 py-2.5 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 font-medium shadow-sm hover:shadow"
              >
                Get Started
                <ArrowRight className="w-4 h-4 ml-2 inline" />
              </Link>
            </nav>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-6 h-6 text-black-600" />
            </button>
          </div>
        </div>
      </header>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Right Sidebar */}
      <aside
        className={`fixed top-0 right-0 h-full bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out w-[70%] ${
          sidebarOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <span className="text-xl font-bold">Menu</span>
          <button onClick={() => setSidebarOpen(false)}>
            <ArrowRight className="w-6 h-6 rotate-180" />
          </button>
        </div>

        {/* Center horizontally */}
        <nav className="flex flex-col items-center p-4 space-y-4">
          <Link
            href="/login"
            onClick={() => setSidebarOpen(false)}
            className="text-gray-700 text-lg font-medium text-center hover:text-blue-600"
          >
            Login
          </Link>

          <Link
            href="/register"
            onClick={() => setSidebarOpen(false)}
            className="w-full max-w-[220px] bg-gradient-to-r from-blue-500 to-blue-600 text-white px-5 py-2 rounded-xl text-center font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-300"
          >
            Get Started
          </Link>
        </nav>
      </aside>

      {/* Hero Section */}
      <main className="pt-12 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 border border-blue-100 mb-6">
              <Sparkles className="w-4 h-4 text-blue-600 mr-2" />
              <span className="text-sm font-medium text-blue-700">
                Trusted by 50,000+ users worldwide
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Take Control of Your
              <span className="block text-blue-600">Personal Finances</span>
            </h1>

            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              Track your income, expenses, and budgets with ease. Get insights
              into your spending habits and achieve your financial goals with
              our intuitive platform.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Link
                href="/register"
                className="group bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl inline-flex items-center"
              >
                Start Tracking Today
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/login"
                className="border-2 border-gray-200 text-gray-700 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-50 transition-all duration-300 hover:border-gray-300 inline-flex items-center"
              >
                Sign In
              </Link>
            </div>

            {/* Dashboard Preview */}
            <div className="mt-16 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-100/20 to-purple-100/20 blur-3xl"></div>
              <div className="relative bg-white rounded-2xl border border-gray-200 shadow-xl p-8 overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Income Card */}
                  <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-2 bg-white rounded-lg">
                        <TrendingUp className="w-5 h-5 text-green-600" />
                      </div>
                      <span className="text-sm font-medium text-green-700">
                        Monthly Income
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      ₹85,400
                    </div>
                    <div className="text-sm text-green-600">
                      +8% from last month
                    </div>
                  </div>

                  {/* Expense Card */}
                  <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-2 bg-white rounded-lg">
                        <TrendingDown className="w-5 h-5 text-red-600" />
                      </div>
                      <span className="text-sm font-medium text-red-700">
                        Monthly Expenses
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      ₹42,800
                    </div>
                    <div className="text-sm text-red-600">
                      -3% from last month
                    </div>
                  </div>

                  {/* Savings Card */}
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-2 bg-white rounded-lg">
                        <Target className="w-5 h-5 text-blue-600" />
                      </div>
                      <span className="text-sm font-medium text-blue-700">
                        Monthly Savings
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      ₹42,600
                    </div>
                    <div className="text-sm text-blue-600">
                      On track for goals
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div
                  className={`inline-flex items-center justify-center w-16 h-16 ${stat.bgColor} rounded-2xl mb-4`}
                >
                  <stat.icon className={`w-7 h-7 ${stat.color}`} />
                </div>
                <div className="text-3xl font-bold text-gray-900">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Features Section */}
          <div className="mt-24">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Powerful Features for
                <span className="block text-blue-600">Financial Success</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Everything you need to take control of your finances
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl border border-gray-200 p-8 hover:border-blue-200 transition-all duration-300 hover:shadow-lg"
                >
                  <div
                    className={`w-12 h-12 ${feature.bgColor} rounded-xl flex items-center justify-center mx-auto mb-6`}
                  >
                    <div
                      className={`bg-gradient-to-br ${feature.color} p-2 rounded-lg`}
                    >
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-center">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Additional Features Grid */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {additionalFeatures.map((feature, index) => (
                <div
                  key={index}
                  className={`${feature.bgColor} rounded-xl p-4 text-center border border-gray-100`}
                >
                  <feature.icon
                    className={`w-5 h-5 ${feature.color} mx-auto mb-2`}
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {feature.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Testimonials */}
          <div className="mt-24">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                What Our Users Say
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Join thousands of satisfied users who transformed their finances
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className={`${testimonial.color} ${testimonial.borderColor} rounded-2xl border p-8 hover:shadow-lg transition-all`}
                >
                  <div className="mb-6">
                    <div className="flex text-yellow-400 mb-4">
                      {"★".repeat(5)}
                    </div>
                    <p className="text-gray-700 italic leading-relaxed">
                      "{testimonial.quote}"
                    </p>
                  </div>
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold">
                        {testimonial.author.charAt(0)}
                      </span>
                    </div>
                    <div className="ml-4">
                      <div className="font-semibold text-gray-900">
                        {testimonial.author}
                      </div>
                      <div className="text-sm text-gray-500">
                        {testimonial.role}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-24 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-3xl p-12 text-center">
            <div className="max-w-3xl mx-auto">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-white border border-blue-100 mb-6">
                <Zap className="w-4 h-4 text-blue-600 mr-2" />
                <span className="text-sm font-medium text-blue-700">
                  Start Your Financial Journey Today
                </span>
              </div>

              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Ready to Transform Your Finances?
              </h2>

              <p className="text-xl text-gray-600 mb-10">
                Join thousands of users who have already taken control of their
                financial future
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
                <Link
                  href="/register"
                  className="group bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-4 rounded-xl text-lg font-bold hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl inline-flex items-center"
                >
                  <Zap className="w-5 h-5 mr-2" />
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/login"
                  className="border-2 border-blue-200 text-blue-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-white transition-all duration-300"
                >
                  Already have an account?
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-b from-white to-gray-50 border-t border-gray-200 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-sm">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">WalletTrack</h3>
                <p className="text-gray-500 text-sm">Financial Intelligence</p>
              </div>
            </div>

            <p className="text-gray-600 max-w-2xl mx-auto mb-8">
              Taking the complexity out of personal finance management. Start
              your journey to financial freedom today.
            </p>

            <div className="flex justify-center space-x-6 mb-8">
              <Link
                href="/about"
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                About
              </Link>
              <Link
                href="/contact"
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                Contact
              </Link>
            </div>

            <div className="border-t border-gray-200 pt-8">
              <p className="text-gray-500">
                © 2026 WalletTrack. Take control of your finances.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
