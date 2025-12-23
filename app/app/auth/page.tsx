'use client';

import { createClient } from '@/lib/supabase/client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const supabase = createClient();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      if (isSignUp) {
        // Sign up
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`
          }
        });

        if (signUpError) throw signUpError;

        if (data?.user) {
          setMessage('Account created! Please check your email to verify your account.');
          setEmail('');
          setPassword('');
          // Switch to sign in mode after 3 seconds
          setTimeout(() => {
            setIsSignUp(false);
            setMessage('');
          }, 3000);
        }
      } else {
        // Sign in
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (signInError) throw signInError;

        if (data?.user) {
          router.push('/dashboard');
          router.refresh();
        }
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary-50 to-white px-4">
      <div className="max-w-md w-full">
        <div className="bg-white p-8 sm:p-10 rounded-xl shadow-medium border border-gray-200">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 mb-4">
              <span className="text-3xl">💧</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </h1>
            <p className="text-gray-600">
              {isSignUp
                ? 'Start building healthy habits today'
                : 'Sign in to manage your reminders'
              }
            </p>
          </div>

          {/* Alerts */}
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {message && (
            <Alert className="mb-6 bg-success-50 text-success-800 border-success-200">
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder={isSignUp ? 'At least 6 characters' : 'Your password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                disabled={isLoading}
                className="h-11"
              />
              {isSignUp && (
                <p className="text-xs text-gray-500 mt-1">
                  Minimum 6 characters required
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-primary-500 hover:bg-primary-600 text-white font-medium shadow-sm"
              disabled={isLoading}
            >
              {isLoading
                ? (isSignUp ? 'Creating account...' : 'Signing in...')
                : (isSignUp ? 'Create Account' : 'Sign In')
              }
            </Button>
          </form>

          {/* Toggle Sign Up/In */}
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
                setMessage('');
              }}
              className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
              disabled={isLoading}
            >
              {isSignUp
                ? 'Already have an account? Sign in'
                : "Don't have an account? Sign up"
              }
            </button>
          </div>

          {/* Footer Note */}
          <p className="text-xs text-gray-500 text-center mt-8 leading-relaxed">
            By continuing, you agree to receive reminder notifications via email and Telegram
          </p>
        </div>

        {/* Back to Home Link */}
        <div className="text-center mt-6">
          <a
            href="/"
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}
