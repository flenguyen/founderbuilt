"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createClient } from '@/lib/supabase/client'; // Import Supabase client
import type { User } from '@supabase/supabase-js';

// Define the job types based on the schema
type JobType = 'part-time' | 'advisory' | 'fractional' | 'coaching' | 'full-time';

export default function PostJobPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [jobType, setJobType] = useState<JobType | ''>(''); // Use specific type
  const [geography, setGeography] = useState('');
  const [compensationDetails, setCompensationDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isRecruiter, setIsRecruiter] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const supabase = createClient();
  const router = useRouter();

  // Check authentication and role on mount
  useEffect(() => {
    const checkUser = async () => {
      setCheckingAuth(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        // Fetch profile to confirm role
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role') // Add recruiter_tier if needed for paid check
          .eq('id', session.user.id)
          .single();
          
        if (profileError || !profile) {
          console.error('Error fetching profile or profile not found:', profileError);
          setError('Could not verify user role. Please try again.');
          setIsRecruiter(false); 
        } else if (profile.role === 'recruiter') {
          setIsRecruiter(true);
          // TODO: Add check for paid tier if required
          // if (profile.recruiter_tier !== 'paid') { ... }
        } else {
          // Not a recruiter, redirect (though middleware should handle this)
          setError('Access denied. Only recruiters can post jobs.');
          setIsRecruiter(false);
          router.push('/'); // Redirect non-recruiters
        }
      } else {
        // Not logged in, redirect (though middleware should handle this)
        setError('Authentication required.');
        setIsRecruiter(false);
        router.push('/login');
      }
      setCheckingAuth(false);
    };
    checkUser();
  }, [supabase, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isRecruiter || !user) {
      setError('You must be logged in as a recruiter to post jobs.');
      return;
    }
    if (!title || !description || !jobType) {
      setError('Please fill in all required fields (Title, Description, Job Type).');
      setSuccess(null);
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);
    console.log('Submitting job posting for user:', user.id);

    try {
      const { error: insertError } = await supabase
        .from('jobs')
        .insert({
          posted_by_recruiter_id: user.id,
          title,
          description,
          job_type: jobType,
          geography: geography || null, // Use null if empty
          compensation_details: compensationDetails || null, // Use null if empty
          is_active: true, // Default to active
        });

      if (insertError) throw insertError;

      setSuccess('Job posted successfully!');
      // Clear form
      setTitle('');
      setDescription('');
      setJobType('');
      setGeography('');
      setCompensationDetails('');
      // Optional: Redirect after a short delay
      // setTimeout(() => router.push('/jobs'), 1500);

    } catch (error: any) {
      console.error('Error posting job:', error);
      setError(error.message || 'Failed to post job. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
      return <Layout><p className="text-center py-10">Checking authorization...</p></Layout>;
  }

  // If auth check finished and user is not a recruiter, error message is shown
  // or redirect has happened.

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6">Post a New Job/Gig</h1>
        {isRecruiter ? (
          <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 sm:p-8 rounded-lg shadow-sm border">

            <div>
              <Label htmlFor="title">Job Title <span className="text-red-500">*</span></Label>
              <Input id="title" name="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>

            <div>
              <Label htmlFor="description">Description <span className="text-red-500">*</span></Label>
              <Textarea id="description" name="description" value={description} onChange={(e) => setDescription(e.target.value)} required rows={5} />
            </div>

            <div>
              <Label htmlFor="jobType">Job Type <span className="text-red-500">*</span></Label>
              <Select value={jobType} onValueChange={(value) => setJobType(value as JobType)} required>
                <SelectTrigger id="jobType">
                  <SelectValue placeholder="Select job type..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full-time">Full-time</SelectItem>
                  <SelectItem value="part-time">Part-time</SelectItem>
                  <SelectItem value="advisory">Advisory</SelectItem>
                  <SelectItem value="fractional">Fractional</SelectItem>
                  <SelectItem value="coaching">Coaching</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="geography">Geography / Location</Label>
              <Input id="geography" name="geography" value={geography} onChange={(e) => setGeography(e.target.value)} placeholder="e.g., Remote, NYC, US Only" />
            </div>

            <div>
              <Label htmlFor="compensationDetails">Compensation Details</Label>
              <Input id="compensationDetails" name="compensationDetails" value={compensationDetails} onChange={(e) => setCompensationDetails(e.target.value)} placeholder="e.g., $100k-$120k, Equity options, Project-based" />
            </div>

            {/* Submit Button & Messages */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-4">
              {success && <p className="text-green-600 text-sm order-1 sm:order-none sm:mr-auto">{success}</p>}
              {error && <p className="text-red-500 text-sm order-1 sm:order-none sm:mr-auto">{error}</p>}
              <Button type="submit" disabled={loading || !isRecruiter} className="w-full sm:w-auto">
                {loading ? 'Posting Job...' : 'Post Job'}
              </Button>
            </div>

          </form>
        ) : (
          // Display error if somehow the user got here without being a recruiter
          <p className="text-red-500 text-center py-10">{error || 'Access Denied. Only recruiters can post jobs.'}</p>
        )}
      </div>
    </Layout>
  );
}

