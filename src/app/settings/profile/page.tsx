"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation'; // Use for navigation
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client'; // Import Supabase client
import type { User } from '@supabase/supabase-js';

// Define the structure for profile data from Supabase (Corrected)
interface ProfileData {
  id: string;
  role: 'founder' | 'recruiter' | 'admin';
  first_name: string | null;
  last_name: string | null;
  profile_photo_url: string | null;
  linkedin_url: string | null;
  location: string | null;
  profile_blurb: string | null;
  is_profile_complete: boolean;
  // Founder specific (Corrected)
  company_name: string | null;
  company_website: string | null;
  industry: string | null; // Corrected from industry_experience
  funding_stage: string | null; // Corrected from funding_type
  expertise_seeking: string | null; // Corrected from expertise
  // Recruiter specific (add if needed)
}

// Helper function to check if essential profile fields are filled (matches middleware)
const checkProfileComplete = (profile: ProfileData | null): boolean => {
  if (!profile) return false;
  // Check for common essential fields: first_name, last_name, linkedin_url
  const commonEssentialFields = ["first_name", "last_name", "linkedin_url"];
  const commonFieldsFilled = commonEssentialFields.every(field => profile[field as keyof ProfileData] && String(profile[field as keyof ProfileData]).trim() !== "");
  
  if (!commonFieldsFilled) return false;

  // Check for founder-specific essential fields only if the role is founder
  if (profile.role === "founder") {
    const founderEssentialFields = ["company_name", "company_website", "industry"];
    const founderFieldsFilled = founderEssentialFields.every(field => profile[field as keyof ProfileData] && String(profile[field as keyof ProfileData]).trim() !== "");
    if (!founderFieldsFilled) return false;
  }
  
  // Add checks for other roles if needed

  return true; // All required fields for the role are filled
};

