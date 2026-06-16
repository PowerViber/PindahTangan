import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../lib/AuthContext";
import { supabase } from "../lib/supabase";
import SubmissionRow from "../components/SubmissionRow";
import StatCard from "../components/StatCard";
import { IconBox, IconCheck, IconTag, IconStore } from "../components/Icons";

interface Submission {
  id: string;
  product_name: string;
  estimation_price: number | string | null;
  status: "PENDING" | "ACTIVE" | "SOLD" | "CANCELLED" | string;
  image_url?: string | null;
  created_at: string;
}

interface Product {
  id: string;
  name: string;
  sold?: boolean;
  seller_id?: string | null;
  submission_id?: string | null;
}

export default function ProfilePage() {
  const { user, profile, loading, signOut } = useAuth();
  const router = useRouter();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      async function loadUserSubmissions() {
        if (!user) return;
        setFetching(true);
        const { data, error } = await supabase
          .from("submissions")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (!error && data) {
          setSubmissions(data);
          setRelatedProducts(await loadRelatedProducts(user.id, data));
        }
        setFetching(false);
      }
      loadUserSubmissions();
    }
  }, [user]);

  if (loading || !user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#725A39] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const soldProducts = relatedProducts.filter((product) => product.sold);
  const soldSubmissionIds = new Set(soldProducts.map((product) => product.submission_id).filter(Boolean));
  const soldProductNames = new Set(soldProducts.map((product) => product.name.toLowerCase().trim()));
  const displaySubmissions = submissions.map((submission) => {
    const isSoldByProduct =
      soldSubmissionIds.has(submission.id) ||
      soldProductNames.has(submission.product_name.toLowerCase().trim());

    return isSoldByProduct && submission.status !== "SOLD"
      ? { ...submission, status: "SOLD" }
      : submission;
  });

  const totalSubmissions = displaySubmissions.length;
  const activeSubmissions = displaySubmissions.filter((s) => s.status === "ACTIVE" || s.status === "PENDING").length;
  const soldSubmissions = displaySubmissions.filter((s) => s.status === "SOLD").length;
  const cancelledSubmissions = displaySubmissions.filter((s) => s.status === "CANCELLED").length;

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col gap-10">
      <div className="bg-white border border-[#D1C5B8] rounded-2xl p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xs">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 bg-[#725A39] rounded-full flex items-center justify-center font-serif text-2xl font-bold text-white shadow-sm">
            {(profile?.full_name || user.user_metadata?.full_name || user.email)?.[0]?.toUpperCase() || "U"}
          </div>
          <div>
            <h1 className="font-serif text-3xl font-bold text-[#1B1C1C]">{profile?.full_name || user.user_metadata?.full_name || "Nama Pengguna"}</h1>
            <p className="font-sans text-sm text-[#7F766A] mt-0.5">{user.email}</p>
          </div>
        </div>

        <button
          onClick={async () => {
            await signOut();
            router.push("/");
          }}
          className="bg-[#BA1A1A] hover:bg-[#93000A] text-white font-body font-semibold text-sm px-6 py-3 rounded-lg transition-colors cursor-pointer self-start md:self-center"
        >
          Keluar (Log Out)
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard label="Total Pengajuan" value={totalSubmissions} Icon={IconBox} />
        <StatCard label="Sedang Aktif" value={activeSubmissions} Icon={IconStore} />
        <StatCard label="Terjual (Sold)" value={soldSubmissions} Icon={IconCheck} />
        <StatCard label="Dibatalkan" value={cancelledSubmissions} Icon={IconTag} />
      </div>

      <div className="flex flex-col gap-6">
        <h2 className="font-serif text-2xl font-semibold text-[#1B1C1C] border-b border-[#D1C5B8] pb-3">
          Riwayat Pengajuan Anda
        </h2>

        {fetching ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 border-[#725A39] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : displaySubmissions.length > 0 ? (
          <div className="flex flex-col gap-4">
            {displaySubmissions.map((sub) => (
              <SubmissionRow key={sub.id} submission={sub} />
            ))}
          </div>
        ) : (
          <div className="bg-white border border-[#E8E2D9] rounded-2xl p-12 text-center text-[#7F766A] font-sans flex flex-col items-center gap-3">
            <svg className="w-12 h-12 text-[#A89070]/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span className="text-base font-semibold text-[#1B1C1C]">Belum ada barang yang diajukan</span>
            <p className="text-sm max-w-xs">
              Ajukan perangkat elektronik bekas Anda untuk diverifikasi dan dijual oleh tim kami.
            </p>
            <button
              onClick={() => router.push("/jual")}
              className="mt-2 bg-[#725A39] hover:bg-[#5B4526] text-white font-body font-semibold text-sm px-6 py-2.5 rounded-lg transition-colors cursor-pointer"
            >
              Mulai Jual Barang
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

async function loadRelatedProducts(userId: string, submissions: Submission[]) {
  const productMap = new Map<string, Product>();
  const addProducts = (products?: Product[] | null) => {
    (products || []).forEach((product) => productMap.set(product.id, product));
  };

  const submissionIds = submissions.map((submission) => submission.id);
  const productNames = Array.from(
    new Set(submissions.map((submission) => submission.product_name).filter(Boolean))
  );

  const { data: sellerProducts } = await supabase
    .from("products")
    .select("*")
    .eq("seller_id", userId);
  addProducts(sellerProducts);

  if (submissionIds.length > 0) {
    const { data: submissionProducts } = await supabase
      .from("products")
      .select("*")
      .in("submission_id", submissionIds);
    addProducts(submissionProducts);
  }

  if (productNames.length > 0) {
    const { data: legacyProducts } = await supabase
      .from("products")
      .select("*")
      .in("name", productNames);
    addProducts(legacyProducts);
  }

  return Array.from(productMap.values());
}
