"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect } from "react";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session?.user?.id) {
      router.push("/dashboard");
    }
  }, [session, router]);

  if (status === "loading") {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4">
      <div className="text-center text-white max-w-2xl">
        <h1 className="text-5xl font-bold mb-6">Spectruist Banking</h1>
        <p className="text-xl mb-8 text-blue-100">
          Modern, secure banking for everyone. Transfer money instantly, manage your account, and more.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/auth/register"
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50"
          >
            Get Started
          </Link>
          <Link
            href="/auth/login"
            className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:bg-opacity-10"
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}
