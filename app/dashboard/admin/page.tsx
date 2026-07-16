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
  balance: number;
  isAdmin: boolean;
}

interface Transaction {
  id: string;
  senderId: string;
  receiverId: string;
  amount: number;
  description?: string;
  createdAt: string;
  sender: { firstName: string; lastName: string };
  receiver: { firstName: string; lastName: string };
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [depositForm, setDepositForm] = useState({
    userId: "",
    amount: ""
  });
  const [depositError, setDepositError] = useState("");
  const [depositSuccess, setDepositSuccess] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, transactionsRes] = await Promise.all([
          fetch("/api/admin/users"),
          fetch("/api/admin/transactions")
        ]);

        if (usersRes.status === 403) {
          router.push("/dashboard");
          return;
        }

        if (usersRes.ok) {
          setUsers(await usersRes.json());
        }
        if (transactionsRes.ok) {
          setTransactions(await transactionsRes.json());
        }
      } catch (err) {
        console.error("Error fetching admin data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.id) {
      fetchData();
    }
  }, [session, router]);

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDepositError("");
    setDepositSuccess("");

    try {
      const res = await fetch("/api/admin/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: depositForm.userId,
          amount: parseFloat(depositForm.amount)
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Deposit failed");
      }

      setDepositSuccess("Deposit successful!");
      setDepositForm({ userId: "", amount: "" });

      // Refresh users
      const usersRes = await fetch("/api/admin/users");
      if (usersRes.ok) {
        setUsers(await usersRes.json());
      }
    } catch (err) {
      setDepositError(err instanceof Error ? err.message : "Deposit failed");
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Admin Panel</h1>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6">Users</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b-2 border-gray-300">
              <tr>
                <th className="text-left py-4 px-4">Name</th>
                <th className="text-left py-4 px-4">Email</th>
                <th className="text-left py-4 px-4">Account Number</th>
                <th className="text-right py-4 px-4">Balance</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-4 px-4">
                    {user.firstName} {user.lastName}
                    {user.isAdmin && (
                      <span className="ml-2 px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                        Admin
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-4">{user.email}</td>
                  <td className="py-4 px-4 font-mono">{user.accountNumber}</td>
                  <td className="py-4 px-4 text-right font-semibold">
                    {formatCurrency(user.balance)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Balance Form */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6">Add Balance</h2>

        {depositError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {depositError}
          </div>
        )}

        {depositSuccess && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
            {depositSuccess}
          </div>
        )}

        <form onSubmit={handleDeposit} className="space-y-4 max-w-md">
          <select
            value={depositForm.userId}
            onChange={(e) =>
              setDepositForm({ ...depositForm, userId: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select a user</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.firstName} {user.lastName} ({user.accountNumber})
              </option>
            ))}
          </select>
          <input
            type="number"
            placeholder="Amount"
            step="0.01"
            min="0"
            value={depositForm.amount}
            onChange={(e) =>
              setDepositForm({ ...depositForm, amount: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Add Balance
          </button>
        </form>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6">All Transactions</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b-2 border-gray-300">
              <tr>
                <th className="text-left py-4 px-4">Date</th>
                <th className="text-left py-4 px-4">From</th>
                <th className="text-left py-4 px-4">To</th>
                <th className="text-left py-4 px-4">Description</th>
                <th className="text-right py-4 px-4">Amount</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr
                  key={transaction.id}
                  className="border-b border-gray-200 hover:bg-gray-50"
                >
                  <td className="py-4 px-4 text-sm">
                    {formatDate(transaction.createdAt)}
                  </td>
                  <td className="py-4 px-4">
                    {transaction.sender.firstName} {transaction.sender.lastName}
                  </td>
                  <td className="py-4 px-4">
                    {transaction.receiver.firstName} {transaction.receiver.lastName}
                  </td>
                  <td className="py-4 px-4 text-gray-600">
                    {transaction.description || "-"}
                  </td>
                  <td className="py-4 px-4 text-right font-semibold">
                    {formatCurrency(transaction.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
