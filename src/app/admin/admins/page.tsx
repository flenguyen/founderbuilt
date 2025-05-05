"use client";

import React, { useState, useEffect } from 'react';
import AdminLayout from '../layout'; // Adjust import path if needed
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card'; // Use Card for container
// Import Supabase client
// import { createClient } from '@/lib/supabase/client';

// Placeholder data structure for an admin user
interface AdminUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  createdAt: string;
}

// Placeholder data - replace with actual Supabase fetch
const placeholderAdmins: AdminUser[] = [
  {
    id: 'admin1',
    email: 'admin@example.com',
    firstName: 'Admin',
    lastName: 'User',
    createdAt: '2025-04-30T09:00:00Z',
  },
  {
    id: 'admin2',
    email: 'another.admin@example.com',
    firstName: 'Jane',
    lastName: 'Doe',
    createdAt: '2025-05-01T11:00:00Z',
  },
];

export default function AdminManagementPage() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null); // Track which admin is being deleted

  // const supabase = createClient();

  useEffect(() => {
    const fetchAdmins = async () => {
      setLoading(true);
      setError(null);
      console.log("Fetching admin users...");
      // TODO: Implement Supabase fetch logic
      await new Promise(resolve => setTimeout(resolve, 400));
      setAdmins(placeholderAdmins);
      setLoading(false);
    };

    fetchAdmins();
  }, []);

  const handleAddAdmin = async () => {
    if (!newAdminEmail) {
      setError('Please enter the email address of the user to promote to admin.');
      return;
    }
    setIsAdding(true);
    setError(null);
    console.log("Promoting user to admin:", newAdminEmail);

    // TODO: Implement Supabase logic to find user by email and update their role
    await new Promise(resolve => setTimeout(resolve, 600));
    const newAdmin: AdminUser = {
        id: `new-admin-${Date.now()}`,
        email: newAdminEmail,
        createdAt: new Date().toISOString(),
    };
    setAdmins(prev => [newAdmin, ...prev]);
    setNewAdminEmail('');
    setIsAdding(false);
    // Consider closing the dialog here if it's open
  };

  const handleRemoveAdmin = async (adminId: string, adminEmail: string) => {
    // TODO: Add check to prevent self-demotion

    if (!window.confirm(`Are you sure you want to remove admin privileges from ${adminEmail}? They will be demoted to a default role (e.g., Founder).`)) {
      return;
    }
    setDeletingId(adminId);
    setError(null);
    console.log("Removing admin privileges:", adminId);

    // TODO: Implement Supabase logic to update user role
    await new Promise(resolve => setTimeout(resolve, 600));
    setAdmins(prev => prev.filter(a => a.id !== adminId));
    setDeletingId(null);
  };

  return (
    <AdminLayout>
      <h2 className="text-xl font-semibold mb-4">Admin Management</h2>

      {/* Add Admin Form */} 
      <Dialog onOpenChange={(isOpen) => { if (!isOpen) setError(null); }}> {/* Clear error on close */}
        <DialogTrigger asChild>
          <Button className="mb-6">Add New Admin</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Admin</DialogTitle>
            <DialogDescription>
              Enter the email address of the existing user you want to promote to an administrator.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">Email</Label>
              <Input 
                id="email" 
                type="email" 
                value={newAdminEmail} 
                onChange={(e) => setNewAdminEmail(e.target.value)} 
                className="col-span-3" 
                placeholder="user@example.com"
              />
            </div>
          </div>
          {error && <p className="text-red-500 text-sm px-6 pb-2">{error}</p>}
          <DialogFooter>
            <DialogClose asChild>
                 <Button variant="outline">Cancel</Button>
            </DialogClose>
            {/* Use DialogClose on success? */}
            <Button onClick={handleAddAdmin} disabled={isAdding}>
              {isAdding ? 'Adding...' : 'Promote to Admin'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {loading && <p className="text-center py-4">Loading admins...</p>}
      {!loading && error && <p className="text-red-500 mb-4 text-center py-4">{error}</p>}

      {!loading && !error && (
        <Card>
          {/* Add horizontal scroll container for the table */}
          <div className="overflow-x-auto">
            <Table className="min-w-full"> {/* Ensure table takes minimum full width */}
              <TableHeader>
                <TableRow>
                  <TableHead className="whitespace-nowrap">Email</TableHead>
                  <TableHead className="whitespace-nowrap">Name</TableHead>
                  <TableHead className="whitespace-nowrap">Admin Since</TableHead>
                  <TableHead className="text-right whitespace-nowrap">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {admins.length > 0 ? (
                  admins.map((admin) => (
                    <TableRow key={admin.id}>
                      <TableCell className="whitespace-nowrap">{admin.email}</TableCell>
                      <TableCell className="whitespace-nowrap">{admin.firstName || '-'} {admin.lastName || ''}</TableCell>
                      <TableCell className="whitespace-nowrap">{new Date(admin.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRemoveAdmin(admin.id, admin.email)}
                          disabled={deletingId === admin.id}
                          // Optional: Disable removing self
                          // disabled={deletingId === admin.id || currentUser?.id === admin.id}
                        >
                          {deletingId === admin.id ? '...' : 'Remove Admin'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center h-24">No admin users found.</TableCell>
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

