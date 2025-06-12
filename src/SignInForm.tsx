"use client";
import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { toast } from "sonner";

export function SignInForm() {
  const { signIn } = useAuthActions();
  const [submitting, setSubmitting] = useState(false);
  const [password, setPassword] = useState("");

  // Admin login handler
  const handleSubmit = async (e: React.FormEvent) => {
          e.preventDefault();
          setSubmitting(true);
    
    // Check if password matches the admin password
    if (password === "admin123") {
      try {
        // Use anonymous auth for admin login
        await signIn("anonymous");
        toast.success("Đăng nhập thành công!");
      } catch (error: any) {
        toast.error("Đăng nhập thất bại. Vui lòng thử lại.");
        setSubmitting(false);
      }
            } else {
      toast.error("Mật khẩu không chính xác!");
            setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center mb-6">Đăng Nhập Admin</h2>
      
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
        <input
            className="w-full px-4 py-2 border rounded-lg"
          type="password"
            placeholder="Mật khẩu Admin"
          required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        
        <button 
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700" 
          type="submit" 
          disabled={submitting}
        >
          {submitting ? "Đang đăng nhập..." : "Đăng Nhập"}
        </button>
      </form>
      
      <div className="text-center mt-4 text-sm text-gray-500">
        <p>Chỉ dành cho quản trị viên</p>
      </div>
    </div>
  );
}
