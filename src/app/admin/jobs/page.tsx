"use client";

import React, { useState, useEffect } from 'react';
import AdminLayout from '../layout'; // Adjust import path if needed
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card'; // Use Card for container
// Import Supabase client
// import { createClient } from '@/lib/supabase/client';

// Placeholder data structure for a job posting (Admin view)
interface AdminJobPosting {
  id: string;
  title: string;
  postedByEmail: string; // Email of the recruiter who posted
  jobType: string;
  geography: string;
  isActive: boolean;
  createdAt: string;
  // Fields for editing
  description?: string;
  compensationDetails?: string;
}

// Placeholder data - replace with actual Supabase fetch
const placeholderJobs: AdminJobPosting[] = [
  {
    id: 'j1',
    title: 'Frontend Developer',
    postedByEmail: 'recruiter1@example.com',
    jobType: 'full-time',
    geography: 'Remote',
    isActive: true,
    createdAt: '2025-05-04T10:00:00Z',
    description: 'Looking for a skilled React developer.',
    compensationDetails: '$100k - $120k + Equity',
  },
  {
    id: 'j2',
    title: 'Growth Marketing Advisor',
    postedByEmail: 'recruiter2@example.com',
    jobType: 'advisory',
    geography: 'Remote (US)',
    isActive: true,
    createdAt: '2025-05-05T12:30:00Z',
    description: 'Need help scaling our user acquisition.',
    compensationDetails: 'Hourly Rate or Project Fee',
  },
  {
    id: 'j3',
    title: 'Fractional CTO',
    postedByEmail: 'recruiter1@example.com',
    jobType: 'fractional',
    geography: 'New York City (Hybrid)',
    isActive: false, // Example of inactive job
    createdAt: '2025-05-03T08:00:00Z',
    description: 'Early-stage startup seeking technical leadership.',
    compensationDetails: 'Equity + Stipend',
  },
];

