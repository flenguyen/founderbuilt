"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client'; // Import Supabase client
import type { User } from '@supabase/supabase-js';

// Interface matching the data we select from Supabase
interface FounderProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  profile_blurb: string | null;
  linkedin_url: string | null;
  // Email might be null depending on RLS, but we'll try to fetch it
  email: string | null; 
}

// Interface for the current user's profile details needed for access control
interface CurrentUserProfile {
  role: 'founder' | 'recruiter' | 'admin';
  // recruiter_tier is no longer relevant for access control here
}

// Responsive User Card component
const UserCard: React.FC<{ founder: FounderProfile; canViewContactInfo: boolean }> = ({ founder, canViewContactInfo }) => {
  return (
    <Card className="flex flex-col h-full"> 
      <CardHeader>
        <CardTitle>{founder.first_name || 'Founder'} {founder.last_name || ''}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-gray-600 mt-1 line-clamp-3">{founder.profile_blurb || 'No blurb provided.'}</p>
        {/* Conditionally show contact info based on access rights */}
        {canViewContactInfo && (
          <div className="mt-3 pt-3 border-t text-xs text-gray-500 space-y-1">
            {/* Display email only if it's available (RLS might restrict it) */}
            {founder.email && <p>Email: {founder.email}</p>}
            {founder.linkedin_url && (
              <p>
                LinkedIn: <a href={founder.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">View Profile</a>
              </p>
            )}
            {!founder.email && !founder.linkedin_url && <p>No contact info available.</p>}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default function DirectoryPage() {
  const [founders, setFounders] = useState<FounderProfile[]>([]);
  const [currentUserProfile, setCurrentUserProfile] = useState<CurrentUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  // Fetch current user's role
  const fetchCurrentUserProfile = useCallback(async (user: User) => {
    try {
      // Only need role now
      const { data, error: profileError } = await supabase
        .from('profiles')
        .select('role') 
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;
      if (data) {
        setCurrentUserProfile(data as CurrentUserProfile);
      } else {
        throw new Error('Current user profile not found.');
      }
    } catch (error: any) {
      console.error('Error fetching current user profile:', error);
      setError('Could not determine your access level.');
    }
  }, [supabase]);

  // Fetch approved founders
  const fetchFounders = useCallback(async () => {
    if (!currentUserProfile) {
        if (!error) setError('Loading access level...');
        setLoading(false);
        return;
    }
    
    setLoading(true);
    setError(null);
    console.log("Fetching approved founders...");

    try {
      // RLS policies need to be updated to allow recruiters to select email/linkedin
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, profile_blurb, linkedin_url, email') 
        .eq('role', 'founder')
        .eq('application_status', 'approved')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setFounders(data as FounderProfile[]);

    } catch (error: any) {
      console.error('Error fetching founders:', error);
      setError('Failed to load founder directory. RLS policy might need update.'); // Added note about RLS
    } finally {
      setLoading(false);
    }
  }, [supabase, currentUserProfile, error]);

  // Initial effect to get user session and profile
  useEffect(() => {
    const getUserAndProfile = async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await fetchCurrentUserProfile(session.user);
      } else {
        setError('Not authenticated.');
        setLoading(false);
      }
    };
    getUserAndProfile();
  }, [supabase, fetchCurrentUserProfile]);

  // Effect to fetch founders once current user profile is loaded
  useEffect(() => {
    if (currentUserProfile) {
      fetchFounders();
    }
  }, [currentUserProfile, fetchFounders]);

  // *** UPDATED LOGIC: Grant access if user is admin OR recruiter ***
  const canViewContactInfo = currentUserProfile?.role === 'admin' || currentUserProfile?.role === 'recruiter';

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 md:py-12">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 text-gray-900">Founder Directory</h1>

        {loading && <p className="text-center py-10">Loading directory...</p>}
        {error && <p className="text-red-500 text-center py-10">{error}</p>}

        {!loading && !error && (
          <div>
            {founders.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {founders.map(founder => (
                  <UserCard 
                    key={founder.id} 
                    founder={founder} 
                    canViewContactInfo={canViewContactInfo} 
                  />
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-600 py-10">No approved founders found in the directory yet.</p>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}

