import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sendTransferNotification } from "@/lib/mailer";
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

    const { receiverAccountNumber, amount, description } = await req.json();

    if (!receiverAccountNumber || !amount || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid transfer details" },
        { status: 400 }
      );
    }

    const sender = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (!sender) {
      return NextResponse.json(
        { error: "Sender not found" },
        { status: 404 }
      );
    }

    if (sender.balance < amount) {
      return NextResponse.json(
        { error: "Insufficient balance" },
        { status: 400 }
      );
    }

    const receiver = await prisma.user.findUnique({
      where: { accountNumber: receiverAccountNumber }
    });

    if (!receiver) {
      return NextResponse.json(
        { error: "Receiver not found" },
        { status: 404 }
      );
    }

    if (sender.id === receiver.id) {
      return NextResponse.json(
        { error: "Cannot transfer to yourself" },
        { status: 400 }
      );
    }

    const transfer = await prisma.transfer.create({
      data: {
        senderId: sender.id,
        receiverId: receiver.id,
        amount,
        description
      }
    });

    await prisma.user.update({
      where: { id: sender.id },
      data: { balance: { decrement: amount } }
    });

    await prisma.user.update({
      where: { id: receiver.id },
      data: { balance: { increment: amount } }
    });

    await sendTransferNotification(
      receiver.email,
      amount,
      sender.firstName
    );

    await prisma.notification.create({
      data: {
        userId: receiver.id,
        type: "transfer",
        title: "Money Received",
        message: `${sender.firstName} sent you $${amount.toFixed(2)}`
      }
    });

    return NextResponse.json(transfer, { status: 201 });
  } catch (error) {
    console.error("Transfer error:", error);
    return NextResponse.json(
      { error: "Transfer failed" },
      { status: 500 }
    );
  }
}
