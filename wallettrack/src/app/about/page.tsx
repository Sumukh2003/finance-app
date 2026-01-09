import Link from "next/link";
import {
  Wallet,
  Target,
  Shield,
  TrendingUp,
  Users,
  Sparkles,
  ArrowRight,
} from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">WalletTrack</h1>
          </div>
          <Link
            href="/"
            className="text-gray-700 hover:text-blue-600 font-medium"
          >
            Home
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 border border-blue-100 mb-6">
            <Sparkles className="w-4 h-4 text-blue-600 mr-2" />
            <span className="text-sm font-medium text-blue-700">
              About WalletTrack
            </span>
          </div>

          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Building Smarter
            <span className="block text-blue-600">Financial Habits</span>
          </h1>

          <p className="text-xl text-gray-600 leading-relaxed">
            WalletTrack is designed to help individuals take control of their
            finances through clarity, automation, and powerful insights.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
        <div className="bg-white border border-gray-200 rounded-2xl p-8">
          <Target className="w-8 h-8 text-blue-600 mb-4" />
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h3>
          <p className="text-gray-600 leading-relaxed">
            To simplify personal finance management and empower users with tools
            that promote responsible spending, smarter budgeting, and long-term
            financial growth.
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-8">
          <TrendingUp className="w-8 h-8 text-green-600 mb-4" />
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h3>
          <p className="text-gray-600 leading-relaxed">
            A future where everyone understands their money, makes informed
            decisions, and achieves financial independence with confidence.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="max-w-6xl mx-auto px-4 mb-24">
        <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
          What We Stand For
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center">
            <Shield className="w-10 h-10 text-purple-600 mx-auto mb-4" />
            <h4 className="text-xl font-bold mb-3">Security First</h4>
            <p className="text-gray-600">
              Your financial data is protected with industry-grade security
              practices.
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center">
            <Users className="w-10 h-10 text-blue-600 mx-auto mb-4" />
            <h4 className="text-xl font-bold mb-3">User-Centric</h4>
            <p className="text-gray-600">
              Designed with real users in mind, focusing on simplicity and
              usability.
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center">
            <Sparkles className="w-10 h-10 text-green-600 mx-auto mb-4" />
            <h4 className="text-xl font-bold mb-3">Continuous Improvement</h4>
            <p className="text-gray-600">
              We constantly evolve to deliver smarter insights and better
              experiences.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-br from-blue-50 to-blue-100 border-t border-blue-200 py-16 text-center">
        <h2 className="text-4xl font-bold text-gray-900 mb-6">
          Ready to Take Control?
        </h2>
        <Link
          href="/register"
          className="inline-flex items-center bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-4 rounded-xl text-lg font-bold hover:shadow-lg"
        >
          Get Started
          <ArrowRight className="w-5 h-5 ml-2" />
        </Link>
      </section>
    </div>
  );
}
