import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const cookieStore = cookies();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("Auth Callback: Missing Supabase URL or Anon Key");
      // Handle missing configuration - redirect to an error page or home with error
      return NextResponse.redirect(`${origin}/login?error=Server configuration error`);
    }

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.delete({ name, ...options });
        },
      },
    });

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Redirect to the intended page after successful login
      // Ensure the redirect URL is within the application's origin for security
      const redirectUrl = new URL(next, origin);
      if (redirectUrl.origin === origin) {
        return NextResponse.redirect(redirectUrl.toString());
      } else {
        // Redirect to home if 'next' is an external URL
        return NextResponse.redirect(origin);
      }
    } else {
      console.error("Auth Callback Error:", error.message);
      // Redirect to an error page or login page with error message
      return NextResponse.redirect(`${origin}/login?error=Could not authenticate user`);
    }
  }

  // Redirect to an error page or login page if code is missing
  console.error("Auth Callback: Code parameter missing");
  return NextResponse.redirect(`${origin}/login?error=Authentication failed`);
}

