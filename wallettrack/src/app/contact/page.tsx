"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Wallet,
  Mail,
  Phone,
  MapPin,
  Send,
  Sparkles,
  ArrowRight,
  MessageSquare,
  Clock,
  Users,
  CheckCircle,
} from "lucide-react";

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);

    const form = e.currentTarget; // Store reference
    const formData = {
      name: (form.elements.namedItem("name") as HTMLInputElement).value,
      email: (form.elements.namedItem("email") as HTMLInputElement).value,
      message: (form.elements.namedItem("message") as HTMLTextAreaElement)
        .value,
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        // Reset form BEFORE setting success state
        form.reset();
        setIsSubmitted(true);

        // Reset success message after 5 seconds
        setTimeout(() => {
          setIsSubmitted(false);
        }, 5000);
      } else {
        alert("Failed to send message. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const contactMethods = [
    {
      icon: Mail,
      title: "Email Us",
      details: "sumukh282003@gmail.com",
      description: "We typically respond as soon as possible",
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: Phone,
      title: "Call Us",
      details: "+91 8217739781",
      description: "We typically respond as soon as possible",
      color: "from-green-500 to-green-600",
    },
    {
      icon: MapPin,
      title: "Location",
      details: "India",
      description: "Serving users worldwide",
      color: "from-purple-500 to-purple-600",
    },
  ];

  const faqs = [
    {
      question: "How do I get started with WalletTrack?",
      answer:
        "Simply sign up for a free account and start tracking your expenses right away. No credit card required.",
    },
    {
      question: "Is my financial data secure?",
      answer:
        "Yes! We use bank-level encryption and follow best security practices. Your data is always protected.",
    },
    {
      question: "Can I use WalletTrack on mobile?",
      answer:
        "Yes! Our web app is fully responsive and works perfectly on all mobile devices.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/" className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-sm">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  WalletTrack
                </h1>
                <p className="text-xs text-gray-500">Financial Intelligence</p>
              </div>
            </Link>
            <nav className="flex items-center space-x-6">
              <Link
                href="/"
                className="text-gray-700 hover:text-blue-600 font-medium px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors"
              >
                Home
              </Link>
              <Link
                href="/about"
                className="text-gray-700 hover:text-blue-600 font-medium px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors"
              >
                About
              </Link>
              <Link
                href="/contact"
                className="text-blue-600 font-medium px-3 py-2 bg-blue-50 rounded-lg"
              >
                Contact
              </Link>
              <Link
                href="/login"
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-5 py-2.5 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 font-medium shadow-sm hover:shadow"
              >
                Get Started
                <ArrowRight className="w-4 h-4 ml-2 inline" />
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20">
        <div className="text-center">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 border border-blue-100 mb-6">
            <MessageSquare className="w-4 h-4 text-blue-600 mr-2" />
            <span className="text-sm font-medium text-blue-700">
              We're Here to Help • 24/7 Support
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Get in
            <span className="block text-blue-600">Touch</span>
          </h1>

          <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
            Have questions about WalletTrack? Need help with your account? Our
            team is ready to assist you on your financial journey.
          </p>
        </div>
      </div>

      {/* Contact Methods */}
      <div className="py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {contactMethods.map((method, index) => (
              <div
                key={index}
                className="bg-gradient-to-b from-white to-gray-50 rounded-2xl border border-gray-200 p-8 text-center hover:border-blue-200 transition-all duration-300"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 mb-6">
                  <div
                    className={`bg-gradient-to-br ${method.color} p-3 rounded-lg`}
                  >
                    <method.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {method.title}
                </h3>
                <div className="text-lg font-medium text-blue-600 mb-2">
                  {method.details}
                </div>
                <p className="text-gray-600 text-sm">{method.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contact Form & FAQ */}
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Contact Form */}
            <div className="bg-white rounded-2xl border border-gray-200 p-7 shadow-sm flex flex-col">
              <div className="flex items-center mb-6">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg mr-3">
                  <Send className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Send us a Message
                  </h2>
                  <p className="text-gray-600 text-sm">
                    Fill out the form below and we'll get back to you ASAP
                  </p>
                </div>
              </div>

              {isSubmitted ? (
                <div className="text-center py-10 flex-grow flex flex-col items-center justify-center">
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-green-50 rounded-full mb-4">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Message Sent Successfully!
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Thank you for contacting us. We'll get back to you within 24
                    hours.
                  </p>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  className="space-y-5 flex-grow flex flex-col"
                >
                  <div className="space-y-5">
                    <div>
                      <input
                        type="text"
                        name="name"
                        placeholder="Your Name *"
                        required
                        className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                    </div>

                    <div>
                      <input
                        type="email"
                        name="email"
                        placeholder="Email Address *"
                        required
                        className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                    </div>

                    <div className="flex-grow">
                      <textarea
                        name="message"
                        placeholder="Your Message *"
                        required
                        className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm h-full min-h-[140px]"
                      />
                    </div>
                  </div>

                  <div className="mt-auto pt-3">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3.5 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Send Message
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* FAQ Section */}
            <div className="flex flex-col">
              <div className="bg-white rounded-2xl border border-gray-200 p-7 shadow-sm flex flex-col h-full">
                <div className="flex items-center mb-6">
                  <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-lg mr-3">
                    <MessageSquare className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      Frequently Asked Questions
                    </h2>
                    <p className="text-gray-600 text-sm">
                      Quick answers to common questions
                    </p>
                  </div>
                </div>

                <div className="space-y-4 flex-grow">
                  {faqs.map((faq, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 border border-gray-200 rounded-lg p-5 hover:border-blue-200 transition-colors"
                    >
                      <h3 className="text-base font-bold text-gray-900 mb-2">
                        {faq.question}
                      </h3>
                      <p className="text-gray-600 text-sm">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-12">
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
                href="/"
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                Home
              </Link>
              <Link
                href="/about"
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                About
              </Link>
              <Link href="/contact" className="text-blue-600 font-medium">
                Contact
              </Link>
              <Link
                href="/login"
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                Login
              </Link>
            </div>

            <div className="border-t border-gray-200 pt-8">
              <p className="text-gray-500">
                © 2026 WalletTrack. Your financial journey starts here.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
