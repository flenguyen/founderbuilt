"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation'; // Import usePathname
import Link from 'next/link'; // Use Link for navigation
import Layout from '@/components/layout/Layout'; // Main app layout
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'; // Drawer for mobile nav
import { Button } from '@/components/ui/button';
import { Menu, Users, Briefcase, UserCheck, ShieldCheck, CreditCard } from 'lucide-react'; // Icons
// Import Supabase client
// import { createClient } from '@/lib/supabase/client';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const adminNavLinks = [
  { href: '/admin/approvals', label: 'Founder Approvals', icon: UserCheck },
  { href: '/admin/users', label: 'User Management', icon: Users },
  { href: '/admin/jobs', label: 'Job Management', icon: Briefcase },
  { href: '/admin/recruiters', label: 'Recruiter Tiers', icon: CreditCard },
  { href: '/admin/admins', label: 'Admin Management', icon: ShieldCheck },
];

// Navigation component for reuse
const AdminNavigation: React.FC<{ closeSheet?: () => void }> = ({ closeSheet }) => {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col space-y-1 p-2">
      {adminNavLinks.map((link) => {
        const isActive = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={closeSheet} // Close sheet on link click
            className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${isActive
                ? 'bg-gray-200 text-gray-900'
                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              }`}
          >
            <link.icon className="mr-3 h-5 w-5" aria-hidden="true" />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
};

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // const supabase = createClient();

  useEffect(() => {
    const checkAdminStatus = async () => {
      setLoading(true);
      console.log("Checking admin status...");
      // TODO: Implement actual check using Supabase auth and profile data
      await new Promise(resolve => setTimeout(resolve, 300));
      console.log("Placeholder: Assuming user is admin.");
      setIsAdmin(true);
      setLoading(false);
    };

    checkAdminStatus();
  }, [router]);

  if (loading) {
    return <Layout><p className="text-center py-10">Checking access...</p></Layout>;
  }

  if (!isAdmin) {
    return <Layout><p className="text-center py-10 text-red-500">Access Denied. You must be an administrator to view this page.</p></Layout>;
  }

  return (
    <Layout>
      <div className="py-8 md:py-12">
        {/* Mobile Header with Drawer Toggle */}
        <div className="md:hidden flex justify-between items-center mb-4 px-4 sm:px-6">
          <h1 className="text-xl font-bold text-gray-900">Admin Menu</h1>
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open Admin Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 sm:w-80">
              <AdminNavigation closeSheet={() => setIsSheetOpen(false)} />
            </SheetContent>
          </Sheet>
        </div>

        {/* Main Content Area with Sidebar */} 
        <div className="flex flex-col md:flex-row gap-6 lg:gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden md:block w-full md:w-64 lg:w-72 flex-shrink-0">
            <div className="sticky top-20"> {/* Adjust top offset based on main navbar height */}
              <AdminNavigation />
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-grow min-w-0"> {/* Ensure main content can shrink */}
            {children}
          </main>
        </div>
      </div>
    </Layout>
  );
};

export default AdminLayout;

