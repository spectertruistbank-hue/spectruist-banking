"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";

interface LayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: LayoutProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  useEffect(() => {
    const fetchUser = async () => {
      const res = await fetch("/api/user");
      if (res.ok) {
        const user = await res.json();
        setIsAdmin(user.isAdmin);
      }
    };
    if (session?.user?.id) {
      fetchUser();
    }
  }, [session]);

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="text-2xl font-bold text-blue-600">
            Spectruist
          </Link>
          <div className="flex items-center gap-6">
            <span className="text-gray-700">
              Welcome, {session?.user?.name}
            </span>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="flex">
        <aside className="w-64 bg-white shadow min-h-screen">
          <nav className="p-6 space-y-2">
            <Link
              href="/dashboard"
              className="block px-4 py-2 rounded-lg text-gray-700 hover:bg-blue-50 transition"
            >
              Dashboard
            </Link>
            <Link
              href="/dashboard/transfers"
              className="block px-4 py-2 rounded-lg text-gray-700 hover:bg-blue-50 transition"
            >
              Transfers
            </Link>
            <Link
              href="/dashboard/notifications"
              className="block px-4 py-2 rounded-lg text-gray-700 hover:bg-blue-50 transition"
            >
              Notifications
            </Link>
            {isAdmin && (
              <Link
                href="/dashboard/admin"
                className="block px-4 py-2 rounded-lg text-gray-700 hover:bg-blue-50 transition font-semibold text-blue-600"
              >
                Admin Panel
              </Link>
            )}
          </nav>
        </aside>

        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
