"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { formatCurrency, formatDate } from "@/lib/utils";

interface Transfer {
  id: string;
  senderId: string;
  receiverId: string;
  amount: number;
  description?: string;
  createdAt: string;
  sender: { firstName: string; lastName: string; accountNumber: string };
  receiver: { firstName: string; lastName: string; accountNumber: string };
}

export default function TransfersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [filter, setFilter] = useState<"all" | "sent" | "received">("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  useEffect(() => {
    const fetchTransfers = async () => {
      try {
        const res = await fetch("/api/transfers");
        if (res.ok) {
          setTransfers(await res.json());
        }
      } catch (err) {
        console.error("Error fetching transfers:", err);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.id) {
      fetchTransfers();
    }
  }, [session]);

  const filteredTransfers = transfers.filter((transfer) => {
    if (filter === "sent") return transfer.senderId === session?.user?.id;
    if (filter === "received") return transfer.receiverId === session?.user?.id;
    return true;
  });

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h1 className="text-3xl font-bold mb-6">Transfer History</h1>

      <div className="flex gap-4 mb-6">
        {(["all", "sent", "received"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              filter === tab
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b-2 border-gray-300">
            <tr>
              <th className="text-left py-4 px-4">Date</th>
              <th className="text-left py-4 px-4">Type</th>
              <th className="text-left py-4 px-4">Account</th>
              <th className="text-left py-4 px-4">Description</th>
              <th className="text-right py-4 px-4">Amount</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransfers.length > 0 ? (
              filteredTransfers.map((transfer) => (
                <tr key={transfer.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-4 px-4 text-sm">
                    {formatDate(transfer.createdAt)}
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        transfer.senderId === session?.user?.id
                          ? "bg-red-100 text-red-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {transfer.senderId === session?.user?.id ? "Sent" : "Received"}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    {transfer.senderId === session?.user?.id
                      ? transfer.receiver.accountNumber
                      : transfer.sender.accountNumber}
                  </td>
                  <td className="py-4 px-4 text-gray-600">
                    {transfer.description || "-"}
                  </td>
                  <td className="py-4 px-4 text-right font-semibold">
                    <span
                      className={
                        transfer.senderId === session?.user?.id
                          ? "text-red-600"
                          : "text-green-600"
                      }
                    >
                      {transfer.senderId === session?.user?.id ? "-" : "+"}
                      {formatCurrency(transfer.amount)}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-500">
                  No transfers found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
