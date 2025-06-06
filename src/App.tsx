import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";
import { SignOutButton } from "./SignOutButton";
import { BeverageStore } from "./components/BeverageStore";
import { Toaster } from "sonner";
import { useState, useRef } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { toast } from "sonner";
import { AdminDashboard } from "./components/AdminDashboard";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

// User-specific sign-in form separate from admin
function UserSignInForm() {
  const { signIn } = useAuthActions();
  const [submitting, setSubmitting] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const handleAnonymousSignIn = async () => {
    setSubmitting(true);
    try {
      console.log("Attempting anonymous sign in");
      await signIn("anonymous");
      toast.success("Đã đăng nhập với tư cách khách!");
    } catch (error) {
      console.error("Anonymous auth error:", error);
      toast.error("Không thể đăng nhập. Vui lòng thử lại sau.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-container" ref={containerRef}>
      <div className="form-box login">
        <div className="p-8 text-center">
          <h1 className="text-2xl font-bold mb-6">Chào mừng đến với Nước Việt Nam!</h1>
          <p className="mb-6">Hiện tại, hệ thống chỉ hỗ trợ đăng nhập dưới dạng khách. Nhấn nút dưới đây để tiếp tục.</p>
          <button 
            type="button" 
            className="btn anonymous-btn w-full"
            onClick={handleAnonymousSignIn}
            disabled={submitting}
          >
            {submitting ? "Đang xử lý..." : "Tiếp tục với tư cách khách"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <main className="min-h-screen">
      <AuthLoading>
        <div className="flex justify-center items-center min-h-screen">
          <div className="spinner"></div>
        </div>
      </AuthLoading>
      
      <Unauthenticated>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-100 to-cyan-100">
          <UserSignInForm />
        </div>
      </Unauthenticated>
      
      <Authenticated>
        <div className="min-h-screen">
          {/* Header with Sign Out */}
          <div className="fixed top-4 right-4 z-50">
            <SignOutButton />
          </div>

          {/* Main Content */}
          <BeverageStore />
        </div>
      </Authenticated>
      
      <Toaster position="top-right" richColors />
    </main>
  );
}
