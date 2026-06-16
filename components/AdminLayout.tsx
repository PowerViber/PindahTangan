import { useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../lib/AuthContext";
import AdminSidebar from "./AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user || !profile || !profile.is_admin) {
        router.push("/dashboard");
      }
    }
  }, [user, profile, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FBF9F8]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-[#725A39] border-t-transparent rounded-full animate-spin" />
          <span className="font-sans text-sm text-[#7F766A] font-medium">Memverifikasi hak akses admin...</span>
        </div>
      </div>
    );
  }

  if (!user || !profile || !profile.is_admin) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-[#FBF9F8]">
      <AdminSidebar />
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
