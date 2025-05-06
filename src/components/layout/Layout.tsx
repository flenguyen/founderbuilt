"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // Import useRouter
import { Menu, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client'; // Import Supabase client

// Responsive Navigation Bar
const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<'founder' | 'recruiter' | 'admin' | null>(null);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
      if (session) {
        // Fetch role only if logged in - used for conditional nav links
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
        setUserRole(profile?.role || null);
      }
    };
    checkAuth();

    // Listen for auth changes (login/logout)
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setIsLoggedIn(!!session);
      if (session) {
        // Re-fetch role on auth change if needed, or rely on page reload/navigation
        const fetchRole = async () => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();
          setUserRole(profile?.role || null);
        };
        fetchRole();
      } else {
        setUserRole(null);
      }
    });

    // Cleanup listener on component unmount
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [supabase]); // Add supabase to dependency array

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsMobileMenuOpen(false); // Close mobile menu on logout
    router.push('/login'); // Redirect to login page
    router.refresh(); // Ensure state is cleared
  };

  const navLinks = [
    { href: '/directory', label: 'Directory', roles: ['founder', 'recruiter', 'admin'] },
    { href: '/jobs', label: 'Jobs', roles: ['founder', 'recruiter', 'admin'] },
    { href: '/events', label: 'Events', roles: ['founder', 'recruiter', 'admin'] },
    // Conditional links based on role
    ...(userRole === 'recruiter' || userRole === 'founder' ? [{ href: '/jobs/post', label: 'Post Job', roles: ['recruiter', 'founder'] }] : []), // Allow founders to post too
    ...(userRole === 'admin' ? [{ href: '/admin/approvals', label: 'Admin', roles: ['admin'] }] : []),
  ];

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
            {isLoggedIn && navLinks.filter(link => link.roles.includes(userRole || '')).map((link) => (
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
            {isLoggedIn && (
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
            )}
            {!isLoggedIn && (
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
          {isLoggedIn && navLinks.filter(link => link.roles.includes(userRole || '')).map((link) => (
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

// Basic Footer (already reasonably responsive)
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
      {/* Adjusted padding for different screen sizes */}
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;

