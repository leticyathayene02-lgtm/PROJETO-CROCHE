import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { createCheckoutSession } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { workspaceId } = await req.json();
    if (!workspaceId) {
      return NextResponse.json(
        { error: "workspaceId is required" },
        { status: 400 }
      );
    }

    // Verify membership
    const member = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: { workspaceId, userId: session.user.id },
      },
    });

    if (!member) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const subscription = await prisma.subscription.findUnique({
      where: { workspaceId },
    });

    // TODO: Configure real Stripe products/prices before launch
    const checkoutSession = await createCheckoutSession({
      workspaceId,
      userId: session.user.id,
      email: session.user.email,
      customerId: subscription?.stripeCustomerId,
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("[Stripe Checkout]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
