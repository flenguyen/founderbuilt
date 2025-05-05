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
        // Ensure response object is updated for cookie setting
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

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createSupabaseMiddlewareClient(request, response);

  if (!supabase) {
    // Handle missing Supabase config - maybe redirect to an error page
    return response; 
  }

  // Refresh session if expired - crucial for server-side checks
  const { data: { session } } = await supabase.auth.getSession();

  const { pathname } = request.nextUrl;

  // Define public paths accessible without authentication
  const publicPaths = ["/login", "/signup", "/auth/callback"]; // Added /auth/callback
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path));

  // --- Authentication Checks ---

  // If no session and trying to access a protected path, redirect to login
  if (!session && !isPublicPath) {
    console.log(`Middleware: No session, redirecting from protected path ${pathname} to /login`);
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // If session exists and trying to access a public path (login/signup), redirect to home
  if (session && isPublicPath && pathname !== 
"/auth/callback") { // Allow access to callback
    console.log(`Middleware: Session found, redirecting from public path ${pathname} to /`);
    return NextResponse.redirect(new URL("/", request.url));
  }

  // --- Role-Based Access Control (if session exists) ---
  if (session) {
    // Fetch user profile for role and status checks
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role, application_status")
      .eq("id", session.user.id)
      .single();

    if (profileError && !pathname.startsWith("/settings/profile")) {
        // Allow access to profile settings to complete profile if fetch fails (might be new user)
        console.error("Middleware: Error fetching profile:", profileError.message);
        // Potentially redirect to an error page or profile setup
        // For now, let it pass, but log the error
    }

    if (profile) {
      const userRole = profile.role;
      const founderStatus = profile.application_status;

      // 1. Admin Route Protection
      if (pathname.startsWith("/admin") && userRole !== "admin") {
        console.log(`Middleware: Non-admin (${userRole}) access attempt to ${pathname}. Redirecting to /`);
        return NextResponse.redirect(new URL("/", request.url));
      }

      // 2. Founder Approval Check
      if (userRole === "founder" && founderStatus !== "approved") {
        // Allow access only to pending approval page and profile settings
        const allowedPathsForPendingFounder = ["/pending-approval", "/settings/profile"];
        if (!allowedPathsForPendingFounder.some(path => pathname.startsWith(path)) && pathname !== "/") { // Allow homepage
            console.log(`Middleware: Founder status (${founderStatus}) not approved. Redirecting from ${pathname} to /pending-approval`);
            return NextResponse.redirect(new URL("/pending-approval", request.url));
        }
      }
      
      // 3. Recruiter Access (Placeholder - Add specific checks if needed, e.g., for paid features)
      // if (userRole === "recruiter" && profile.recruiter_tier === "free" && pathname.startsWith("/some-paid-feature")) {
      //   return NextResponse.redirect(new URL("/settings/subscription", request.url));
      // }
      
      // 4. Ensure users complete their profile? (Optional)
      // if (!profile.is_profile_complete && !pathname.startsWith("/settings/profile")) {
      //    return NextResponse.redirect(new URL("/settings/profile?incomplete=true", request.url));
      // }
    }
  }

  // Return the potentially modified response (e.g., with cookies set)
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - /api/ (API routes, e.g., Stripe webhooks)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

