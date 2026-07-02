import { NextResponse } from 'next/server';

// Mocking prisma for the migration snippet
const prisma = { scheduledPost: { create: async (data: any) => data.data } };

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { platform, content, scheduledAt, mediaUrl } = body;
    
    if (!platform || !content || !scheduledAt) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Usually, we would authenticate and get the user ID
    const userId = "mock-user-id";

    // Deduct credits via Zwallet API integration
    try {
      const zwalletRes = await fetch(`${process.env.ZWALLET_URL || 'http://localhost:8090'}/v1/credits/deduct`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, amount: 5, reason: "Social Post Scheduling" })
      });
      
      if (!zwalletRes.ok) {
        return NextResponse.json({ error: "Insufficient credits in ZWallet" }, { status: 402 });
      }
    } catch (e) {
      console.warn("ZWallet connection failed, bypassing for migration test.");
    }

    // Save scheduled post to database
    const post = await prisma.scheduledPost.create({
      data: {
        userId,
        platform,
        content,
        mediaUrl,
        scheduledAt: new Date(scheduledAt),
        status: "PENDING"
      }
    });

    return NextResponse.json({ success: true, post });
  } catch (error) {
    console.error("[SOCIAL_SCHEDULE_POST]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
