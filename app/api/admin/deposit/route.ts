import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sendAdminDepositNotification } from "@/lib/mailer";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const admin = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (!admin?.isAdmin) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const { userId, amount } = await req.json();

    if (!userId || !amount || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid deposit details" },
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { balance: { increment: amount } }
    });

    await sendAdminDepositNotification(user.email, amount);

    await prisma.notification.create({
      data: {
        userId,
        type: "deposit",
        title: "Balance Added",
        message: `Admin added $${amount.toFixed(2)} to your account`
      }
    });

    return NextResponse.json({
      message: "Deposit successful",
      newBalance: user.balance
    });
  } catch (error) {
    console.error("Deposit error:", error);
    return NextResponse.json(
      { error: "Deposit failed" },
      { status: 500 }
    );
  }
}
