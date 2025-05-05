"use client";

import React from 'react';
import Layout from '@/components/layout/Layout'; // Adjust import path if needed

export default function EventsPage() {
  // TODO: Replace with actual Lu.ma integration (e.g., iframe embed or API fetch)
  const lumaProfileUrl = "https://lu.ma/embed/calendar/cal-placeholder/events"; // Replace with actual Lu.ma calendar embed URL

  return (
    <Layout>
      <div className="py-8 md:py-12">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 text-gray-900">Community Events</h1>

        <p className="mb-6 text-gray-700 text-sm md:text-base">
          Check out upcoming events hosted by the FounderBuilt community and partners.
        </p>

        {/* Responsive Container for Lu.ma Embed */}
        {/* Using aspect ratio to maintain proportions, adjust height on smaller screens */}
        <div className="border rounded-lg overflow-hidden shadow-sm bg-white">
          {/* Aspect ratio container (e.g., 4:3 or adjust as needed) */}
          {/* Alternatively, set a responsive height like h-[60vh] sm:h-[70vh] md:h-[80vh] */}
          <div className="aspect-w-4 aspect-h-3 md:aspect-w-16 md:aspect-h-9">
            <iframe
              src={lumaProfileUrl}
              className="w-full h-full border-0"
              allowFullScreen={true}
              aria-hidden="false"
              tabIndex={0}
              title="Lu.ma Events Calendar"
              loading="lazy" // Add lazy loading
            ></iframe>
          </div>
          {/* Fallback content if iframe fails or for non-JS users */}
          <noscript>
            <p className="p-4 text-center text-sm text-gray-600">Please enable JavaScript to view the events calendar, or visit the <a href="https://lu.ma/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-500">Lu.ma profile</a> directly.</p>
          </noscript>
        </div>

        {/* Alternative: Fetch events via API and display them manually */}
        {/* <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">Upcoming Events (API Placeholder)</h2>
          <p>Event fetching via API not implemented yet.</p>
          {/* Map through fetched events here */}
        {/* </div> */}
      </div>
    </Layout>
  );
}

