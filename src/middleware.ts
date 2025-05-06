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

// Helper function to check if essential profile fields are filled
const isProfileComplete = (profile: any): boolean => {
  if (!profile) return false;
  // Define essential fields - adjust as needed
  const essentialFields = ["full_name", "linkedin_url"]; 
  if (profile.role === "founder") {
    essentialFields.push("company_name", "company_website", "industry"); // Add founder-specific fields
  }
  return essentialFields.every(field => profile[field] && profile[field].trim() !== "");
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
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role, application_status, full_name, linkedin_url, company_name, company_website, industry") // Add fields for completeness check
      .eq("id", session.user.id)
      .single();

    // Allow access to settings if profile fetch fails (likely new user needs to create profile)
    if (profileError && !isSettingsPath) {
        console.error("Middleware: Error fetching profile:", profileError.message);
        // Redirect to profile settings if profile doesn't exist yet
        return NextResponse.redirect(new URL("/settings/profile?incomplete=true", request.url));
    }

    if (profile) {
      const userRole = profile.role;
      const founderStatus = profile.application_status;
      const profileComplete = isProfileComplete(profile);

      // 1. Profile Completion Check (Highest Priority after Auth)
      // Redirect to profile settings if incomplete, unless already there or pending approval
      if (!profileComplete && !isSettingsPath && !isPendingApprovalPath) {
        console.log(`Middleware: Profile incomplete. Redirecting from ${pathname} to /settings/profile`);
        return NextResponse.redirect(new URL("/settings/profile?incomplete=true", request.url));
      }

      // 2. Admin Route Protection
      if (pathname.startsWith("/admin") && userRole !== "admin") {
        console.log(`Middleware: Non-admin (${userRole}) access attempt to ${pathname}. Redirecting to /`);
        return NextResponse.redirect(new URL("/", request.url));
      }

      // 3. Founder Approval Check
      // Only check if profile is complete, otherwise they are already redirected
      if (profileComplete && userRole === "founder" && founderStatus !== "approved") {
        // Allow access only to pending approval page and settings
        if (!isPendingApprovalPath && !isSettingsPath && pathname !== "/") { // Allow homepage
            console.log(`Middleware: Founder status (${founderStatus}) not approved. Redirecting from ${pathname} to /pending-approval`);
            return NextResponse.redirect(new URL("/pending-approval", request.url));
        }
      }
      
      // 4. Recruiter Access (Placeholder - Add specific checks if needed)
      // ...
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

