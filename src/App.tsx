import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";
import { SignOutButton } from "./SignOutButton";
import { BeverageStore } from "./components/BeverageStore";
import { Toaster } from "sonner";
import { useState, useEffect, useRef } from "react";
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
  
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      // Chỉ sử dụng anonymous auth
      await signIn("anonymous");
      toast.success("Đã đăng nhập với tư cách khách!");
    } catch (error: any) {
      console.error("Authentication error:", error);
      toast.error("Đăng nhập thất bại. Vui lòng thử lại sau.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      // Chỉ sử dụng anonymous auth
      await signIn("anonymous");
      toast.success("Đã đăng nhập với tư cách khách!");
    } catch (error: any) {
      console.error("Registration error:", error);
      toast.error("Đăng ký thất bại. Vui lòng thử lại sau.");
    } finally {
      setSubmitting(false);
    }
  };

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

  const toggleForm = (showRegister: boolean) => {
    if (containerRef.current) {
      if (showRegister) {
        containerRef.current.classList.add('active');
      } else {
        containerRef.current.classList.remove('active');
      }
    }
  };

  return (
    <div className="auth-container" ref={containerRef}>
      <div className="form-box login">
        <form onSubmit={handleSignIn}>
          <h1>Đăng Nhập</h1>
          <div className="input-box">
            <input type="email" name="email" placeholder="Email" />
            <i className='bx bxs-envelope'></i>
          </div>
          <div className="input-box">
            <input type="password" name="password" placeholder="Mật khẩu" />
            <i className='bx bxs-lock-alt'></i>
          </div>
          <div className="forgot-link">
            <a href="#">Quên mật khẩu?</a>
          </div>
          <button type="submit" className="btn" disabled={submitting}>
            {submitting ? "Đang xử lý..." : "Đăng Nhập"}
          </button>
          <p>hoặc</p>
          <button 
            type="button" 
            className="btn anonymous-btn"
            onClick={handleAnonymousSignIn}
            disabled={submitting}
          >
            Tiếp tục không cần đăng nhập
          </button>
        </form>
      </div>

      <div className="form-box register">
        <form onSubmit={handleSignUp}>
          <h1>Đăng Ký</h1>
          <div className="input-box">
            <input type="email" name="email" placeholder="Email" />
            <i className='bx bxs-envelope'></i>
          </div>
          <div className="input-box">
            <input type="password" name="password" placeholder="Mật khẩu" />
            <i className='bx bxs-lock-alt'></i>
          </div>
          <button type="submit" className="btn" disabled={submitting}>
            {submitting ? "Đang xử lý..." : "Đăng Ký"}
          </button>
          <p>hoặc</p>
          <button 
            type="button" 
            className="btn anonymous-btn"
            onClick={handleAnonymousSignIn}
            disabled={submitting}
          >
            Tiếp tục không cần đăng nhập
          </button>
        </form>
      </div>

      <div className="toggle-box">
        <div className="toggle-panel toggle-left">
          <h1>Chào mừng bạn!</h1>
          <p>Chưa có tài khoản?</p>
          <button className="btn register-btn" onClick={() => toggleForm(true)}>Đăng ký</button>
        </div>
        <div className="toggle-panel toggle-right">
          <h1>Chào mừng trở lại!</h1>
          <p>Đã có tài khoản?</p>
          <button className="btn login-btn" onClick={() => toggleForm(false)}>Đăng nhập</button>
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
