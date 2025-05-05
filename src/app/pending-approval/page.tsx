"use client";

import React from 'react';
import Layout from '@/components/layout/Layout'; // Adjust import path if needed

export default function PendingApprovalPage() {
  // TODO: Add logic to check user auth status and role. Redirect if not a pending founder.

  return (
    <Layout>
      {/* Use padding for responsiveness and ensure text wraps well */}
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-250px)] text-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-xl">
          <h1 className="text-2xl sm:text-3xl font-bold mb-4 text-gray-900">Application Submitted</h1>
          <p className="text-base sm:text-lg text-gray-700 mb-6">
            Thank you for applying to join the FounderBuilt community!
          </p>
          <p className="text-sm sm:text-md text-gray-600">
            Your application is currently under review by our admin team.
            You will receive an email notification once a decision has been made.
          </p>
          {/* Optional: Add a link to contact support or logout button */}
          {/* <div className="mt-8">
            <a href="/contact" className="text-indigo-600 hover:text-indigo-500 text-sm">Contact Support</a>
          </div> */}
        </div>
      </div>
    </Layout>
  );
}

