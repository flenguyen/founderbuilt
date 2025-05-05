"use client";

import React, { useState, useEffect } from 'react';
import AdminLayout from '../layout'; // Adjust import path if needed
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card'; // Use Card for container
// Import Supabase client
// import { createClient } from '@/lib/supabase/client';

// Placeholder data structure for a recruiter (Admin view)
interface AdminRecruiter {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  recruiterTier: 'free' | 'paid';
  stripeSubscriptionStatus?: string; // e.g., 'active', 'canceled', 'past_due'
  createdAt: string;
}

// Placeholder data - replace with actual Supabase fetch
const placeholderRecruiters: AdminRecruiter[] = [
  {
    id: 'r1-free',
    email: 'recruiter1@example.com',
    firstName: 'Bob',
    lastName: 'Jones',
    recruiterTier: 'free',
    createdAt: '2025-05-02T11:00:00Z',
  },
  {
    id: 'r2-paid',
    email: 'recruiter2@example.com',
    firstName: 'Carol',
    lastName: 'Williams',
    recruiterTier: 'paid',
    stripeSubscriptionStatus: 'active',
    createdAt: '2025-05-03T12:00:00Z',
  },
  {
    id: 'r3-canceled',
    email: 'recruiter3@example.com',
    firstName: 'David',
    lastName: 'Miller',
    recruiterTier: 'free', // Tier reverts to free on cancellation
    stripeSubscriptionStatus: 'canceled',
    createdAt: '2025-05-01T15:00:00Z',
  },
];

export default function RecruiterTierManagementPage() {
  const [recruiters, setRecruiters] = useState<AdminRecruiter[]>([]);
  const [filteredRecruiters, setFilteredRecruiters] = useState<AdminRecruiter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTier, setFilterTier] = useState<'all' | 'free' | 'paid'>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // const supabase = createClient();

  useEffect(() => {
    const fetchRecruiters = async () => {
      setLoading(true);
      setError(null);
      console.log("Fetching recruiters for admin...");
      // TODO: Implement Supabase fetch logic
      await new Promise(resolve => setTimeout(resolve, 400));
      setRecruiters(placeholderRecruiters);
      setFilteredRecruiters(placeholderRecruiters);
      setLoading(false);
    };

    fetchRecruiters();
  }, []);

  // Filter recruiters based on search term and tier
  useEffect(() => {
    let result = recruiters;
    if (filterTier !== 'all') {
      result = result.filter(recruiter => recruiter.recruiterTier === filterTier);
    }
    if (searchTerm) {
      const lowerCaseSearch = searchTerm.toLowerCase();
      result = result.filter(recruiter =>
        recruiter.email.toLowerCase().includes(lowerCaseSearch) ||
        (recruiter.firstName && recruiter.firstName.toLowerCase().includes(lowerCaseSearch)) ||
        (recruiter.lastName && recruiter.lastName.toLowerCase().includes(lowerCaseSearch))
      );
    }
    setFilteredRecruiters(result);
  }, [searchTerm, filterTier, recruiters]);

  const handleManualTierChange = async (recruiterId: string, newTier: 'free' | 'paid') => {
    if (!window.confirm(`Are you sure you want to manually change this recruiter's tier to ${newTier}? This might override their Stripe subscription status.`)) {
      return;
    }
    setUpdatingId(recruiterId);
    setError(null);
    console.log(`Manually changing tier for ${recruiterId} to ${newTier}...`);

    // TODO: Implement Supabase update logic
    await new Promise(resolve => setTimeout(resolve, 600));
    setRecruiters(prev => prev.map(r => r.id === recruiterId ? { ...r, recruiterTier: newTier } : r));
    setUpdatingId(null);
  };

  return (
    <AdminLayout>
      <h2 className="text-xl font-semibold mb-4">Recruiter Tier Management</h2>

      {/* Responsive Filters */} 
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <Input
          placeholder="Search recruiters..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Select value={filterTier} onValueChange={(value) => setFilterTier(value as 'all' | 'free' | 'paid')}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by tier..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tiers</SelectItem>
            <SelectItem value="free">Free</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading && <p className="text-center py-4">Loading recruiters...</p>}
      {error && <p className="text-red-500 mb-4 text-center py-4">{error}</p>}

      {!loading && !error && (
        <Card>
          {/* Add horizontal scroll container for the table */}
          <div className="overflow-x-auto">
            <Table className="min-w-full"> {/* Ensure table takes minimum full width */}
              <TableHeader>
                <TableRow>
                  <TableHead className="whitespace-nowrap">Email</TableHead>
                  <TableHead className="whitespace-nowrap">Name</TableHead>
                  <TableHead className="whitespace-nowrap">Current Tier</TableHead>
                  <TableHead className="whitespace-nowrap">Stripe Status</TableHead>
                  <TableHead className="whitespace-nowrap">Joined</TableHead>
                  <TableHead className="text-right whitespace-nowrap">Manual Override</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecruiters.length > 0 ? (
                  filteredRecruiters.map((recruiter) => (
                    <TableRow key={recruiter.id}>
                      <TableCell className="whitespace-nowrap">{recruiter.email}</TableCell>
                      <TableCell className="whitespace-nowrap">{recruiter.firstName || '-'} {recruiter.lastName || ''}</TableCell>
                      <TableCell className="capitalize font-medium whitespace-nowrap">{recruiter.recruiterTier}</TableCell>
                      <TableCell className="capitalize whitespace-nowrap">{recruiter.stripeSubscriptionStatus || '-'}</TableCell>
                      <TableCell className="whitespace-nowrap">{new Date(recruiter.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right space-x-2 whitespace-nowrap">
                        {recruiter.recruiterTier === 'free' ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleManualTierChange(recruiter.id, 'paid')}
                            disabled={updatingId === recruiter.id}
                          >
                            {updatingId === recruiter.id ? '...' : 'Upgrade to Paid'}
                          </Button>
                        ) : (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleManualTierChange(recruiter.id, 'free')}
                            disabled={updatingId === recruiter.id}
                          >
                            {updatingId === recruiter.id ? '...' : 'Downgrade to Free'}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center h-24">No recruiters found matching criteria.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}
    </AdminLayout>
  );
}

