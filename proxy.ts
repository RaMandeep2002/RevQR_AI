// middleware.ts
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { featureEnabled, pathMatches, subscriptionIsActive } from "@/lib/subscription-access";
import { isAdminUser } from "@/lib/admin-auth";

// Define route permissions based on features
const ROUTE_PERMISSIONS = {
  // Routes that require specific features
  '/dashboard/analytics': ['analytics'],
  '/dashboard/reports': ['monthlyReports'],
  '/dashboard/team': ['teamManagement'],
  '/dashboard/staff-leaderboard': ['staffLeaderboard'],
  '/dashboard/webhooks': ['webhooks'],
  '/dashboard/api': ['restApiAccess'],
  '/dashboard/settings/custom-domain': ['customDomain'],
  '/dashboard/qr-codes/dynamic': ['maxDynamicQRCodes'],
  '/dashboard/qr-codes/static': ['maxStaticQRCodes'],
  '/dashboard/qr-customizer': ['maxStaticQRCodes'],
  '/dashboard/businesses': ['maxBusinesses'],
};

// Routes that are always accessible (even with free plan)
const PUBLIC_DASHBOARD_ROUTES = [
  '/dashboard',
  '/dashboard/profile',
  '/dashboard/settings',
  '/dashboard/reviews',
];

// Helper to get plan features
const getPlanFeatures = (planName: string, isYearly: boolean) => {
  const features = {
    reviewScanLimit: 25,
    aiGenerationLimit: 2,
    prioritySupport: false,
    maxBusinesses: 1,
    maxStaticQRCodes: 1,
    maxDynamicQRCodes: 0,
    acrylicStandees: 0,
    languages: 1,
    voiceToText: false,
    staffLeaderboard: false,
    restApiAccess: false,
    webhooks: false,
    teamManagement: false,
    liveChatSupport: false,
    monthlyReports: false,
    analytics: false,
    customDomain: false,
  };

  switch (planName) {
    case 'Starter':
      features.reviewScanLimit = isYearly ? 1200 : 100;
      features.aiGenerationLimit = isYearly ? 24 : 2;
      features.maxBusinesses = 1;
      features.maxStaticQRCodes = 3;
      features.maxDynamicQRCodes = 0;
      features.analytics = true;
      features.languages = 2;
      break;
    case 'Growth':
      features.reviewScanLimit = isYearly ? 4200 : 350;
      features.aiGenerationLimit = isYearly ? 24 : 2;
      features.prioritySupport = true;
      features.maxBusinesses = 3;
      features.maxStaticQRCodes = 999;
      features.maxDynamicQRCodes = 20;
      features.acrylicStandees = 1;
      features.languages = 999;
      features.monthlyReports = true;
      features.analytics = true;
      break;
    case 'Enterprise':
      features.reviewScanLimit = isYearly ? 12000 : 1000;
      features.aiGenerationLimit = isYearly ? 240 : 20;
      features.prioritySupport = true;
      features.maxBusinesses = 999;
      features.maxStaticQRCodes = 999;
      features.maxDynamicQRCodes = 999;
      features.acrylicStandees = 3;
      features.languages = 999;
      features.voiceToText = true;
      features.staffLeaderboard = true;
      features.restApiAccess = true;
      features.webhooks = true;
      features.teamManagement = true;
      features.liveChatSupport = true;
      features.monthlyReports = true;
      features.analytics = true;
      break;
    default: // FREE
      break;
  }

  return features;
};

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options: CookieOptions }>) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { user }
  } = await supabase.auth.getUser();

  const protectedPaths = ["/dashboard", "/onboarding"];
  const isProtectedPath = protectedPaths.some((path) => request.nextUrl.pathname.startsWith(path));

  // Protect app routes
  if (!user && isProtectedPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth";
    url.searchParams.set("redirected", "true");
    return NextResponse.redirect(url);
  }

  const isAdminPath = request.nextUrl.pathname.startsWith("/admin");
  const isAdminLogin = request.nextUrl.pathname === "/admin/login";

  if (isAdminPath && !isAdminLogin && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("redirectedFrom", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  if (isAdminPath && !isAdminLogin && user && !isAdminUser(user)) {
    return NextResponse.redirect(new URL("/auth", request.url));
  }

  // Redirect authenticated users away from auth pages
  if (user && request.nextUrl.pathname.startsWith("/auth")) {
    return NextResponse.redirect(new URL("/onboarding", request.url));
  }

  // Check subscription-based route restrictions
  if (user && request.nextUrl.pathname.startsWith("/dashboard")) {
    const pathname = request.nextUrl.pathname;
    
    // Skip restriction for public dashboard routes
    if (PUBLIC_DASHBOARD_ROUTES.some(route => pathMatches(pathname, route))) {
      return response;
    }

    // Fetch user's subscription
    const { data: subscription, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("Error fetching subscription:", error);
      // If error, allow access but log the issue
      return response;
    }

    let features = getPlanFeatures("FREE", false);
    if (subscription?.features) {
      if (typeof subscription.features === "string") {
        try { features = JSON.parse(subscription.features); } catch { /* use safe defaults */ }
      } else if (typeof subscription.features === "object") {
        features = subscription.features;
      }
    }
    const hasValidSubscription = subscriptionIsActive(subscription);

    for (const [route, requiredFeatures] of Object.entries(ROUTE_PERMISSIONS)) {
      if (pathMatches(pathname, route) &&
          (!hasValidSubscription || !requiredFeatures.some(feature => featureEnabled(features, feature)))) {
        const url = request.nextUrl.clone();
        url.pathname = "/dashboard/upgrade";
        url.searchParams.set("restricted", "true");
        return NextResponse.redirect(url);
      }
    }
  }

  return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/onboarding/:path*", "/auth/:path*"]
};
