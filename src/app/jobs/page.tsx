"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase/client'; // Import Supabase client
import type { User } from '@supabase/supabase-js';

// Interface matching the data structure from Supabase 'jobs' table
interface JobPosting {
  id: string;
  title: string;
  description: string;
  job_type: 'part-time' | 'advisory' | 'fractional' | 'coaching' | 'full-time';
  geography: string | null;
  compensation_details: string | null;
  created_at: string; 
  // posted_by_recruiter_id: string; // Add if needed for details link
}

// Interface for the current user's profile details needed for access control
interface CurrentUserProfile {
  role: 'founder' | 'recruiter' | 'admin';
  // Add recruiter_tier if needed for job posting restrictions
  // recruiter_tier: 'free' | 'paid' | null;
}

// Responsive Job Card component
const JobCard: React.FC<{ job: JobPosting }> = ({ job }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg md:text-xl">{job.title}</CardTitle>
        <CardDescription className="text-xs md:text-sm">
          Posted: {new Date(job.created_at).toLocaleDateString()} | Type: <span className="font-medium capitalize">{job.job_type}</span> | Location: <span className="font-medium">{job.geography || 'N/A'}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-700 mb-2 line-clamp-3">{job.description}</p>
        <p className="text-sm text-gray-600">Compensation: <span className="font-medium">{job.compensation_details || 'Not specified'}</span></p>
      </CardContent>
      <CardFooter>
        {/* TODO: Link to a job details page or application process */}
        <Button size="sm" variant="outline">View Details</Button>
      </CardFooter>
    </Card>
  );
};

export default function JobBoardPage() {
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [currentUserProfile, setCurrentUserProfile] = useState<CurrentUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'created_at_desc' | 'created_at_asc'>('created_at_desc');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterGeo, setFilterGeo] = useState<string>('');
  const supabase = createClient();

  // Fetch current user's role
  const fetchCurrentUserProfile = useCallback(async (user: User) => {
    try {
      const { data, error: profileError } = await supabase
        .from('profiles')
        .select('role') // Only need role for now
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

  // Fetch jobs based on filters and sorting
  const fetchJobs = useCallback(async () => {
    // Don't fetch if user profile hasn't loaded or failed
    if (!currentUserProfile && !error) {
        setError('Loading user data...'); // Indicate dependency
        return;
    } 
    if (error) { // If profile fetch failed, don't proceed
        setLoading(false);
        return;
    }
    
    setLoading(true);
    setError(null);
    console.log("Fetching jobs with filters:", { sortBy, filterType, filterGeo });

    try {
      let query = supabase
        .from('jobs')
        .select('id, title, description, job_type, geography, compensation_details, created_at')
        .eq('is_active', true);

      // Filtering
      if (filterType !== 'all') {
        query = query.eq('job_type', filterType);
      }
      if (filterGeo) {
        // Use ilike for case-insensitive partial matching
        query = query.ilike('geography', `%${filterGeo}%`);
      }

      // Sorting
      const sortOptions = sortBy === 'created_at_asc' 
        ? { ascending: true } 
        : { ascending: false }; // Default to descending
      query = query.order('created_at', sortOptions);

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      
      setJobs(data as JobPosting[]);

    } catch (error: any) {
      console.error('Error fetching jobs:', error);
      setError('Failed to load job board.');
    } finally {
      setLoading(false);
    }
  }, [supabase, sortBy, filterType, filterGeo, currentUserProfile, error]);

  // Initial effect to get user session and profile
  useEffect(() => {
    const getUserAndProfile = async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await fetchCurrentUserProfile(session.user);
      } else {
        setError('Not authenticated.'); // Middleware should handle redirect
        setLoading(false);
      }
    };
    getUserAndProfile();
  }, [supabase, fetchCurrentUserProfile]);

  // Effect to fetch jobs when filters/sort change or profile loads
  useEffect(() => {
    // Only fetch jobs if user profile is loaded (or if profile fetch failed, error is set)
    if (currentUserProfile || error) {
      fetchJobs();
    }
  }, [currentUserProfile, fetchJobs, error]); // Add error as dependency

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Responsive Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">Job Board</h1>
          {/* Show Post Job button only to recruiters */}
          {currentUserProfile?.role === 'recruiter' && (
            <Link href="/jobs/post">
              <Button>Post a Job</Button>
            </Link>
          )}
        </div>

        {/* Responsive Filters and Sorting Controls */}
        <div className="mb-8 p-4 border rounded-lg bg-gray-50 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-1">Sort By</Label>
              <Select value={sortBy} onValueChange={(value) => setSortBy(value as 'created_at_desc' | 'created_at_asc')}>
                <SelectTrigger id="sort">
                  <SelectValue placeholder="Sort by..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_at_desc">Date Posted (Newest First)</SelectItem>
                  <SelectItem value="created_at_asc">Date Posted (Oldest First)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="filter-type" className="block text-sm font-medium text-gray-700 mb-1">Job Type</Label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger id="filter-type">
                  <SelectValue placeholder="Filter by type..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="full-time">Full-time</SelectItem>
                  <SelectItem value="part-time">Part-time</SelectItem>
                  <SelectItem value="advisory">Advisory</SelectItem>
                  <SelectItem value="fractional">Fractional</SelectItem>
                  <SelectItem value="coaching">Coaching</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="filter-geo" className="block text-sm font-medium text-gray-700 mb-1">Geography / Location</Label>
              <Input
                id="filter-geo"
                placeholder="e.g., Remote, NYC, US"
                value={filterGeo}
                onChange={(e) => setFilterGeo(e.target.value)}
              />
            </div>
          </div>
        </div>

        {loading && <p className="text-center py-10">Loading jobs...</p>}
        {error && <p className="text-red-500 text-center py-10">{error}</p>}

        {!loading && !error && (
          <div className="space-y-4 md:space-y-6">
            {jobs.length > 0 ? (
              jobs.map(job => (
                <JobCard key={job.id} job={job} />
              ))
            ) : (
              <p className="text-center text-gray-600 py-10">No jobs found matching your criteria.</p>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}

