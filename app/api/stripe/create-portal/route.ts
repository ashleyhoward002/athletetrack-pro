import { NextResponse, NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { createCustomerPortal } from "@/libs/stripe";

export async function POST(req: NextRequest) {
    try {
        const cookieStore = cookies();
        const supabase = createClient(cookieStore);
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            return NextResponse.json({ error: "Not signed in" }, { status: 401 });
        }

        // Look up the Stripe customerId from the users table
        const { data: userData } = await supabase
            .from("users")
            .select("customerId")
            .eq("id", session.user.id)
            .single();

        const { returnUrl } = await req.json();

        const result = await createCustomerPortal({
            customerId: userData?.customerId,
            returnUrl,
        });

        return NextResponse.json({ url: result });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: e?.message }, { status: 500 });
    }
}
