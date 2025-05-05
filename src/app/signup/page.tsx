"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
// Import Supabase client
import { createClient } from '@/lib/supabase/client'; // Ensure this path is correct

export default function SignupPage() {
  const [role, setRole] = useState<'founder' | 'recruiter' | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const handleGoogleSignIn = async () => {
    if (!role) {
      setError('Please select a role (Founder or Recruiter) before signing up.');
      return;
    }
    setLoading(true);
    setError(null);
    console.log(`Attempting Google Sign in as: ${role}`);

    try {
      // Use options.data to pass metadata to the signup trigger
      const { error: signInError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          data: {
            signup_role: role // This will be available in raw_user_meta_data for the trigger
          }
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
            <h1 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Join FounderBuilt</h1>
          </div>
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 space-y-6">
            <h2 className="text-xl font-semibold text-center text-gray-700">Choose Your Role</h2>
            <RadioGroup
              value={role ?? undefined} // Control the RadioGroup value
              onValueChange={(value) => setRole(value as 'founder' | 'recruiter')}
              className="flex flex-col items-center space-y-4 sm:flex-row sm:justify-center sm:space-y-0 sm:space-x-8"
              aria-label="Select Role"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="founder" id="founder" />
                <Label htmlFor="founder">Founder</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="recruiter" id="recruiter" />
                <Label htmlFor="recruiter">Recruiter</Label>
              </div>
            </RadioGroup>

            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

            <Button
              onClick={handleGoogleSignIn}
              disabled={!role || loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {loading ? 'Redirecting to Google...' : 'Sign up with Google'}
            </Button>

            <p className="mt-2 text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}

