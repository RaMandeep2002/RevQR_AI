import type { User } from "@supabase/supabase-js";

/**
 * Admin access is deliberately configured outside the browser. Keep this
 * value server-only; never expose the service role key or this allowlist to
 * client components.
 */
export function isAdminUser(user: User | null | undefined) {
  if (!user?.email) return false;

  const configuredEmails = [
    process.env.ADMIN_EMAILS,
    process.env.ADMIN_EMAIL,
  ]
    .filter(Boolean)
    .flatMap((value) => value!.split(","))
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

  return configuredEmails.includes(user.email.toLowerCase());
}
