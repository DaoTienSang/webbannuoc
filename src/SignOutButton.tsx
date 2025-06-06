"use client";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth } from "convex/react";
import { useState } from "react";

export function SignOutButton() {
  const { isAuthenticated } = useConvexAuth();
  const { signOut } = useAuthActions();
  const [isLoading, setIsLoading] = useState(false);

  if (!isAuthenticated) {
    return null;
  }

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await signOut();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold transition-all duration-300 shadow-md hover:shadow-lg flex items-center"
      onClick={handleSignOut}
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
          Đang xử lý...
        </>
      ) : (
        <>
          <i className='bx bx-log-out mr-1'></i> Đăng xuất
        </>
      )}
    </button>
  );
}
