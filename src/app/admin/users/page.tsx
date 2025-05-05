"use client";

import React, { useState, useEffect } from 'react';
import AdminLayout from '../layout'; // Adjust import path if needed
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card'; // Use Card for container
// Import Supabase client
// import { createClient } from '@/lib/supabase/client';

// Placeholder data structure for a user (Founder or Recruiter)
interface User {
  id: string;
  email: string;
  role: 'founder' | 'recruiter' | 'admin';
  firstName?: string;
  lastName?: string;
  createdAt: string;
  // Founder specific
  applicationStatus?: 'not_submitted' | 'pending' | 'approved' | 'rejected';
  // Recruiter specific
  recruiterTier?: 'free' | 'paid';
}

// Placeholder data - replace with actual Supabase fetch
const placeholderUsers: User[] = [
  {
    id: 'f1-approved',
    email: 'founder1@example.com',
    role: 'founder',
    firstName: 'Alice',
    lastName: 'Smith',
    createdAt: '2025-05-01T10:00:00Z',
    applicationStatus: 'approved',
  },
  {
    id: 'r1-free',
    email: 'recruiter1@example.com',
    role: 'recruiter',
    firstName: 'Bob',
    lastName: 'Jones',
    createdAt: '2025-05-02T11:00:00Z',
    recruiterTier: 'free',
  },
  {
    id: 'r2-paid',
    email: 'recruiter2@example.com',
    role: 'recruiter',
    firstName: 'Carol',
    lastName: 'Williams',
    createdAt: '2025-05-03T12:00:00Z',
    recruiterTier: 'paid',
  },
  {
    id: 'admin1',
    email: 'admin@example.com',
    role: 'admin',
    firstName: 'Admin',
    lastName: 'User',
    createdAt: '2025-04-30T09:00:00Z',
  },
];

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // const supabase = createClient();

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      console.log("Fetching users...");
      // TODO: Implement Supabase fetch logic
      await new Promise(resolve => setTimeout(resolve, 400));
      setUsers(placeholderUsers);
      setFilteredUsers(placeholderUsers);
      setLoading(false);
    };

    fetchUsers();
  }, []);

  // Filter users based on search term and role
  useEffect(() => {
    let result = users;
    if (filterRole !== 'all') {
      result = result.filter(user => user.role === filterRole);
    }
    if (searchTerm) {
      const lowerCaseSearch = searchTerm.toLowerCase();
      result = result.filter(user =>
        user.email.toLowerCase().includes(lowerCaseSearch) ||
        (user.firstName && user.firstName.toLowerCase().includes(lowerCaseSearch)) ||
        (user.lastName && user.lastName.toLowerCase().includes(lowerCaseSearch))
      );
    }
    setFilteredUsers(result);
  }, [searchTerm, filterRole, users]);

  const handleEditUser = (user: User) => {
    setEditingUser(JSON.parse(JSON.stringify(user))); // Deep copy to avoid modifying original state directly
  };

  const handleSaveEdit = async () => {
    if (!editingUser) return;
    setIsSaving(true);
    setError(null);
    console.log("Saving user edits:", editingUser);

    // TODO: Implement Supabase update logic
    await new Promise(resolve => setTimeout(resolve, 600));
    setUsers(prev => prev.map(u => u.id === editingUser.id ? editingUser : u));
    setEditingUser(null); // Close dialog
    setIsSaving(false);
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      return;
    }
    setIsDeleting(true); // Consider setting a specific deletingId if needed
    setError(null);
    console.log("Deleting user:", userId);

    // TODO: Implement Supabase delete logic
    await new Promise(resolve => setTimeout(resolve, 600));
    setUsers(prev => prev.filter(u => u.id !== userId));
    setIsDeleting(false);
  };

  return (
    <AdminLayout>
      <h2 className="text-xl font-semibold mb-4">User Management</h2>

      {/* Responsive Filters */} 
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <Input
          placeholder="Search by email or name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Select value={filterRole} onValueChange={setFilterRole}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by role..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="founder">Founder</SelectItem>
            <SelectItem value="recruiter">Recruiter</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading && <p className="text-center py-4">Loading users...</p>}
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
                  <TableHead className="whitespace-nowrap">Role</TableHead>
                  <TableHead className="whitespace-nowrap">Status/Tier</TableHead>
                  <TableHead className="whitespace-nowrap">Joined</TableHead>
                  <TableHead className="text-right whitespace-nowrap">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="whitespace-nowrap">{user.email}</TableCell>
                      <TableCell className="whitespace-nowrap">{user.firstName || '-'} {user.lastName || ''}</TableCell>
                      <TableCell className="capitalize whitespace-nowrap">{user.role}</TableCell>
                      <TableCell className="capitalize whitespace-nowrap">
                        {user.role === 'founder' ? user.applicationStatus || '-' :
                         user.role === 'recruiter' ? user.recruiterTier || '-' : '-'}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right space-x-2 whitespace-nowrap">
                        <Dialog open={editingUser?.id === user.id} onOpenChange={(isOpen) => !isOpen && setEditingUser(null)}>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => handleEditUser(user)}>
                              Edit
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                              <DialogTitle>Edit User: {editingUser?.email}</DialogTitle>
                              <DialogDescription>
                                Modify user details below. Be careful when changing roles.
                              </DialogDescription>
                            </DialogHeader>
                            {editingUser && (
                              <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="edit-firstName" className="text-right">First Name</Label>
                                  <Input id="edit-firstName" value={editingUser.firstName || ''} onChange={(e) => setEditingUser({...editingUser, firstName: e.target.value})} className="col-span-3" />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="edit-lastName" className="text-right">Last Name</Label>
                                  <Input id="edit-lastName" value={editingUser.lastName || ''} onChange={(e) => setEditingUser({...editingUser, lastName: e.target.value})} className="col-span-3" />
                                </div>
                                {/* TODO: Add more editable fields like role, status etc. with appropriate controls */}
                                {/* Example: Role Select */}
                                {/* <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="edit-role" className="text-right">Role</Label>
                                  <Select value={editingUser.role} onValueChange={(value) => setEditingUser({...editingUser, role: value as any})} >
                                    <SelectTrigger id="edit-role" className="col-span-3">
                                      <SelectValue placeholder="Select role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="founder">Founder</SelectItem>
                                      <SelectItem value="recruiter">Recruiter</SelectItem>
                                      <SelectItem value="admin">Admin</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div> */} 
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
                          onClick={() => handleDeleteUser(user.id)}
                          disabled={isDeleting} // Consider disabling delete for the current admin user
                        >
                          {isDeleting ? '...' : 'Delete'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center h-24">No users found matching criteria.</TableCell>
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

