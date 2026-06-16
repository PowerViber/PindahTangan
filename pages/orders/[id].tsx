import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useAuth } from "../../lib/AuthContext";
import { supabase } from "../../lib/supabase";
import { formatIDR } from "../../components/ProductCard";
import { IconCheck, IconClock, IconStore } from "../../components/Icons";

interface OrderItem {
  id: string;
  product_id: string | null;
  product_name: string;
  price: number;
}

interface Order {
  id: string;
  total: number;
  payment_method: "QRIS" | "CASH" | "CARD" | string;
  status: "PENDING" | "PAID" | "CANCELLED" | string;
  created_at: string;
  paid_at: string | null;
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

export default function OrderDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user, loading: authLoading } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!id || !user) return;

    async function loadOrder() {
      setLoading(true);
      const { data: orderData } = await supabase
        .from("orders")
        .select("*")
        .eq("id", id)
        .eq("user_id", user!.id)
        .single();

      if (orderData) {
        setOrder(orderData);
        const { data: itemsData } = await supabase
          .from("order_items")
          .select("*")
          .eq("order_id", orderData.id);
        setOrderItems(itemsData || []);
      } else {
        setOrder(null);
      }
      setLoading(false);
    }

    loadOrder();
  }, [id, user]);

  if (authLoading || loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#725A39] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-20 text-center text-[#7F766A]">
        <p className="text-xl font-semibold mb-4">Pesanan tidak ditemukan.</p>
        <Link href="/orders" className="text-[#725A39] font-semibold hover:underline">
          Lihat semua pesanan
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-12 flex flex-col gap-8">
      <div className="bg-white border border-[#D1C5B8] rounded-2xl p-8 flex flex-col items-center gap-4 text-center">
        <div className="w-16 h-16 rounded-full bg-[#1B1C1C] flex items-center justify-center">
          {order.status === "PENDING" ? (
            <IconClock className="w-8 h-8 text-white" />
          ) : (
            <IconCheck className="w-8 h-8 text-white" />
          )}
        </div>
        <h1 className="font-serif text-2xl font-bold text-[#1B1C1C]">
          {order.status === "PAID" ? "Pembayaran Berhasil" : order.status === "PENDING" ? "Pesanan Dikonfirmasi" : "Pesanan Dibatalkan"}
        </h1>
        <span className={`text-xs font-bold px-3 py-1 rounded-full tracking-wide uppercase ${statusStyle[order.status] || statusStyle.PENDING}`}>
          {order.status}
        </span>
        <p className="text-sm text-[#7F766A] font-mono">Order #{order.id.slice(0, 8).toUpperCase()}</p>
      </div>

      <div className="bg-white border border-[#D1C5B8] rounded-2xl p-6 flex flex-col gap-4">
        <h2 className="font-serif text-lg font-semibold text-[#1B1C1C] border-b border-[#D1C5B8] pb-3">
          Detail Pesanan
        </h2>
        <div className="flex flex-col gap-3">
          {orderItems.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span className="text-[#4D453C]">{item.product_name}</span>
              <span className="font-semibold text-[#1B1C1C]">{formatIDR(item.price)}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-between border-t border-[#D1C5B8] pt-4 text-sm">
          <span className="text-[#4D453C]">Metode Pembayaran</span>
          <span className="font-semibold text-[#1B1C1C]">{paymentLabel[order.payment_method] || order.payment_method}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-[#4D453C]">Tanggal</span>
          <span className="font-semibold text-[#1B1C1C]">
            {new Date(order.created_at).toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" })}
          </span>
        </div>
        <div className="flex justify-between border-t border-[#D1C5B8] pt-4">
          <span className="font-semibold text-[#1B1C1C]">Total</span>
          <span className="font-bold text-xl text-[#1B1C1C]">{formatIDR(order.total)}</span>
        </div>
      </div>

      <div className="flex gap-4">
        <Link
          href="/marketplace"
          className="flex-1 flex items-center justify-center gap-2 border border-[#1B1C1C] text-[#1B1C1C] rounded-xl py-3.5 font-semibold hover:bg-[#F5F3F3] transition-colors"
        >
          <IconStore className="w-4 h-4" />
          Lanjut Belanja
        </Link>
        <Link
          href="/orders"
          className="flex-1 flex items-center justify-center bg-[#1B1C1C] hover:bg-[#333333] text-white rounded-xl py-3.5 font-semibold transition-colors"
        >
          Lihat Semua Pesanan
        </Link>
      </div>
    </div>
  );
}
