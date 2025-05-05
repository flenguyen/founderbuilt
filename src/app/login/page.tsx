"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
// Import Supabase client
import { createClient } from '@/lib/supabase/client'; // Ensure this path is correct

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    console.log("Attempting Google Sign in");

    try {
      const { error: signInError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          // No specific data needed for login, unlike signup
        },
      });
      if (signInError) throw signInError;
      // If successful, Supabase redirects the user to Google, then back to the redirectTo URL.
      // No need to setLoading(false) here as the page will navigate away.
    } catch (error: any) {
      console.error('Error signing in with Google:', error);
      setError(error.message || 'Failed to sign in with Google.');
      setLoading(false); // Only set loading false if there was an error
    }
  };

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div>
            <h1 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Log In to FounderBuilt</h1>
          </div>
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 space-y-6">
            <h2 className="text-xl font-semibold text-center text-gray-700">Welcome Back</h2>

            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

            <Button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {loading ? 'Redirecting to Google...' : 'Log in with Google'}
            </Button>

            <p className="mt-2 text-center text-sm text-gray-600">
              Don't have an account?{' '}
              <Link href="/signup" className="font-medium text-indigo-600 hover:text-indigo-500">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}

