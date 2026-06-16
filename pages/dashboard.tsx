import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "../lib/AuthContext";
import { supabase } from "../lib/supabase";
import { IconBox, IconTag, IconCheck, IconClipboard, IconStore, IconBell, IconTruck } from "../components/Icons";
import StatCard from "../components/StatCard";
import ProductCard from "../components/ProductCard";

interface Submission {
  id: string;
  product_name: string;
  status: string;
  estimation_price: number | string | null;
  created_at: string;
}

interface Product {
  id: string;
  name: string;
  grade: string;
  price: number;
  image_url?: string | null;
}

const actionItems = [
  { title: "MacBook Pro 14\" — Tawaran Baru", desc: "Calon pembeli menawar Rp18.250.000 untuk barangmu.", time: "12m lalu", highlighted: true },
  { title: "Bid Baru di iPhone 13",           desc: "Tawaran sebesar Rp9.200.000 telah diterima.",          time: "1j lalu",  highlighted: false },
  { title: "Pickup Terjadwal",                desc: "Kurir akan datang besok pukul 10:00–12:00.",     time: "3j lalu",  highlighted: false },
];

export default function DashboardPage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [feed, setFeed] = useState<Product[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      async function loadDashboardData() {
        if (!user) return;
        setFetching(true);
        const { data: subData } = await supabase
          .from("submissions")
          .select("*")
          .eq("user_id", user.id);

        if (subData) {
          setSubmissions(subData);
        }

        const { data: prodData } = await supabase
          .from("products")
          .select("*")
          .limit(4);

        if (prodData && prodData.length > 0) {
          setFeed(prodData);
        }
        setFetching(false);
      }
      loadDashboardData();
    }
  }, [user]);

  if (loading || !user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#725A39] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const totalItems = submissions.length;
  const activeListings = submissions.filter((s) => s.status === "ACTIVE").length;
  const soldItems = submissions.filter((s) => s.status === "SOLD").length;
  const pendingItems = submissions.filter((s) => s.status === "PENDING").length;

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col gap-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[#D1C5B8]">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-6 h-6 bg-[#D2B48C] rounded-sm shadow-xs" />
            <span className="font-mono text-xs font-semibold text-[#7F766A] tracking-wider">SELLER DASHBOARD</span>
          </div>
          <h1 className="font-serif text-4xl font-bold text-[#1B1C1C]">
            Selamat Datang Kembali, {profile?.full_name || user.email?.split("@")[0]}
          </h1>
        </div>
        <div className="flex gap-3">
          <Link
            href="/jual"
            className="flex items-center gap-2 border border-[#1B1C1C] text-[#1B1C1C] hover:bg-[#F6F3F2] font-body font-semibold text-sm px-6 py-3 rounded-lg transition-colors cursor-pointer"
          >
            <IconClipboard className="w-4 h-4" />
            Ajukan Barang Baru
          </Link>
          <Link
            href="/marketplace"
            className="flex items-center gap-2 bg-[#D2B48C] hover:bg-[#C5A67F] text-[#5B4526] font-body font-semibold text-sm px-6 py-3 rounded-lg transition-colors cursor-pointer"
          >
            <IconStore className="w-4 h-4" />
            Lihat Marketplace
          </Link>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Activity Overview */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <h2 className="font-serif text-2xl font-semibold text-[#1B1C1C] border-b border-[#D1C5B8] pb-2">
            Ikhtisar Aktivitas
          </h2>
          {fetching ? (
            <div className="flex justify-center py-10">
              <div className="w-6 h-6 border-2 border-[#725A39] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <StatCard label="Listing Aktif" value={activeListings} Icon={IconStore} />
              <StatCard label="Total Barang" value={totalItems} Icon={IconBox} />
              <StatCard label="Pending QC" value={pendingItems} Icon={IconTag} />
              <StatCard label="Terjual (Sold)" value={soldItems} Icon={IconCheck} />
            </div>
          )}
        </div>

        {/* Action Center */}
        <div className="flex flex-col gap-6">
          <h2 className="font-serif text-2xl font-semibold text-[#1B1C1C] border-b border-[#D1C5B8] pb-2 flex items-center gap-2">
            <IconBell className="w-4 h-4 text-[#725A39]" />
            Action Center
          </h2>
          <div className="flex flex-col gap-3">
            {actionItems.map((a) => (
              <div
                key={a.title}
                className={`bg-white rounded-xl p-5 border transition-all ${
                  a.highlighted ? "border-[#725A39] shadow-xs" : "border-[#D1C5B8]"
                }`}
              >
                <div className="flex justify-between items-start gap-2 mb-1">
                  <span className="font-body text-sm font-bold text-[#1B1C1C]">{a.title}</span>
                </div>
                <p className="font-body text-xs text-[#4D453C] mb-2">{a.desc}</p>
                <span className="font-mono text-[9px] text-[#7F766A] tracking-wider uppercase font-semibold">{a.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Personalized Marketplace Feed */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between border-b border-[#D1C5B8] pb-2">
          <h2 className="font-serif text-2xl font-semibold text-[#1B1C1C] flex items-center gap-2">
            <IconTruck className="w-4 h-4 text-[#725A39]" />
            Feed Marketplace Terkini
          </h2>
          <Link href="/marketplace" className="font-body text-sm font-bold text-[#725A39] hover:underline">
            Lihat Semua
          </Link>
        </div>
        {fetching ? (
          <div className="flex justify-center py-10">
            <div className="w-6 h-6 border-2 border-[#725A39] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : feed.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {feed.map((f) => (
              <ProductCard key={f.id} product={f} />
            ))}
          </div>
        ) : (
          <div className="bg-white border border-[#E8E2D9] rounded-2xl p-10 text-center text-[#7F766A] font-sans">
            Belum ada produk aktif di marketplace.
          </div>
        )}
      </div>
    </div>
  );
}
