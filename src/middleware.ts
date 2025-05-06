import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Helper function to create Supabase client within middleware
const createSupabaseMiddlewareClient = (request: NextRequest, response: NextResponse) => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Middleware: Missing Supabase URL or Anon Key");
    return null;
  }

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        request.cookies.set({ name, value, ...options });
        response = NextResponse.next({ request: { headers: request.headers } });
        response.cookies.set({ name, value, ...options });
      },
      remove(name: string, options: CookieOptions) {
        request.cookies.set({ name, value: "", ...options });
        response = NextResponse.next({ request: { headers: request.headers } });
        response.cookies.set({ name, value: "", ...options });
      },
    },
  });
};

// Helper function to check if essential profile fields are filled
const isProfileComplete = (profile: any): boolean => {
  if (!profile) return false;
  // Check for common essential fields: first_name, last_name, linkedin_url
  const commonEssentialFields = ["first_name", "last_name", "linkedin_url"];
  const commonFieldsFilled = commonEssentialFields.every(field => profile[field] && String(profile[field]).trim() !== "");
  
  if (!commonFieldsFilled) return false;

  // Check for founder-specific essential fields only if the role is founder
  if (profile.role === "founder") {
    const founderEssentialFields = ["company_name", "company_website", "industry"];
    const founderFieldsFilled = founderEssentialFields.every(field => profile[field] && String(profile[field]).trim() !== "");
    if (!founderFieldsFilled) return false;
  }
  
  // Add checks for other roles if needed

  return true; // All required fields for the role are filled
};

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createSupabaseMiddlewareClient(request, response);

  if (!supabase) {
    return response; 
  }

  const { data: { session } } = await supabase.auth.getSession();
  const { pathname } = request.nextUrl;

  const publicPaths = ["/login", "/signup", "/auth/callback"];
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path));
  const isSettingsPath = pathname.startsWith("/settings");
  const isPendingApprovalPath = pathname.startsWith("/pending-approval");

  // --- Authentication Checks ---
  if (!session && !isPublicPath) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (session && isPublicPath && pathname !== "/auth/callback") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // --- Role-Based Access Control & Profile Completion (if session exists) ---
  if (session) {
    // Fetch user profile including fields needed for completeness check
    // Ensure first_name and last_name are fetched
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role, application_status, first_name, last_name, linkedin_url, company_name, company_website, industry") 
      .eq("id", session.user.id)
      .single();

    // Allow access to settings if profile fetch fails (likely new user needs to create profile)
    // Also bypass this initial redirect for admins, as they might not have a full profile initially
    if (profileError && !isSettingsPath && profile?.role !== 'admin') {
        console.error("Middleware: Error fetching profile:", profileError.message);
        // Redirect non-admins to settings if profile fetch fails
        return NextResponse.redirect(new URL("/settings/profile?incomplete=true", request.url));
    }

    if (profile) {
      const userRole = profile.role;
      const founderStatus = profile.application_status;
      const profileComplete = isProfileComplete(profile);

      // 1. Profile Completion Check (Bypass for Admins)
      if (userRole !== 'admin' && !profileComplete && !isSettingsPath && !isPendingApprovalPath) {
        console.log(`Middleware: Profile incomplete for ${userRole}. Redirecting from ${pathname} to /settings/profile`);
        return NextResponse.redirect(new URL("/settings/profile?incomplete=true", request.url));
      }

      // 2. Admin Route Protection
      if (pathname.startsWith("/admin") && userRole !== "admin") {
        console.log(`Middleware: Non-admin (${userRole}) access attempt to ${pathname}. Redirecting to /`);
        return NextResponse.redirect(new URL("/", request.url));
      }

      // 3. Founder Approval Check
      // Ensure admins are not redirected from pending approval
      if (userRole === "founder" && founderStatus !== "approved") {
        if (!isPendingApprovalPath && !isSettingsPath && pathname !== "/") {
            console.log(`Middleware: Founder status (${founderStatus}) not approved. Redirecting from ${pathname} to /pending-approval`);
            return NextResponse.redirect(new URL("/pending-approval", request.url));
        }
      }
      // Redirect approved founders away from pending page
      if (userRole === "founder" && founderStatus === "approved" && isPendingApprovalPath) {
        console.log(`Middleware: Approved founder on pending page. Redirecting from ${pathname} to /`);
        return NextResponse.redirect(new URL("/", request.url));
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

