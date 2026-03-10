"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  function handleLogout() {
    logout();
    router.push("/login");
  }

  return (
    <nav className="bg-white border-b border-sand-100 px-6 py-4 flex items-center justify-between">
      <Link href="/dashboard" className="text-2xl font-display text-sand-500">
        ✈ Trao
      </Link>
      {user && (
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500 font-body">Hi, {user.name}</span>
          <button onClick={handleLogout} className="btn-secondary text-sm py-1.5 px-4">
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}
