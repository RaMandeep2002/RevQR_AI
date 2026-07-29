import { resend } from "@/lib/resend";
import WelcomeEmail from "@/lib/emails/welcomeEmail";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        console.log("body ------> ", body)

        const { data, error } = await resend.emails.send({
            from: "Acme <onboarding@resend.dev>",
            to: body.email,
            subject: "Welcome!",
            react: WelcomeEmail({ name: body.name })
        });

        console.log("data ------> ", data)
        if (error) {
            console.log("error ------> ", error)
            return Response.json(error, { status: 400 })
        }

        return Response.json(data);

    } catch (err) {
        console.error("error in catch block ------> ", err)
        return Response.json(
            { message: "Something went wrong!", error: err instanceof Error ? err.message : String(err) },
            { status: 500 }
        )
    }
}