export default function ProfileSettingsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  // Fetch user and profile data
  const fetchProfile = useCallback(async (currentUser: User) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    console.log("Fetching profile settings for user:", currentUser.id);
    try {
      const { data, error: profileError } = await supabase
        .from('profiles')
        .select('*') // Select all columns for the form
        .eq('id', currentUser.id)
        .single();

      if (profileError) {
        if (profileError.code === 'PGRST116') { 
          console.warn('Profile not found for user, might be new signup.');
          setError('Profile not found. Please try logging out and back in.');
        } else {
          throw profileError;
        }
      } 
      
      if (data) {
        setProfile(data as ProfileData);
      } else if (!profileError) {
         setError('Profile not found. Please try logging out and back in.');
      }

    } catch (error: any) {
      console.error('Error fetching profile:', error);
      setError(error.message || 'Failed to load profile settings.');
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  // Get current user session and trigger profile fetch
  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        fetchProfile(session.user);
      } else {
        setLoading(false);
        setError('Not authenticated. Redirecting to login...');
        router.push('/login'); // Redirect if not logged in
      }
    };
    getUser();
  }, [supabase, fetchProfile, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile(prev => prev ? { ...prev, [name]: value === '' ? null : value } : null); // Store null for empty optional fields
    setSuccess(null);
    setError(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !user) return;

    setSaving(true);
    setError(null);
    setSuccess(null);
    console.log("Saving profile settings for user:", user.id);

    // Check completeness before preparing updates
    const isComplete = checkProfileComplete(profile);

    // Prepare data for Supabase update (Corrected)
    const updates = {
      first_name: profile.first_name,
      last_name: profile.last_name,
      profile_photo_url: profile.profile_photo_url,
      linkedin_url: profile.linkedin_url,
      location: profile.location,
      profile_blurb: profile.profile_blurb,
      // Include founder fields only if the role is founder (Corrected)
      ...(profile.role === 'founder' && {
        company_name: profile.company_name,
        company_website: profile.company_website,
        industry: profile.industry, // Corrected
        funding_stage: profile.funding_stage, // Corrected
        expertise_seeking: profile.expertise_seeking, // Corrected
      }),
      is_profile_complete: isComplete, // Use consistent check
      updated_at: new Date().toISOString(), // Manually update timestamp
    };

    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (updateError) throw updateError;

      setSuccess('Profile updated successfully!');
      // Update local state to reflect completion status change immediately
      setProfile(prev => prev ? { ...prev, is_profile_complete: isComplete } : null);
      
      // Redirect if profile is now complete and user was forced here
      const searchParams = new URLSearchParams(window.location.search);
      if (isComplete && searchParams.get('incomplete')) {
        router.push('/'); // Redirect to home after completing profile
      }

    } catch (error: any) {
      console.error('Error saving profile:', error);
      setError(error.message || 'Failed to save profile settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Layout><p className="text-center py-10">Loading settings...</p></Layout>;
  }

  // Show error if loading failed (and not during saving operation)
  if (error && !saving) {
    return <Layout><p className="text-center py-10 text-red-500">{error}</p></Layout>;
  }

  if (!profile) {
    // This case should be rare if error handling above is correct
    return <Layout><p className="text-center py-10">Could not load profile settings. Please try again.</p></Layout>;
  }

  return (
    <Layout>
      <div className="py-8 md:py-12 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-900">Profile Settings</h1>
        <Card>
          <form onSubmit={handleSave}>
            <CardContent className="pt-6 space-y-4 md:space-y-6">

              {/* Basic Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-1">
                  <Label htmlFor="first_name">First Name</Label>
                  <Input id="first_name" name="first_name" value={profile.first_name || ''} onChange={handleInputChange} required />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input id="last_name" name="last_name" value={profile.last_name || ''} onChange={handleInputChange} required />
                </div>
              </div>

              {/* TODO: Add Profile Photo Upload (requires Supabase Storage setup) */}

              <div className="space-y-1">
                <Label htmlFor="linkedin_url">LinkedIn Profile URL</Label>
                <Input id="linkedin_url" name="linkedin_url" type="url" value={profile.linkedin_url || ''} onChange={handleInputChange} placeholder="https://linkedin.com/in/..." required/>
              </div>

              <div className="space-y-1">
                <Label htmlFor="location">Location</Label>
                <Input id="location" name="location" value={profile.location || ''} onChange={handleInputChange} placeholder="e.g., City, State, Country" />
              </div>

              <div className="space-y-1">
                <Label htmlFor="profile_blurb">Profile Blurb / Short Bio</Label>
                <Textarea id="profile_blurb" name="profile_blurb" value={profile.profile_blurb || ''} onChange={handleInputChange} placeholder="Tell us a bit about yourself or your company..." rows={3} />
              </div>

              {/* Founder Specific Fields (Corrected) */}
              {profile.role === 'founder' && (
                <>
                  <hr className="my-4 md:my-6" />
                  <h2 className="text-lg md:text-xl font-semibold">Founder Details</h2>
                  <div className="space-y-4 md:space-y-6">
                    <div className="space-y-1">
                      <Label htmlFor="company_name">Company Name</Label>
                      <Input id="company_name" name="company_name" value={profile.company_name || ''} onChange={handleInputChange} placeholder="Your company's name" required/>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="company_website">Company Website</Label>
                      <Input id="company_website" name="company_website" type="url" value={profile.company_website || ''} onChange={handleInputChange} placeholder="https://yourcompany.com" required/>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="industry">Industry</Label> {/* Corrected */} 
                      <Input id="industry" name="industry" value={profile.industry || ''} onChange={handleInputChange} placeholder="e.g., SaaS, Fintech, E-commerce" required/>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="funding_stage">Funding Stage</Label> {/* Corrected */} 
                      <Input id="funding_stage" name="funding_stage" value={profile.funding_stage || ''} onChange={handleInputChange} placeholder="e.g., Bootstrapped, Pre-seed, Series A" />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="expertise_seeking">Expertise Seeking</Label> {/* Corrected */} 
                      <Input id="expertise_seeking" name="expertise_seeking" value={profile.expertise_seeking || ''} onChange={handleInputChange} placeholder="e.g., Marketing, Sales, Engineering Leadership" />
                    </div>
                    {/* Removed open_roles_description as it's not in the schema */}
                  </div>
                </>
              )}
              
              {/* Recruiter Specific Fields (Add if needed) */}
              {/* {profile.role === 'recruiter' && ( ... )} */}
              
            </CardContent>
            <CardFooter className="flex items-center justify-end space-x-4 border-t pt-6">
              {success && <p className="text-green-600 text-sm mr-auto">{success}</p>}
              {/* Display save error specifically */}
              {error && saving && <p className="text-red-500 text-sm mr-auto">{error}</p>}
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </Layout>
  );
}

