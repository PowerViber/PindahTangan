import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useAuth } from "../../lib/AuthContext";
import { supabase } from "../../lib/supabase";
import { formatIDR } from "../../components/ProductCard";
import { IconBox } from "../../components/Icons";

interface Order {
  id: string;
  total: number;
  payment_method: "QRIS" | "CASH" | "CARD" | string;
  status: "PENDING" | "PAID" | "CANCELLED" | string;
  created_at: string;
}

const paymentLabel: Record<string, string> = {
  QRIS: "QRIS",
  CASH: "Tunai (COD)",
  CARD: "Kartu Debit/Kredit",
};

const statusStyle: Record<string, string> = {
  PAID: "bg-[#1B1C1C] text-white",
  PENDING: "bg-[#FEDDB3] text-[#5B4526]",
  CANCELLED: "bg-[#E8E2D9] text-[#7F766A]",
};

export default function OrdersPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      async function loadOrders() {
        setLoading(true);
        const { data } = await supabase
          .from("orders")
          .select("*")
          .eq("user_id", user!.id)
          .order("created_at", { ascending: false });
        setOrders(data || []);
        setLoading(false);
      }
      loadOrders();
    }
  }, [user]);

  if (authLoading || !user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#725A39] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 flex flex-col gap-8">
      <h1 className="font-serif text-3xl md:text-4xl font-bold text-[#1B1C1C]">Pesanan Saya</h1>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-[#725A39] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white border border-[#E8E2D9] rounded-2xl p-16 text-center text-[#7F766A] flex flex-col items-center gap-4">
          <IconBox className="w-12 h-12 text-[#A89070]/40" />
          <p className="text-base font-semibold text-[#1B1C1C]">Belum ada pesanan</p>
          <Link
            href="/marketplace"
            className="mt-2 bg-[#D2B48C] hover:bg-[#C5A67F] text-[#5B4526] font-body font-semibold text-sm px-6 py-3 rounded-lg transition-colors"
          >
            Jelajahi Marketplace
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
              className="bg-white border border-[#E8E2D9] hover:border-[#D1C5B8] rounded-xl p-5 flex items-center justify-between gap-4 transition-colors"
            >
              <div>
                <p className="font-mono text-xs text-[#7F766A] uppercase">Order #{order.id.slice(0, 8).toUpperCase()}</p>
                <p className="font-serif text-lg font-semibold text-[#1B1C1C]">{formatIDR(order.total)}</p>
                <p className="text-sm text-[#4D453C]">
                  {paymentLabel[order.payment_method] || order.payment_method} ·{" "}
                  {new Date(order.created_at).toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" })}
                </p>
              </div>
              <span className={`text-xs font-bold px-3 py-1 rounded-full tracking-wide uppercase whitespace-nowrap ${statusStyle[order.status] || statusStyle.PENDING}`}>
                {order.status}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
