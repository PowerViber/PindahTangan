import { useEffect, useState } from "react";
import { IconFilter } from "../components/Icons";
import { supabase } from "../lib/supabase";
import ProductCard from "../components/ProductCard";

interface Product {
  id: string;
  name: string;
  grade: "MINT" | "GOOD" | "FAIR" | string;
  price: number;
  image_url?: string | null;
  created_at: string;
}

const mockFallbackProducts = [
  { id: "1", name: "MacBook Pro 16\" (2021)",   grade: "MINT", price: 28500000, created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString() },
  { id: "2", name: "Apple Watch Series 8, 45mm", grade: "GOOD", price: 4200000, created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
  { id: "3", name: "iPhone 12 Pro Max, 256GB",  grade: "FAIR", price: 7200000, created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString() },
  { id: "4", name: "Sony WH-1000XM4",            grade: "GOOD", price: 3500000, created_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString() },
  { id: "5", name: "iPad Air (2022)",            grade: "MINT", price: 6200000, created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() },
  { id: "6", name: "Canon EOS M50 Mark II",      grade: "GOOD", price: 8500000, created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString() },
  { id: "7", name: "Dell XPS 13 (9310)",         grade: "GOOD", price: 14500000, created_at: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString() },
  { id: "8", name: "Nintendo Switch OLED",       grade: "MINT", price: 3800000, created_at: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString() },
  { id: "9", name: "Keychron K2 Mechanical Keyboard", grade: "FAIR", price: 950000, created_at: new Date(Date.now() - 1000 * 60 * 60 * 120).toISOString() },
];

export default function MarketplacePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState("Newest");

  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .order("created_at", { ascending: false });

        if (error || !data || data.length === 0) {
          setProducts(mockFallbackProducts);
        } else {
          setProducts(data);
        }
      } catch (err) {
        setProducts(mockFallbackProducts);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  const sortedProducts = [...products].sort((a, b) => {
    if (sort === "Price Low") {
      return Number(a.price) - Number(b.price);
    }
    if (sort === "Price High") {
      return Number(b.price) - Number(a.price);
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return (
    <div className="max-w-6xl mx-auto px-6 lg:px-20 py-12 flex flex-col gap-10">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="flex flex-col gap-2 max-w-xl">
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-[#1B1C1C]">Verified Electronics Marketplace</h1>
          <p className="font-sans text-base text-[#4D453C]">
            Kurasi terpercaya, bersertifikat, dan siap pakai. Setiap produk diinspeksi oleh ahli kami.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 border border-[#D1C5B8] rounded-full px-5 py-2.5 text-sm font-semibold text-[#1B1C1C] hover:bg-white transition-colors cursor-pointer">
            <IconFilter className="w-4 h-4" />
            Filter
          </button>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="border border-[#D1C5B8] rounded-full px-5 py-2.5 text-sm font-semibold text-[#1B1C1C] bg-white focus:outline-none cursor-pointer hover:border-[#725A39]"
          >
            <option value="Newest">Terbaru</option>
            <option value="Price Low">Harga Terendah</option>
            <option value="Price High">Harga Tertinggi</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-24">
          <div className="w-8 h-8 border-2 border-[#725A39] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : sortedProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {sortedProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <div className="bg-white border border-[#E8E2D9] rounded-2xl p-16 text-center text-[#7F766A] font-sans">
          Belum ada produk terdaftar.
        </div>
      )}

      <div className="text-center mt-6">
        <button className="border border-[#1B1C1C] text-[#1B1C1C] hover:bg-[#1B1C1C] hover:text-white px-8 py-3.5 rounded-lg font-body font-semibold text-sm transition-colors cursor-pointer">
          Muat Lebih Banyak
        </button>
      </div>
    </div>
  );
}
