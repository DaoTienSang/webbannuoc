import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { AdminDashboard } from "./components/AdminDashboard";
import { Toaster } from "sonner";

export default function AdminApp() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <AuthLoading>
        <div className="flex justify-center items-center min-h-screen">
          <div className="spinner"></div>
        </div>
      </AuthLoading>
      
      <Unauthenticated>
        <div className="min-h-screen flex items-center justify-center">
          <div className="glass p-8 rounded-3xl shadow-2xl max-w-md w-full mx-4 animate-bounce-in">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4 animate-float">👨‍💼</div>
              <h1 className="text-3xl font-bold text-white mb-2">Admin Panel</h1>
              <p className="text-white/80">Đăng nhập để quản lý cửa hàng</p>
            </div>
            <SignInForm />
          </div>
        </div>
      </Unauthenticated>
      
      <Authenticated>
        <div className="min-h-screen">
          {/* Header with Sign Out */}
          <div className="fixed top-4 right-4 z-50 flex items-center space-x-2">
            <span className="px-3 py-1 bg-blue-600 text-white rounded-lg font-medium flex items-center">
              <span className="mr-1">👨‍💼</span> Admin
            </span>
            <SignOutButton />
          </div>

          {/* Admin Dashboard */}
          <AdminDashboard onBack={() => window.location.href = '/'} />
        </div>
      </Authenticated>
      
      <Toaster position="top-right" richColors />
    </main>
  );
}
