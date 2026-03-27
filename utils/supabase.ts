
import { createBrowserClient, createServerClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!;

let browserClient: ReturnType<typeof createBrowserClient> | null = null;

export const getSupabase = async () => {
  if (typeof window === 'undefined') {
    // Server-side
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    return createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    });
  } else {
    // Client-side
    if (!browserClient) {
      browserClient = createBrowserClient(supabaseUrl, supabaseKey);
    }
    return browserClient;
  }
};
