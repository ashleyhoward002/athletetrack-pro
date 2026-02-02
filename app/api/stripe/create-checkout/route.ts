export const dynamic = "force-dynamic";

import { NextResponse, NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { createCheckout } from "@/libs/stripe";

// This function is used to create a Stripe Checkout Session (one-time payment or subscription)
// It's called by the <ButtonCheckout /> component
// By default, it doesn't force users to be logged in. But if they are, it will prefill the Email data in the Stripe checkout page
export async function POST(req: NextRequest) {
    const body = await req.json();

    if (!body.priceId) {
        return NextResponse.json(
            { error: "Price ID is mandatory" },
            { status: 400 }
        );
    } else if (!body.successUrl || !body.cancelUrl) {
        return NextResponse.json(
            { error: "Success and Cancel URLs are mandatory" },
            { status: 400 }
        );
    } else if (!body.mode) {
        return NextResponse.json(
            {
                error:
                    "Mode is mandatory (either 'payment' for one-time payments or 'subscription' for recurring subscription)",
            },
            { status: 400 }
        );
    }

    try {
        const cookieStore = cookies();
        const supabase = createClient(cookieStore);
        const { data: { session } } = await supabase.auth.getSession();

        // Optionally look up the Stripe customerId from the users table
        let customerId: string | undefined;
        if (session?.user?.id) {
            const { data: userData } = await supabase
                .from("users")
                .select("customerId")
                .eq("id", session.user.id)
                .single();
            customerId = userData?.customerId;
        }

        const { priceId, mode, successUrl, cancelUrl } = body;

        const stripeSessionURL = await createCheckout({
            priceId,
            mode,
            successUrl,
            cancelUrl,
            // If user is logged in, it will pass the user ID to the Stripe Session so it can be retrieved in the webhook later
            clientReferenceId: session?.user?.id,
            user: {
                email: session?.user?.email,
                // If the user has a customerId, it will pass it to the Stripe Session to avoid creating a new customer
                customerId,
            },
        });

        return NextResponse.json({ url: stripeSessionURL });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: e?.message }, { status: 500 });
    }
}
