"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Header() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <Link
              href="/dashboard"
              className="text-2xl font-bold text-gray-900"
            >
              WalletTrack
            </Link>
          </div>
          <nav className="flex items-center space-x-6">
            <Link
              href="/dashboard"
              className="text-gray-700 hover:text-gray-900"
            >
              Dashboard
            </Link>
            <Link
              href="/dashboard/transactions"
              className="text-gray-700 hover:text-gray-900"
            >
              Transactions
            </Link>
            <Link
              href="/dashboard/budgets"
              className="text-gray-700 hover:text-gray-900"
            >
              Budgets
            </Link>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}
