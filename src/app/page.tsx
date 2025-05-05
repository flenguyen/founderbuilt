"use client"; // Or remove if using Server Components primarily

import React from 'react';
import Link from 'next/link'; // Use Link for navigation
import Layout from '@/components/layout/Layout'; // Adjust import path if needed
// Import Supabase client if needed for fetching user data/role
// import { createClient } from '@/lib/supabase/client';

export default function HomePage() {
  // TODO: Fetch user data/role to conditionally render content
  const userRole = 'founder'; // Placeholder: Replace with actual user role logic
  const isApprovedFounder = userRole === 'founder'; // Placeholder: Add check for approval status

  return (
    <Layout>
      {/* Use responsive padding and text sizes */}
      <div className="py-8 md:py-12">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 text-gray-900">Welcome to FounderBuilt</h1>

        {isApprovedFounder ? (
          <div className="bg-white p-6 shadow rounded-lg">
            <h2 className="text-xl md:text-2xl font-semibold mb-4">Community Guidelines</h2>
            <p className="mb-4 text-gray-700 text-sm md:text-base">Welcome, Founder! Please adhere to our community guidelines:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 text-sm md:text-base">
              <li>Be respectful and constructive in all interactions.</li>
              <li>Share knowledge and experiences openly.</li>
              <li>Do not spam or post irrelevant content.</li>
              <li>Recruiters must use the designated job board for postings.</li>
              {/* Add more guidelines as needed */}
            </ul>
          </div>
        ) : (
          <div className="bg-white p-6 shadow rounded-lg">
            <p className="text-lg md:text-xl text-gray-700">
              Connecting founders and recruiters.
            </p>
            {/* Placeholder content for non-founders or unapproved founders */}
            <p className="mt-4 text-sm md:text-base">
              Explore the <Link href="/directory" className="text-indigo-600 hover:text-indigo-500">Directory</Link> or check out the <Link href="/jobs" className="text-indigo-600 hover:text-indigo-500">Job Board</Link>.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}

