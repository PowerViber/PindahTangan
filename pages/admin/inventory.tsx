import { useEffect, useState } from "react";
import { IconSearch, IconBox } from "../../components/Icons";
import { supabase } from "../../lib/supabase";
import { formatIDR } from "../../components/ProductCard";
import { fetchSalesByProductIds, paymentMethodLabel, type ProductSaleInfo } from "../../lib/sales";

interface Product {
  id: string;
  name: string;
  grade: string;
  price: number;
  image_url?: string | null;
  sold?: boolean;
  seller_id?: string | null;
  submission_id?: string | null;
  created_at?: string;
}

const gradeStyle: Record<string, string> = {
  MINT: "bg-[#1B1C1C] text-white",
  GOOD: "bg-[#D2B48C] text-[#5B4526] border border-[#D1C5B8]",
  FAIR: "bg-[#E4E2E1] text-[#1B1C1C] border border-[#D1C5B8]",
};

function statusInfo(product: Product): { label: string; color: string } {
  if (product.sold) return { label: "Sold", color: "#BA1A1A" };
  return { label: "Listed", color: "#D2B48C" };
}

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [gradeFilter, setGradeFilter] = useState("All Grades");
  const [salesByProductId, setSalesByProductId] = useState<Record<string, ProductSaleInfo>>({});

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setProducts(data);
        const soldIds = data.filter((product) => product.sold).map((product) => product.id);
        setSalesByProductId(await fetchSalesByProductIds(soldIds));
      }
      setLoading(false);
    }
    load();
  }, []);

  const filtered = products.filter((p) => {
    const matchSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.id.toLowerCase().includes(search.toLowerCase()) ||
      (p.grade || "").toLowerCase().includes(search.toLowerCase());
    const matchGrade =
      gradeFilter === "All Grades" || p.grade === gradeFilter;
    return matchSearch && matchGrade;
  });

  const grades = ["All Grades", ...Array.from(new Set(products.map((p) => p.grade).filter(Boolean)))];

  return (
    <div className="px-4 sm:px-12 py-6 sm:py-10 max-w-5xl">
      <div className="mb-8 sm:mb-10">
        <h1 className="font-serif text-3xl sm:text-5xl font-semibold text-[#1B1C1C] mb-1">Inventory Directory</h1>
        <p className="font-sans text-base text-[#4D453C]">Manage, filter, and track verified electronic assets.</p>
        <span className="inline-block mt-3 bg-[#E4E2E1] border border-[#D1C5B8] px-4 py-2 rounded-sm text-sm font-body font-bold text-[#1B1C1C]">
          {products.length} Total Products
        </span>
      </div>

      <div className="bg-white border border-[#D1C5B8] rounded-lg p-3 flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[260px]">
          <IconSearch className="w-4 h-4 text-[#4D453C] absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Product ID, Name, or Grade..."
            className="w-full border border-[#D1C5B8] rounded-sm pl-12 pr-4 py-3 text-sm font-body placeholder-[#7F766A] focus:outline-none focus:border-[#725A39]"
          />
        </div>
        <select
          value={gradeFilter}
          onChange={(e) => setGradeFilter(e.target.value)}
          className="border border-[#D1C5B8] bg-[#FBF9F8] rounded-sm px-4 py-3 text-sm font-body font-medium text-[#1B1C1C] focus:outline-none"
        >
          {grades.map((g) => <option key={g} value={g}>{g}</option>)}
        </select>
      </div>

      <div className="bg-white border border-[#D1C5B8] rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-2 border-[#725A39] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 font-sans text-sm text-[#7F766A]">
            {products.length === 0
              ? "Belum ada produk di database."
              : "Tidak ada produk yang cocok dengan filter."}
          </div>
        ) : (
          <>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#F6F3F2] border-b border-[#D1C5B8] text-left">
                  <th className="px-4 py-3 font-body text-xs font-bold text-[#4D453C] tracking-wide">Product</th>
                  <th className="px-4 py-3 font-body text-xs font-bold text-[#4D453C] tracking-wide">Grade</th>
                  <th className="px-4 py-3 font-body text-xs font-bold text-[#4D453C] tracking-wide">Price</th>
                  <th className="px-4 py-3 font-body text-xs font-bold text-[#4D453C] tracking-wide">Status</th>
                  <th className="hidden md:table-cell px-4 py-3 font-body text-xs font-bold text-[#4D453C] tracking-wide">Sold Detail</th>
                  <th className="hidden md:table-cell px-4 py-3 font-body text-xs font-bold text-[#4D453C] tracking-wide">Added</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => {
                  const st = statusInfo(p);
                  const sale = salesByProductId[p.id];
                  return (
                    <tr key={p.id} className="border-b border-[#D1C5B8] last:border-0 hover:bg-[#FBF9F8] transition-colors">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-[#E4E2E1] border border-[#D1C5B8] rounded-sm flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {p.image_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                            ) : (
                              <IconBox className="w-4 h-4 text-[#7F766A]" />
                            )}
                          </div>
                          <div>
                            <span className="font-body font-bold text-[#1B1C1C]">{p.name}</span>
                            <div className="font-mono text-[10px] text-[#7F766A] mt-0.5">
                              {p.id.slice(0, 8).toUpperCase()}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`text-xs font-bold px-2 py-1 rounded-sm ${gradeStyle[p.grade] || "bg-[#E4E2E1] text-[#1B1C1C]"}`}>
                          {p.grade || "N/A"}
                        </span>
                      </td>
                      <td className="px-4 py-4 font-body font-bold text-[#725A39]">
                        {formatIDR(p.price)}
                      </td>
                      <td className="px-4 py-4">
                        <span className="flex items-center gap-1.5 font-body text-[#1B1C1C]">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: st.color }} />
                          {st.label}
                        </span>
                      </td>
                      <td className="hidden md:table-cell px-4 py-4 font-body text-xs text-[#4D453C] min-w-48">
                        {p.sold ? (
                          sale ? (
                            <div className="flex flex-col gap-0.5">
                              <span className="font-bold text-[#1B1C1C]">{sale.buyerName}</span>
                              <span>{sale.buyerEmail}</span>
                              <span>
                                {paymentMethodLabel[sale.paymentMethod] || sale.paymentMethod} - {sale.orderStatus}
                              </span>
                              <span className="font-mono text-[10px] text-[#7F766A]">
                                #{sale.orderId.slice(0, 8).toUpperCase()} - {new Date(sale.soldAt).toLocaleDateString("id-ID")}
                              </span>
                            </div>
                          ) : (
                            <span className="text-[#7F766A]">Detail pesanan belum tersedia</span>
                          )
                        ) : (
                          <span className="text-[#7F766A]">-</span>
                        )}
                      </td>
                      <td className="hidden md:table-cell px-4 py-4 font-body text-[#4D453C]">
                        {p.created_at
                          ? new Date(p.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
                          : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="bg-[#F6F3F2] border-t border-[#D1C5B8] px-4 py-3 flex items-center justify-between">
              <span className="font-body text-xs font-bold text-[#4D453C]">
                Showing {filtered.length} of {products.length} Products
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
