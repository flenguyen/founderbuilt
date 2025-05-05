"use client";

import React, { useState, useEffect } from 'react';
import AdminLayout from '../layout'; // Adjust import path if needed
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card } from '@/components/ui/card'; // Use Card for container
// Import Supabase client
// import { createClient } from '@/lib/supabase/client';

// Placeholder data structure for a pending founder
interface PendingFounder {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  linkedinUrl?: string;
  submittedAt: string; // Use string for simplicity
}

// Placeholder data - replace with actual Supabase fetch
const placeholderPendingFounders: PendingFounder[] = [
  {
    id: 'f1-pending',
    email: 'pending1@example.com',
    firstName: 'Peter',
    lastName: 'Pan',
    linkedinUrl: 'https://linkedin.com/in/peterpan',
    submittedAt: '2025-05-05T14:00:00Z',
  },
  {
    id: 'f2-pending',
    email: 'pending2@example.com',
    firstName: 'Wendy',
    lastName: 'Darling',
    linkedinUrl: 'https://linkedin.com/in/wendydarling',
    submittedAt: '2025-05-04T18:30:00Z',
  },
];

export default function FounderApprovalPage() {
  const [pendingFounders, setPendingFounders] = useState<PendingFounder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // const supabase = createClient();

  useEffect(() => {
    const fetchPendingFounders = async () => {
      setLoading(true);
      setError(null);
      console.log("Fetching pending founders...");
      // TODO: Implement Supabase fetch logic
      await new Promise(resolve => setTimeout(resolve, 400));
      setPendingFounders(placeholderPendingFounders);
      setLoading(false);
    };

    fetchPendingFounders();
  }, []);

  const handleApproval = async (founderId: string, approve: boolean) => {
    setUpdatingId(founderId);
    setError(null);
    const newStatus = approve ? 'approved' : 'rejected';
    console.log(`${approve ? 'Approving' : 'Rejecting'} founder ${founderId}...`);

    // TODO: Implement Supabase update logic
    await new Promise(resolve => setTimeout(resolve, 600));
    setPendingFounders(prev => prev.filter(f => f.id !== founderId));
    setUpdatingId(null);
  };

  return (
    <AdminLayout>
      <h2 className="text-xl font-semibold mb-4">Pending Founder Applications</h2>

      {loading && <p className="text-center py-4">Loading applications...</p>}
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
                  <TableHead className="whitespace-nowrap">LinkedIn</TableHead>
                  <TableHead className="whitespace-nowrap">Submitted</TableHead>
                  <TableHead className="text-right whitespace-nowrap">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingFounders.length > 0 ? (
                  pendingFounders.map((founder) => (
                    <TableRow key={founder.id}>
                      <TableCell className="whitespace-nowrap">{founder.email}</TableCell>
                      <TableCell className="whitespace-nowrap">{founder.firstName || '-'} {founder.lastName || ''}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        {founder.linkedinUrl ? (
                          <a href={founder.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">View Profile</a>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">{new Date(founder.submittedAt).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right space-x-2 whitespace-nowrap">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleApproval(founder.id, true)}
                          disabled={updatingId === founder.id}
                        >
                          {updatingId === founder.id ? '...' : 'Approve'}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleApproval(founder.id, false)}
                          disabled={updatingId === founder.id}
                        >
                          {updatingId === founder.id ? '...' : 'Reject'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center h-24">No pending applications found.</TableCell>
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

