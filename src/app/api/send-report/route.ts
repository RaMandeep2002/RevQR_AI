import { NextResponse } from "next/server";
import { resend } from "@/lib/resend";

export async function POST(req: Request) {
  try {
    const { email, csvContent, businessName } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const filename = `reviews-report-${new Date().toISOString().split("T")[0]}.csv`;

    const { data, error } = await resend.emails.send({
      from: "QReview Reports <onboarding@resend.dev>",
      to: email,
      subject: `QReview Feedback Report - ${businessName || "All Locations"}`,
      text: `Hello,

Please find attached the CSV report containing the customer feedback data for ${businessName || "your business locations"}.

Best regards,
The QReview Team`,
      attachments: [
        {
          filename: filename,
          content: Buffer.from(csvContent).toString("base64"),
        },
      ],
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("Error sending email:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Something went wrong" },
      { status: 500 }
    );
  }
}