export default function JobManagementPage() {
  const [jobs, setJobs] = useState<AdminJobPosting[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<AdminJobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [editingJob, setEditingJob] = useState<AdminJobPosting | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // const supabase = createClient();

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      setError(null);
      console.log("Fetching jobs for admin...");
      // TODO: Implement Supabase fetch logic
      await new Promise(resolve => setTimeout(resolve, 400));
      setJobs(placeholderJobs);
      setFilteredJobs(placeholderJobs);
      setLoading(false);
    };

    fetchJobs();
  }, []);

  // Filter jobs based on search term and status
  useEffect(() => {
    let result = jobs;
    if (filterStatus !== 'all') {
      result = result.filter(job => job.isActive === (filterStatus === 'active'));
    }
    if (searchTerm) {
      const lowerCaseSearch = searchTerm.toLowerCase();
      result = result.filter(job =>
        job.title.toLowerCase().includes(lowerCaseSearch) ||
        job.postedByEmail.toLowerCase().includes(lowerCaseSearch) ||
        job.jobType.toLowerCase().includes(lowerCaseSearch) ||
        job.geography.toLowerCase().includes(lowerCaseSearch)
      );
    }
    setFilteredJobs(result);
  }, [searchTerm, filterStatus, jobs]);

  const handleEditJob = (job: AdminJobPosting) => {
    setEditingJob(JSON.parse(JSON.stringify(job))); // Deep copy
  };

  const handleSaveEdit = async () => {
    if (!editingJob) return;
    setIsSaving(true);
    setError(null);
    console.log("Saving job edits:", editingJob);

    // TODO: Implement Supabase update logic
    await new Promise(resolve => setTimeout(resolve, 600));
    setJobs(prev => prev.map(j => j.id === editingJob.id ? editingJob : j));
    setEditingJob(null); // Close dialog
    setIsSaving(false);
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!window.confirm("Are you sure you want to delete this job posting? This action cannot be undone.")) {
      return;
    }
    setIsDeleting(true);
    setError(null);
    console.log("Deleting job:", jobId);

    // TODO: Implement Supabase delete logic
    await new Promise(resolve => setTimeout(resolve, 600));
    setJobs(prev => prev.filter(j => j.id !== jobId));
    setIsDeleting(false);
  };

  return (
    <AdminLayout>
      <h2 className="text-xl font-semibold mb-4">Job Management</h2>

      {/* Responsive Filters */} 
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <Input
          placeholder="Search jobs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as 'all' | 'active' | 'inactive')}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by status..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading && <p className="text-center py-4">Loading jobs...</p>}
      {error && <p className="text-red-500 mb-4 text-center py-4">{error}</p>}

      {!loading && !error && (
        <Card>
          {/* Add horizontal scroll container for the table */}
          <div className="overflow-x-auto">
            <Table className="min-w-full"> {/* Ensure table takes minimum full width */}
              <TableHeader>
                <TableRow>
                  <TableHead className="whitespace-nowrap">Title</TableHead>
                  <TableHead className="whitespace-nowrap">Posted By</TableHead>
                  <TableHead className="whitespace-nowrap">Type</TableHead>
                  <TableHead className="whitespace-nowrap">Location</TableHead>
                  <TableHead className="whitespace-nowrap">Status</TableHead>
                  <TableHead className="whitespace-nowrap">Posted Date</TableHead>
                  <TableHead className="text-right whitespace-nowrap">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredJobs.length > 0 ? (
                  filteredJobs.map((job) => (
                    <TableRow key={job.id}>
                      <TableCell className="font-medium whitespace-nowrap">{job.title}</TableCell>
                      <TableCell className="whitespace-nowrap">{job.postedByEmail}</TableCell>
                      <TableCell className="capitalize whitespace-nowrap">{job.jobType}</TableCell>
                      <TableCell className="whitespace-nowrap">{job.geography}</TableCell>
                      <TableCell className="whitespace-nowrap">{job.isActive ? 'Active' : 'Inactive'}</TableCell>
                      <TableCell className="whitespace-nowrap">{new Date(job.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right space-x-2 whitespace-nowrap">
                        <Dialog open={editingJob?.id === job.id} onOpenChange={(isOpen) => !isOpen && setEditingJob(null)}>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => handleEditJob(job)}>
                              Edit
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[600px]">
                            <DialogHeader>
                              <DialogTitle>Edit Job: {editingJob?.title}</DialogTitle>
                              <DialogDescription>
                                Modify job details below.
                              </DialogDescription>
                            </DialogHeader>
                            {editingJob && (
                              <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="edit-title" className="text-right">Title</Label>
                                  <Input id="edit-title" value={editingJob.title} onChange={(e) => setEditingJob({...editingJob, title: e.target.value})} className="col-span-3" />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="edit-description" className="text-right">Description</Label>
                                  <Textarea id="edit-description" value={editingJob.description || ''} onChange={(e) => setEditingJob({...editingJob, description: e.target.value})} className="col-span-3" />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="edit-jobType" className="text-right">Job Type</Label>
                                  <Select value={editingJob.jobType} onValueChange={(value) => setEditingJob({...editingJob, jobType: value})} >
                                    <SelectTrigger id="edit-jobType" className="col-span-3">
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
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="edit-geography" className="text-right">Geography</Label>
                                  <Input id="edit-geography" value={editingJob.geography} onChange={(e) => setEditingJob({...editingJob, geography: e.target.value})} className="col-span-3" />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="edit-compensation" className="text-right">Compensation</Label>
                                  <Input id="edit-compensation" value={editingJob.compensationDetails || ''} onChange={(e) => setEditingJob({...editingJob, compensationDetails: e.target.value})} className="col-span-3" />
                                </div>
                                <div className="flex items-center space-x-2 col-start-2 col-span-3">
                                  <Checkbox id="edit-isActive" checked={editingJob.isActive} onCheckedChange={(checked) => setEditingJob({...editingJob, isActive: !!checked})} />
                                  <Label htmlFor="edit-isActive">Active</Label>
                                </div>
                              </div>
                            )}
                            <DialogFooter>
                              <DialogClose asChild>
                                <Button variant="outline">Cancel</Button>
                              </DialogClose>
                              <Button onClick={handleSaveEdit} disabled={isSaving}>
                                {isSaving ? 'Saving...' : 'Save Changes'}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteJob(job.id)}
                          disabled={isDeleting}
                        >
                          {isDeleting ? '...' : 'Delete'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center h-24">No jobs found matching criteria.</TableCell>
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

