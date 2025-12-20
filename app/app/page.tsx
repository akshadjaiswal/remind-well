import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <div className="text-6xl mb-6">💧</div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Never Forget to Take Care of Yourself
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Smart reminders for water, breaks, and healthy habits.
            Delivered to Telegram or email with AI-powered messages.
          </p>
          <Link
            href="/auth"
            className="inline-block bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Start Free →
          </Link>
        </div>

        {/* How It Works */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="font-semibold mb-2 text-lg">Add your habits</h3>
              <p className="text-gray-600">Water, breaks, stretching - whatever you need</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">2</span>
              </div>
              <h3 className="font-semibold mb-2 text-lg">Set reminder frequency</h3>
              <p className="text-gray-600">Choose how often you want to be reminded</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">3</span>
              </div>
              <h3 className="font-semibold mb-2 text-lg">Get smart notifications</h3>
              <p className="text-gray-600">AI generates contextual reminder messages</p>
            </div>
          </div>
        </div>

        {/* Features */}
        <div>
          <h2 className="text-3xl font-bold text-center mb-12">Features</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="text-3xl mb-3">✨</div>
              <h3 className="font-semibold mb-2">AI-Powered Messages</h3>
              <p className="text-sm text-gray-600">Contextual reminders that aren't boring</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="text-3xl mb-3">📱</div>
              <h3 className="font-semibold mb-2">Telegram & Email</h3>
              <p className="text-sm text-gray-600">Get reminders where you are</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="text-3xl mb-3">⚡</div>
              <h3 className="font-semibold mb-2">Quick Setup</h3>
              <p className="text-sm text-gray-600">Start in under 2 minutes</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="text-3xl mb-3">🎯</div>
              <h3 className="font-semibold mb-2">Flexible Scheduling</h3>
              <p className="text-sm text-gray-600">Active hours and weekend skip</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-20 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to build better habits?</h2>
          <p className="text-gray-600 mb-8">Join thousands staying hydrated and healthy</p>
          <Link
            href="/auth"
            className="inline-block bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Get Started - It's Free
          </Link>
        </div>
      </div>
    </div>
  );
}
