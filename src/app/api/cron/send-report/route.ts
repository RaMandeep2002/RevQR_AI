import { NextResponse } from "next/server";
import { adminClient } from "@/lib/supabase/admin";
import { resend } from "@/lib/resend";

export async function GET(req: Request) {
  // 1. Secure the endpoint using a secret token passed in headers/query params
  const { searchParams } = new URL(req.url);
  const cronSecret = searchParams.get("secret") || req.headers.get("Authorization")?.replace("Bearer ", "");

  if (process.env.CRON_SECRET && cronSecret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized cron access" }, { status: 401 });
  }

  try {
    // 2. Fetch all businesses
    const { data: businesses, error: bizError } = await adminClient
      .from("businesses")
      .select("id, name, owner_id");

    if (bizError) throw bizError;
    if (!businesses || businesses.length === 0) {
      return NextResponse.json({ message: "No businesses found" });
    }

    let emailsSent = 0;

    for (const business of businesses) {
      // 3. Get the owner's email from Supabase Auth admin API
      const { data: userData, error: userError } = await adminClient.auth.admin.getUserById(business.owner_id);
      
      if (userError || !userData?.user?.email) {
        console.error(`Could not fetch email for owner ${business.owner_id}:`, userError);
        continue;
      }

      const email = userData.user.email;

      // 4. Fetch reviews for this business
      const { data: reviews, error: reviewsError } = await adminClient
        .from("reviews")
        .select("created_at, customer_name, customer_email, stars, review_text")
        .eq("business_id", business.id)
        .order("created_at", { ascending: false });

      if (reviewsError || !reviews || reviews.length === 0) {
        continue;
      }

      // 5. Generate CSV content
      const headers = ["Date", "Customer Name", "Customer Email", "Rating", "Review Text"];
      const rows = reviews.map((review) => {
        const date = new Date(review.created_at).toISOString().split("T")[0];
        const reviewText = (review.review_text || "").replace(/\s+/g, " ").replace(/"/g, '""').trim();
        return [
          date,
          review.customer_name || "Anonymous",
          review.customer_email || "",
          review.stars.toString(),
          `"${reviewText}"`,
        ];
      });

      const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
      const filename = `${business.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-report.csv`;

      // 6. Send the email via Resend
      await resend.emails.send({
        from: "QReview Reports <onboarding@resend.dev>",
        to: email,
        subject: `Scheduled Report: ${business.name}`,
        text: `Hello,

Here is your scheduled customer feedback CSV report for "${business.name}".

Best regards,
The QReview Team`,
        attachments: [
          {
            filename,
            content: Buffer.from(csvContent).toString("base64"),
          },
        ],
      });

      emailsSent++;
    }

    return NextResponse.json({ success: true, emailsSent });
  } catch (err: any) {
    console.error("Cron job error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
