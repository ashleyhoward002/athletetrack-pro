export const dynamic = "force-dynamic";

import { NextResponse, NextRequest } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import config from "@/config";
import { findCheckoutSession } from "@/libs/stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2023-08-16",
    typescript: true,
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// Initialize Supabase Admin client (to update users securely)
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
    const body = await req.text();
    const signature = headers().get("stripe-signature");

    let event: Stripe.Event;

    try {
        if (!signature || !webhookSecret) return;
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
        console.error(`❌ Webhook signature verification failed.`, err.message);
        return NextResponse.json({ error: err.message }, { status: 400 });
    }

    const { type, data } = event;

    try {
        switch (type) {
            case "checkout.session.completed": {
                const session = await findCheckoutSession(data.object.id);
                const customerId = session?.customer;
                const priceId = session?.line_items?.data[0]?.price?.id;
                const userId = session?.client_reference_id;
                const plan = config.stripe.plans.find((p) => p.priceId === priceId);

                if (!userId) break;

                // Update user in Supabase
                await supabaseAdmin
                    .from("users")
                    .update({
                        customerId,
                        priceId,
                        hasAccess: true,
                    })
                    .eq("id", userId);

                break;
            }

            case "customer.subscription.updated": {
                // subscription updated code here
                break;
            }

            case "customer.subscription.deleted": {
                const subscription = data.object as Stripe.Subscription;
                const customerId = subscription.customer as string;

                // Revoke access
                await supabaseAdmin
                    .from("users")
                    .update({ hasAccess: false })
                    .eq("customerId", customerId);

                break;
            }
        }
    } catch (error) {
        console.error("Stripe Webhook Error:", error);
        return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
    }

    return NextResponse.json({});
}
