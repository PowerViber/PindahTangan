import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "../lib/AuthContext";
import { supabase } from "../lib/supabase";
import { IconBox, IconTag, IconCheck, IconClipboard, IconStore, IconTruck, IconWallet } from "../components/Icons";
import StatCard from "../components/StatCard";
import ProductCard, { formatIDR } from "../components/ProductCard";
import { fetchSalesByProductIds, paymentMethodLabel, type ProductSaleInfo } from "../lib/sales";

interface Submission {
  id: string;
  product_name: string;
  status: string;
  estimation_price: number | string | null;
  created_at: string;
  purchase_year?: string;
  condition?: string;
  functionality?: string;
  completeness?: string;
  address?: string;
  contact?: string;
  image_url?: string | null;
}

interface Product {
  id: string;
  name: string;
  grade: string;
  price: number;
  image_url?: string | null;
  created_at?: string;
  sold?: boolean;
  seller_id?: string | null;
  submission_id?: string | null;
}

interface SellerSale {
  product: Product;
  sale?: ProductSaleInfo;
}

export default function DashboardPage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [feed, setFeed] = useState<Product[]>([]);
  const [marketListings, setMarketListings] = useState<Product[]>([]);
  const [sellerSales, setSellerSales] = useState<SellerSale[]>([]);
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

        const userSubmissions = subData || [];
        setSubmissions(userSubmissions);

        const { data: prodData, error } = await supabase
          .from("products")
          .select("*")
          .eq("sold", false)
          .order("created_at", { ascending: false })
          .limit(8);

        if (!error && prodData && prodData.length > 0) {
          setFeed(prodData.filter((product) => product.seller_id !== user.id).slice(0, 4));
        } else {
          setFeed([
            { id: "1", name: "MacBook Pro 16\" (2021)",   grade: "MINT", price: 28500000, created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString() },
            { id: "2", name: "Apple Watch Series 8, 45mm", grade: "GOOD", price: 4200000, created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
            { id: "3", name: "iPhone 12 Pro Max, 256GB",  grade: "FAIR", price: 7200000, created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString() },
            { id: "4", name: "Sony WH-1000XM4",            grade: "GOOD", price: 3500000, created_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString() },
          ]);
        }

        const [listedProducts, soldProducts] = await Promise.all([
          loadUserProducts(user.id, userSubmissions, false),
          loadUserProducts(user.id, userSubmissions, true),
        ]);

        setMarketListings(listedProducts);

        if (soldProducts && soldProducts.length > 0) {
          const salesByProductId = await fetchSalesByProductIds(soldProducts.map((product) => product.id));
          setSellerSales(
            soldProducts.map((product) => ({
              product,
              sale: salesByProductId[product.id],
            }))
          );
        } else {
          setSellerSales([]);
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

  const nonDraftSubmissions = submissions.filter((s) => s.status !== "DRAFT");
  const drafts = submissions.filter((s) => s.status === "DRAFT");

  const totalItems = nonDraftSubmissions.length;
  const activeListings = marketListings.length;
  const soldItems = sellerSales.length || nonDraftSubmissions.filter((s) => s.status === "SOLD").length;
  const pendingItems = nonDraftSubmissions.filter((s) => s.status === "PENDING").length;

  async function handleContinueDraft(draft: Submission) {
    const form = {
      productName: draft.product_name || "",
      purchaseYear: draft.purchase_year || "",
      condition: draft.condition || "",
      functionality: draft.functionality || "",
      completeness: draft.completeness || "",
      address: draft.address || "",
      contact: draft.contact || "",
      imageUrl: draft.image_url || "",
      estimationPrice: Number(draft.estimation_price) || 0,
      isFromDraft: true,
      draftId: draft.id,
    };
    sessionStorage.setItem("pending_submission", JSON.stringify(form));
    router.push("/jual/estimasi");
  }

  async function handleDeleteDraft(id: string) {
    if (!confirm("Apakah Anda yakin ingin menghapus draft ini?")) return;
    try {
      const { error } = await supabase.from("submissions").delete().eq("id", id);
      if (error) throw error;
      setSubmissions((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      console.error("Gagal menghapus draft:", err);
    }
  }

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
            onClick={() => {
              if (typeof window !== "undefined") {
                sessionStorage.removeItem("pending_submission");
              }
            }}
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

      <div className="flex flex-col gap-6">
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

      {/* Drafts Section */}
      {!fetching && drafts.length > 0 && (
        <div className="flex flex-col gap-6">
          <h2 className="font-serif text-2xl font-semibold text-[#1B1C1C] border-b border-[#D1C5B8] pb-2">
            Draft Pengajuan Anda
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {drafts.map((d) => (
              <div key={d.id} className="bg-white border border-[#D1C4B8] rounded-xl p-6 flex justify-between items-center shadow-xs">
                <div className="flex flex-col gap-1">
                  <h3 className="font-sans text-base font-bold text-[#1B1C1C]">{d.product_name}</h3>
                  <p className="font-body text-xs text-[#7F766A]">
                    Taksiran: <span className="font-semibold text-[#735A39]">{formatIDR(Number(d.estimation_price) || 0)}</span>
                  </p>
                  <p className="font-body text-[10px] text-[#7F766A]/80">
                    Disimpan pada: {new Date(d.created_at).toLocaleDateString("id-ID")}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleContinueDraft(d)}
                    className="bg-[#D2B48C] hover:bg-[#C5A67F] text-[#5B4526] font-body font-bold text-xs px-4 py-2.5 rounded-lg transition-colors cursor-pointer"
                  >
                    Lanjutkan
                  </button>
                  <button
                    onClick={() => handleDeleteDraft(d.id)}
                    className="border border-[#BA1A1A] text-[#BA1A1A] hover:bg-[#BA1A1A]/10 font-body font-bold text-xs px-4 py-2.5 rounded-lg transition-colors cursor-pointer"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!fetching && (
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-[#D1C5B8] pb-2">
            <h2 className="font-serif text-2xl font-semibold text-[#1B1C1C] flex items-center gap-2">
              <IconStore className="w-4 h-4 text-[#725A39]" />
              Produk Anda di Marketplace
            </h2>
            <Link href="/marketplace" className="font-body text-sm font-bold text-[#725A39] hover:underline">
              Lihat Marketplace
            </Link>
          </div>

          {marketListings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {marketListings.map((product) => (
                <ProductCard key={product.id} product={product} hideCartButton />
              ))}
            </div>
          ) : (
            <div className="bg-white border border-[#E8E2D9] rounded-2xl p-10 text-center text-[#7F766A] font-sans">
              Belum ada produk Anda yang sedang listed di marketplace.
            </div>
          )}
        </div>
      )}

      {!fetching && sellerSales.length > 0 && (
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-[#D1C5B8] pb-2">
            <h2 className="font-serif text-2xl font-semibold text-[#1B1C1C] flex items-center gap-2">
              <IconWallet className="w-4 h-4 text-[#725A39]" />
              Riwayat Penjualan
            </h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {sellerSales.map(({ product, sale }) => (
              <div key={product.id} className="bg-white border border-[#D1C4B8] rounded-xl p-5 flex flex-col gap-4 shadow-xs">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-serif text-lg font-semibold text-[#1B1C1C]">{product.name}</h3>
                    <p className="font-body text-sm font-bold text-[#725A39] mt-1">{formatIDR(product.price)}</p>
                  </div>
                  <span className="bg-[#1B1C1C] text-white text-xs font-bold px-3 py-1 rounded-full">
                    SOLD
                  </span>
                </div>
                {sale ? (
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <div className="font-body text-xs text-[#7F766A] font-semibold uppercase">Pembeli</div>
                      <div className="font-body font-bold text-[#1B1C1C]">{sale.buyerName}</div>
                      <div className="font-body text-xs text-[#4D453C]">{sale.buyerEmail}</div>
                    </div>
                    <div>
                      <div className="font-body text-xs text-[#7F766A] font-semibold uppercase">Pembayaran</div>
                      <div className="font-body font-bold text-[#1B1C1C]">
                        {paymentMethodLabel[sale.paymentMethod] || sale.paymentMethod}
                      </div>
                      <div className="font-body text-xs text-[#4D453C]">{sale.orderStatus}</div>
                    </div>
                    <div>
                      <div className="font-body text-xs text-[#7F766A] font-semibold uppercase">Tanggal</div>
                      <div className="font-body text-[#1B1C1C]">
                        {new Date(sale.soldAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                      </div>
                    </div>
                    <div>
                      <div className="font-body text-xs text-[#7F766A] font-semibold uppercase">Order</div>
                      <div className="font-mono text-xs text-[#1B1C1C]">#{sale.orderId.slice(0, 8).toUpperCase()}</div>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-[#7F766A]">
                    Detail pembeli belum tersedia untuk transaksi ini.
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

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

async function loadUserProducts(userId: string, submissions: Submission[], sold: boolean) {
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
    .eq("seller_id", userId)
    .eq("sold", sold);
  addProducts(sellerProducts);

  if (submissionIds.length > 0) {
    const { data: submissionProducts } = await supabase
      .from("products")
      .select("*")
      .in("submission_id", submissionIds)
      .eq("sold", sold);
    addProducts(submissionProducts);
  }

  if (productNames.length > 0) {
    const { data: legacyProducts } = await supabase
      .from("products")
      .select("*")
      .in("name", productNames)
      .eq("sold", sold);
    addProducts(legacyProducts);
  }

  return Array.from(productMap.values()).sort((a, b) => {
    const aTime = new Date(a.created_at || 0).getTime();
    const bTime = new Date(b.created_at || 0).getTime();
    return bTime - aTime;
  });
}
