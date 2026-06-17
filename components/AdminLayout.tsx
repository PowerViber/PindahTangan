import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../lib/AuthContext";
import AdminSidebar from "./AdminSidebar";
import { IconMenu } from "./Icons";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 min-w-0 flex flex-col">
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center gap-4 px-4 h-14 border-b border-[#D1C5B8] bg-[#F6F3F2] sticky top-0 z-40">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="w-9 h-9 flex items-center justify-center rounded-lg border border-[#D1C5B8] text-[#1B1C1C] hover:bg-[#E8E2D9] transition-colors"
            aria-label="Buka menu"
          >
            <IconMenu className="w-5 h-5" />
          </button>
          <span className="font-serif text-lg font-bold text-[#1B1C1C]">PindahTangan</span>
          <span className="font-body text-xs font-bold text-[#4D453C] tracking-wide">ADMIN</span>
        </div>

        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}
