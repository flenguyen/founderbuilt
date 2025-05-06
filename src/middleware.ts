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

// Helper function to check if essential profile fields are filled (Consistent with page)
const isProfileComplete = (profile: any): boolean => {
  if (!profile) return false;
  // Check for common essential fields: first_name, last_name, linkedin_url
  const commonEssentialFields = ["first_name", "last_name", "linkedin_url"];
  const commonFieldsFilled = commonEssentialFields.every(field => profile[field] && String(profile[field]).trim() !== "");
  
  if (!commonFieldsFilled) return false;

  // Check for founder-specific essential fields only if the role is founder
  if (profile.role === "founder") {
    const founderEssentialFields = ["company_name", "company_website", "industry"]; // Matches required fields in settings form
    const founderFieldsFilled = founderEssentialFields.every(field => profile[field] && String(profile[field]).trim() !== "");
    if (!founderFieldsFilled) return false;
  }
  
  // Add checks for other roles if needed (e.g., recruiter)

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
  const isAdminPath = pathname.startsWith("/admin");

  // --- Authentication Checks ---
  if (!session && !isPublicPath) {
    console.log(`Middleware: No session, redirecting from ${pathname} to /login`);
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (session && isPublicPath && pathname !== "/auth/callback") {
    console.log(`Middleware: Session exists, redirecting from public path ${pathname} to /`);
    return NextResponse.redirect(new URL("/", request.url));
  }

  // --- Role-Based Access Control & Profile Completion (if session exists) ---
  if (session) {
    // Try fetching just the role first to handle admin bypass efficiently
    const { data: roleData, error: roleError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .single();

    if (roleError && !isSettingsPath) {
        // If role fetch fails (e.g., profile doesn't exist yet) and not already going to settings,
        // redirect to settings. This handles new users.
        console.error(`Middleware: Error fetching role for ${session.user.id}, redirecting to settings. Error: ${roleError.message}`);
        return NextResponse.redirect(new URL("/settings/profile?incomplete=true", request.url));
    }

    const userRole = roleData?.role;

    // --- Admin Specific Logic ---
    if (userRole === 'admin') {
      // Admins can access anything except non-admin specific restricted paths (none currently)
      // Ensure they are not blocked by profile completion or founder approval checks.
      console.log(`Middleware: User is admin, allowing access to ${pathname}`);
      // Protect admin routes (redundant check, but safe)
      if (isAdminPath) {
        return response; // Allow access to admin paths
      }
      // Allow access to all other paths as well
      return response; 
    }

    // --- Non-Admin Logic ---
    if (userRole) { // Proceed only if role was successfully fetched
        // Fetch full profile for non-admins for completion/approval checks
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role, application_status, first_name, last_name, linkedin_url, company_name, company_website, industry") // Ensure all fields needed by isProfileComplete are here
          .eq("id", session.user.id)
          .single();

        // Handle profile fetch error for non-admins
        if (profileError && !isSettingsPath) {
            console.error(`Middleware: Error fetching profile for non-admin ${session.user.id}, redirecting to settings. Error: ${profileError.message}`);
            return NextResponse.redirect(new URL("/settings/profile?incomplete=true", request.url));
        }

        if (profile) {
            const profileComplete = isProfileComplete(profile);
            const founderStatus = profile.application_status;

            // 1. Profile Completion Check (for non-admins)
            if (!profileComplete && !isSettingsPath && !isPendingApprovalPath) {
                console.log(`Middleware: Profile incomplete for ${userRole}. Redirecting from ${pathname} to /settings/profile`);
                return NextResponse.redirect(new URL("/settings/profile?incomplete=true", request.url));
            }

            // 2. Admin Route Protection (should not be reachable by non-admins due to this check)
            if (isAdminPath) { // This check should ideally never be hit if role is not admin, but keep as safeguard
                console.log(`Middleware: Non-admin (${userRole}) blocked from admin path ${pathname}. Redirecting to /`);
                return NextResponse.redirect(new URL("/", request.url));
            }

            // 3. Founder Approval Check
            if (userRole === "founder") {
                if (founderStatus !== "approved" && !isPendingApprovalPath && !isSettingsPath && pathname !== "/") {
                    console.log(`Middleware: Founder status (${founderStatus}) not approved. Redirecting from ${pathname} to /pending-approval`);
                    return NextResponse.redirect(new URL("/pending-approval", request.url));
                }
                // Redirect approved founders away from pending page
                if (founderStatus === "approved" && isPendingApprovalPath) {
                    console.log(`Middleware: Approved founder on pending page. Redirecting from ${pathname} to /`);
                    return NextResponse.redirect(new URL("/", request.url));
                }
            }
        }
    }
  }

  // Default: allow request to proceed
  return response;
}

export const config = {
  matcher: [
    // Match all routes except specific static files and API routes
    "/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

