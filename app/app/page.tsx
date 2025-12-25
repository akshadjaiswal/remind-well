import Link from 'next/link';
import { Sparkles, Bell, Clock, Zap, ArrowRight } from 'lucide-react';
import { Footer } from '@/components/layout/footer';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🔔</span>
              <span className="text-xl font-bold text-gray-900">RemindWell</span>
            </div>
            <Link
              href="/auth"
              className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary-50 via-white to-white">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-pattern-dots opacity-40" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-soft" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-soft" style={{ animationDelay: '1s' }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-primary-200 text-primary-700 px-4 py-2 rounded-full text-sm font-medium mb-6 shadow-sm">
              <Sparkles className="h-4 w-4" />
              AI-Powered Habit Reminders
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Never Forget to
              <br />
              <span className="bg-gradient-to-r from-primary-600 via-purple-500 to-primary-400 bg-clip-text text-transparent">
                Take Care of Yourself
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
              Smart reminders for water, breaks, and healthy habits. Delivered to Telegram or email with AI-powered messages.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/auth"
                className="group inline-flex items-center justify-center bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white px-8 py-4 rounded-xl text-lg font-medium transition-all shadow-lg hover:shadow-xl w-full sm:w-auto"
              >
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="#features"
                className="inline-flex items-center justify-center border-2 border-gray-200 hover:border-primary-300 hover:bg-primary-50 text-gray-700 hover:text-primary-700 px-8 py-4 rounded-xl text-lg font-medium transition-all w-full sm:w-auto"
              >
                Learn More
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600">
              Set up your first reminder in under 2 minutes
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 text-primary-600 mb-6">
                <span className="text-2xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Add Your Habits
              </h3>
              <p className="text-gray-600">
                Water, breaks, stretching - whatever you need to remember
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 text-primary-600 mb-6">
                <span className="text-2xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Set Frequency
              </h3>
              <p className="text-gray-600">
                Choose how often you want to be reminded throughout the day
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 text-primary-600 mb-6">
                <span className="text-2xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Get Smart Notifications
              </h3>
              <p className="text-gray-600">
                AI generates contextual reminder messages that keep you engaged
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-pattern-grid opacity-30" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need
            </h2>
            <p className="text-lg text-gray-600">
              Powerful features to help you build lasting habits
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="group bg-white p-6 rounded-2xl border border-gray-200 hover:border-primary-300 hover:shadow-lg transition-all duration-300">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 text-white mb-4 group-hover:scale-110 transition-transform">
                <Sparkles className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                AI-Powered Messages
              </h3>
              <p className="text-sm text-gray-600">
                Contextual reminders that aren't boring or repetitive
              </p>
            </div>
            <div className="group bg-white p-6 rounded-2xl border border-gray-200 hover:border-success-300 hover:shadow-lg transition-all duration-300">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-success-500 to-success-600 text-white mb-4 group-hover:scale-110 transition-transform">
                <Bell className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Telegram & Email
              </h3>
              <p className="text-sm text-gray-600">
                Get reminders where you are, on your preferred platform
              </p>
            </div>
            <div className="group bg-white p-6 rounded-2xl border border-gray-200 hover:border-warning-300 hover:shadow-lg transition-all duration-300">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-warning-500 to-warning-600 text-white mb-4 group-hover:scale-110 transition-transform">
                <Zap className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Quick Setup
              </h3>
              <p className="text-sm text-gray-600">
                Start building better habits in under 2 minutes
              </p>
            </div>
            <div className="group bg-white p-6 rounded-2xl border border-gray-200 hover:border-info-300 hover:shadow-lg transition-all duration-300">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-info-500 to-info-600 text-white mb-4 group-hover:scale-110 transition-transform">
                <Clock className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Flexible Scheduling
              </h3>
              <p className="text-sm text-gray-600">
                Active hours, weekend skip, and custom frequencies
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-20 bg-gradient-to-br from-primary-50 via-purple-50 to-white overflow-hidden">
        <div className="absolute inset-0 bg-pattern-dots opacity-30" />
        <div className="absolute top-10 right-10 w-64 h-64 bg-primary-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20" />
        <div className="absolute bottom-10 left-10 w-64 h-64 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Ready to Build Better Habits?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Join others staying hydrated, healthy, and productive
          </p>
          <Link
            href="/auth"
            className="group inline-flex items-center justify-center bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white px-8 py-4 rounded-xl text-lg font-medium transition-all shadow-lg hover:shadow-xl"
          >
            Get Started - It's Free
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
