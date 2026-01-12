"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  const navLinks = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/dashboard/transactions", label: "Transactions" },
    { href: "/dashboard/budgets", label: "Budgets" },
  ];

  return (
    <header className="bg-white shadow-sm border-b relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link href="/dashboard" className="text-2xl font-bold text-gray-900">
            WalletTrack
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`relative text-gray-700 hover:text-gray-900 transition-colors
                  after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-[2px] after:bg-black after:transition-all
                  ${pathname === link.href ? "after:w-full" : ""}`}
              >
                {link.label}
              </Link>
            ))}

            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
            >
              Logout
            </button>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setOpen(true)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Overlay */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
        />
      )}

      {/* Right Sidebar */}
      <aside
        className={`fixed top-0 right-0 h-full bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out
    w-[75%] ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <span className="text-xl font-bold">Menu</span>
          <button onClick={() => setOpen(false)}>
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Sidebar Links */}
        <nav className="flex flex-col items-center p-4 space-y-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={`text-gray-700 text-lg font-medium text-center
          ${
            pathname === link.href
              ? "border-b-2 border-black"
              : "hover:text-black"
          }`}
            >
              {link.label}
            </Link>
          ))}

          <button
            onClick={handleLogout}
            className="mt-6 w-60 bg-red-600 text-white py-2 rounded-md hover:bg-red-700 text-center"
          >
            Logout
          </button>
        </nav>
      </aside>
    </header>
  );
}
