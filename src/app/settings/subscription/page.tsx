"use client";

import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout'; // Adjust import path if needed
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
// Import Supabase client
// import { createClient } from '@/lib/supabase/client';
// Import Stripe utilities (to be created)
// import { getStripe } from '@/lib/stripe/client';

export default function SubscriptionPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTier, setCurrentTier] = useState<'free' | 'paid'>('free'); // Placeholder
  const [isManaging, setIsManaging] = useState(false);

  // const supabase = createClient();

  useEffect(() => {
    // TODO: Fetch user's current tier from Supabase profile
    const fetchTier = async () => {
      console.log("Fetching user tier...");
      // Placeholder logic
      await new Promise(resolve => setTimeout(resolve, 200));
      // setCurrentTier(fetchedTierFromDb);
    };
    fetchTier();
  }, []);

  const handleUpgrade = async () => {
    setLoading(true);
    setError(null);
    console.log("Initiating upgrade to Paid Tier...");

    // TODO: Implement Stripe Checkout integration
    await new Promise(resolve => setTimeout(resolve, 1000));
    alert("Placeholder: Redirect to Stripe Checkout. Implement API route and Stripe logic.");
    setLoading(false);
  };

  const handleManageSubscription = async () => {
    setIsManaging(true);
    setError(null);
    console.log("Initiating subscription management...");

    // TODO: Implement Stripe Customer Portal integration
    await new Promise(resolve => setTimeout(resolve, 1000));
    alert("Placeholder: Redirect to Stripe Customer Portal. Implement API route.");
    setIsManaging(false);
  };

  return (
    <Layout>
      {/* Use responsive padding and max-width */}
      <div className="py-8 md:py-12 max-w-2xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-900">Subscription Settings</h1>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">Recruiter Tier</CardTitle>
            <CardDescription className="text-sm md:text-base">
              Manage your access level to FounderBuilt features.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm md:text-base">Your current tier: <span className="font-semibold capitalize">{currentTier}</span></p>
            {currentTier === 'free' && (
              <div>
                <p className="text-gray-700 mb-2 text-sm md:text-base">Upgrade to the Paid Tier to get full access to founder profiles, including contact information and LinkedIn links.</p>
                {/* Add details about pricing if desired */}
              </div>
            )}
            {currentTier === 'paid' && (
              <p className="text-green-600 text-sm md:text-base">You have full access to all features!</p>
            )}
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </CardContent>
          <CardFooter className="border-t pt-6">
            {currentTier === 'free' ? (
              <Button onClick={handleUpgrade} disabled={loading}>
                {loading ? 'Processing...' : 'Upgrade to Paid Tier'}
              </Button>
            ) : (
              <Button onClick={handleManageSubscription} disabled={isManaging}>
                {isManaging ? 'Processing...' : 'Manage Subscription'}
              </Button>
            )}
          </CardFooter>
        </Card>

      </div>
    </Layout>
  );
}

