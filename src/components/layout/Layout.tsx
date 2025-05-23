"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

// Define the structure for profile data (role is the most critical part here)
interface ProfileRole {
  role: 'founder' | 'recruiter' | 'admin' | null;
}

// Responsive Navigation Bar
const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<ProfileRole['role']>(null);
  const [user, setUser] = useState<User | null>(null);
  const supabase = createClient();
  const router = useRouter();

  const fetchUserRole = useCallback(async (currentUser: User) => {
    console.log('Navbar: Fetching role for user:', currentUser.id);
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', currentUser.id)
        .single();

      if (error) {
        // Log error but don't necessarily block UI, maybe role is set but other details missing
        console.error('Navbar: Error fetching profile role:', error.message);
        // If profile doesn't exist (PGRST116), role is effectively null
        if (error.code !== 'PGRST116') {
           // Handle other potential errors
        }
        setUserRole(null); // Explicitly set null if fetch fails
      } else if (profile) {
        console.log('Navbar: Fetched role:', profile.role);
        setUserRole(profile.role as ProfileRole['role']);
      } else {
        console.warn('Navbar: Profile not found for user, setting role to null.');
        setUserRole(null); // Set null if no profile found
      }
    } catch (err) {
      console.error('Navbar: Unexpected error fetching role:', err);
      setUserRole(null);
    }
  }, [supabase]);

  useEffect(() => {
    const checkAuthAndFetchRole = async () => {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchUserRole(session.user);
      } else {
        setUserRole(null); // Clear role if no session
      }
      if (sessionError) {
        console.error('Navbar: Error getting session:', sessionError.message);
      }
    };

    checkAuthAndFetchRole();

    // Listen for auth changes (login/logout)
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Navbar: Auth state changed:', event);
      setIsLoggedIn(!!session);
      setUser(session?.user ?? null);
      if (session?.user) {
        // Re-fetch role on auth change
        await fetchUserRole(session.user);
      } else {
        setUserRole(null); // Clear role on logout
      }
    });

    // Cleanup listener on component unmount
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [supabase, fetchUserRole]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsMobileMenuOpen(false); // Close mobile menu on logout
    setUserRole(null); // Clear role immediately on logout
    router.push('/login'); // Redirect to login page
    // No need for router.refresh() usually, state updates should handle it
  };

  // Define links - Filter based on fetched userRole
  const navLinks = [
    { href: '/directory', label: 'Directory', roles: ['founder', 'recruiter', 'admin'] },
    { href: '/jobs', label: 'Jobs', roles: ['founder', 'recruiter', 'admin'] },
    { href: '/events', label: 'Events', roles: ['founder', 'recruiter', 'admin'] },
    { href: '/jobs/post', label: 'Post Job', roles: ['recruiter', 'founder'] }, // Allow founders to post too
    { href: '/admin/approvals', label: 'Admin', roles: ['admin'] }, // Admin dashboard link
  ];

  const visibleNavLinks = isLoggedIn ? navLinks.filter(link => userRole && link.roles.includes(userRole)) : [];

  return (
    <nav className="bg-gray-800 text-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand Name */}
          <Link href="/" className="font-bold text-xl hover:text-gray-300">
            FounderBuilt
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-4">
            {visibleNavLinks.map((link) => (
              <Link key={link.href} href={link.href} className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700">
                {link.label}
              </Link>
            ))}
            {isLoggedIn ? (
              <>
                <Link href="/settings/profile" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700">
                  Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-3 py-2 rounded-md text-sm font-medium text-red-400 hover:bg-gray-700 hover:text-red-300"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700">
                  Login
                </Link>
                <Link href="/signup" className="px-3 py-2 rounded-md text-sm font-medium bg-indigo-600 hover:bg-indigo-700">
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            {isLoggedIn ? (
              <button
                onClick={toggleMobileMenu}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                aria-controls="mobile-menu"
                aria-expanded={isMobileMenuOpen}
              >
                <span className="sr-only">Open main menu</span>
                {isMobileMenuOpen ? (
                  <X className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Menu className="block h-6 w-6" aria-hidden="true" />
                )}
              </button>
            ) : (
               <Link href="/login" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700">
                  Login
                </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:hidden`} id="mobile-menu">
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {visibleNavLinks.map((link) => (
            <Link key={link.href} href={link.href} onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-700">
              {link.label}
            </Link>
          ))}
          {isLoggedIn ? (
            <>
              <Link href="/settings/profile" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-700">
                Settings
              </Link>
              <button
                onClick={handleLogout}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-400 hover:bg-gray-700 hover:text-red-300"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-700">
                Login
              </Link>
              <Link href="/signup" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium bg-indigo-600 hover:bg-indigo-700">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

// Basic Footer
const Footer = () => {
  return (
    <footer className="bg-gray-200 text-center p-4 mt-8">
      <div className="container mx-auto text-sm">
        © {new Date().getFullYear()} FounderBuilt. All rights reserved.
        <div className="mt-2 space-x-4">
          <Link href="/terms" className="text-blue-600 hover:underline">Terms of Use</Link>
          <Link href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>
        </div>
      </div>
    </footer>
  );
};

// Basic Layout Component
interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;

