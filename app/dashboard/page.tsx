"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { formatCurrency, formatDate } from "@/lib/utils";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  accountNumber: string;
  routingNumber: string;
  balance: number;
}

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

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [transferForm, setTransferForm] = useState({
    receiverAccountNumber: "",
    amount: "",
    description: ""
  });
  const [transferError, setTransferError] = useState("");
  const [transferSuccess, setTransferSuccess] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, transfersRes] = await Promise.all([
          fetch("/api/user"),
          fetch("/api/transfers")
        ]);

        if (userRes.ok) {
          setUser(await userRes.json());
        }
        if (transfersRes.ok) {
          const data = await transfersRes.json();
          setTransfers(data.slice(0, 5)); // Latest 5
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.id) {
      fetchData();
    }
  }, [session]);

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setTransferError("");
    setTransferSuccess("");

    try {
      const res = await fetch("/api/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiverAccountNumber: transferForm.receiverAccountNumber,
          amount: parseFloat(transferForm.amount),
          description: transferForm.description
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Transfer failed");
      }

      setTransferSuccess("Transfer successful!");
      setTransferForm({ receiverAccountNumber: "", amount: "", description: "" });

      // Refresh data
      const userRes = await fetch("/api/user");
      if (userRes.ok) {
        setUser(await userRes.json());
      }

      const transfersRes = await fetch("/api/transfers");
      if (transfersRes.ok) {
        const data = await transfersRes.json();
        setTransfers(data.slice(0, 5));
      }
    } catch (err) {
      setTransferError(err instanceof Error ? err.message : "Transfer failed");
    }
  };

  if (status === "loading" || loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <p className="text-gray-600 text-sm">Balance</p>
          <p className="text-4xl font-bold text-blue-600">
            {user ? formatCurrency(user.balance) : "$0.00"}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <p className="text-gray-600 text-sm">Account Number</p>
          <p className="text-2xl font-mono font-bold text-gray-800">
            {user?.accountNumber}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <p className="text-gray-600 text-sm">Routing Number</p>
          <p className="text-2xl font-mono font-bold text-gray-800">
            {user?.routingNumber}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Transfer Form */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-6">Send Money</h2>

          {transferError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {transferError}
            </div>
          )}

          {transferSuccess && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
              {transferSuccess}
            </div>
          )}

          <form onSubmit={handleTransfer} className="space-y-4">
            <input
              type="text"
              placeholder="Recipient Account Number"
              value={transferForm.receiverAccountNumber}
              onChange={(e) =>
                setTransferForm({ ...transferForm, receiverAccountNumber: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="number"
              placeholder="Amount"
              step="0.01"
              min="0"
              value={transferForm.amount}
              onChange={(e) =>
                setTransferForm({ ...transferForm, amount: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="text"
              placeholder="Description (optional)"
              value={transferForm.description}
              onChange={(e) =>
                setTransferForm({ ...transferForm, description: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Transfer
            </button>
          </form>
        </div>

        {/* Recent Transfers */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-6">Recent Transfers</h2>
          <div className="space-y-4">
            {transfers.length > 0 ? (
              transfers.map((transfer) => (
                <div
                  key={transfer.id}
                  className="border border-gray-200 p-4 rounded-lg"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-gray-800">
                        {transfer.senderId === user?.id
                          ? `To: ${transfer.receiver.firstName} ${transfer.receiver.lastName}`
                          : `From: ${transfer.sender.firstName} ${transfer.sender.lastName}`}
                      </p>
                      <p className="text-gray-600 text-sm">
                        {transfer.description}
                      </p>
                      <p className="text-gray-500 text-xs">
                        {formatDate(transfer.createdAt)}
                      </p>
                    </div>
                    <p
                      className={`text-lg font-bold ${
                        transfer.senderId === user?.id
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      {transfer.senderId === user?.id ? "-" : "+"}
                      {formatCurrency(transfer.amount)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">
                No transfers yet
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
