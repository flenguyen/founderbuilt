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

// Define the structure for profile data from Supabase
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
  // Founder specific
  industry_experience: string | null;
  funding_type: string | null;
  expertise: string | null;
  open_roles_description: string | null;
  // Recruiter specific (add if needed)
}

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
        // Handle case where profile might not exist yet (though trigger should create it)
        if (profileError.code === 'PGRST116') { 
          console.warn('Profile not found for user, might be new signup.');
          // Initialize a default profile structure based on role if possible
          // This case should ideally be handled by the signup trigger
          setError('Profile not found. Please try logging out and back in.');
        } else {
          throw profileError;
        }
      } 
      
      if (data) {
        setProfile(data as ProfileData);
      } else if (!profileError) {
         // Should not happen if profileError is handled correctly, but as a fallback
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

    // Prepare data for Supabase update, ensuring required fields are present
    const updates = {
      first_name: profile.first_name,
      last_name: profile.last_name,
      profile_photo_url: profile.profile_photo_url,
      linkedin_url: profile.linkedin_url,
      location: profile.location,
      profile_blurb: profile.profile_blurb,
      // Include founder fields only if the role is founder
      ...(profile.role === 'founder' && {
        industry_experience: profile.industry_experience,
        funding_type: profile.funding_type,
        expertise: profile.expertise,
        open_roles_description: profile.open_roles_description,
      }),
      // Mark profile as complete if essential fields are filled (customize this logic)
      is_profile_complete: !!(profile.first_name && profile.last_name && profile.location), 
      updated_at: new Date().toISOString(), // Manually update timestamp
    };

    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (updateError) throw updateError;

      setSuccess('Profile updated successfully!');
      // Optionally update local profile state if needed, though fetch on load handles it
      // setProfile(prev => prev ? { ...prev, ...updates, is_profile_complete: updates.is_profile_complete } : null);
      
      // Check if profile is now complete and redirect if coming from incomplete state?
      // const searchParams = new URLSearchParams(window.location.search);
      // if (updates.is_profile_complete && searchParams.get('incomplete')) {
      //   router.push('/'); // Redirect to home after completing profile
      // }

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
                <Input id="linkedin_url" name="linkedin_url" type="url" value={profile.linkedin_url || ''} onChange={handleInputChange} placeholder="https://linkedin.com/in/..." />
              </div>

              <div className="space-y-1">
                <Label htmlFor="location">Location</Label>
                <Input id="location" name="location" value={profile.location || ''} onChange={handleInputChange} placeholder="e.g., City, State, Country" required/>
              </div>

              <div className="space-y-1">
                <Label htmlFor="profile_blurb">Profile Blurb / Short Bio</Label>
                <Textarea id="profile_blurb" name="profile_blurb" value={profile.profile_blurb || ''} onChange={handleInputChange} placeholder="Tell us a bit about yourself or your company..." rows={3} />
              </div>

              {/* Founder Specific Fields */}
              {profile.role === 'founder' && (
                <>
                  <hr className="my-4 md:my-6" />
                  <h2 className="text-lg md:text-xl font-semibold">Founder Details</h2>
                  <div className="space-y-4 md:space-y-6">
                    <div className="space-y-1">
                      <Label htmlFor="industry_experience">Industry Experience</Label>
                      <Input id="industry_experience" name="industry_experience" value={profile.industry_experience || ''} onChange={handleInputChange} placeholder="e.g., SaaS, Fintech, E-commerce" />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="funding_type">Funding Type / Stage</Label>
                      <Input id="funding_type" name="funding_type" value={profile.funding_type || ''} onChange={handleInputChange} placeholder="e.g., Bootstrapped, Pre-seed, Series A" />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="expertise">Areas of Expertise</Label>
                      <Input id="expertise" name="expertise" value={profile.expertise || ''} onChange={handleInputChange} placeholder="e.g., Product Management, Go-to-Market, Engineering" />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="open_roles_description">Open Roles / Hiring Needs</Label>
                      <Textarea id="open_roles_description" name="open_roles_description" value={profile.open_roles_description || ''} onChange={handleInputChange} placeholder="Describe the key roles you are currently hiring for..." rows={3} />
                    </div>
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

