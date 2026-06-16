import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import QRCode from "qrcode";
import { useAuth } from "../lib/AuthContext";
import { useCart } from "../lib/CartContext";
import { supabase } from "../lib/supabase";
import { formatIDR } from "../components/ProductCard";
import { IconQrCode, IconCard, IconCash } from "../components/Icons";

type PaymentMethod = "QRIS" | "CASH" | "CARD";

export default function CheckoutPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { items, loading: cartLoading, subtotal, clearCart } = useCart();
  const [method, setMethod] = useState<PaymentMethod>("QRIS");
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!cartLoading && items.length === 0) {
      router.push("/cart");
    }
  }, [cartLoading, items, router]);

  useEffect(() => {
    if (method !== "QRIS") return;
    const payload = `PINDAHTANGAN-QRIS|${user?.id ?? "guest"}|${subtotal}|${Date.now()}`;
    QRCode.toDataURL(payload, { width: 220, margin: 1, color: { dark: "#1B1C1C", light: "#FBF9F8" } })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(null));
  }, [method, subtotal, user]);

  async function handleConfirm() {
    if (!user || items.length === 0 || submitting) return;
    if (method === "CARD" && (!cardNumber.trim() || !cardExpiry.trim() || !cardCvc.trim())) {
      setError("Lengkapi data kartu terlebih dahulu.");
      return;
    }
    setError(null);
    setSubmitting(true);

    const status = method === "CASH" ? "PENDING" : "PAID";
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        total: subtotal,
        payment_method: method,
        status,
        paid_at: status === "PAID" ? new Date().toISOString() : null,
      })
      .select()
      .single();

    if (orderError || !order) {
      setError("Gagal membuat pesanan. Coba lagi.");
      setSubmitting(false);
      return;
    }

    const orderItems = items.map((item) => ({
      order_id: order.id,
      product_id: item.product.id,
      product_name: item.product.name,
      price: item.product.price,
    }));
    await supabase.from("order_items").insert(orderItems);

    const productIds = items.map((item) => item.product.id);
    await supabase.from("products").update({ sold: true }).in("id", productIds);

    await clearCart();
    router.push(`/orders/${order.id}`);
  }

  if (authLoading || !user || cartLoading || items.length === 0) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#725A39] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const methodOptions: { value: PaymentMethod; label: string; Icon: typeof IconQrCode }[] = [
    { value: "QRIS", label: "QRIS", Icon: IconQrCode },
    { value: "CARD", label: "Kartu Debit/Kredit", Icon: IconCard },
    { value: "CASH", label: "Tunai (COD)", Icon: IconCash },
  ];

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 flex flex-col gap-8">
      <h1 className="font-serif text-3xl md:text-4xl font-bold text-[#1B1C1C]">Pembayaran</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 flex flex-col gap-6">
          <div className="bg-white border border-[#D1C5B8] rounded-2xl p-6">
            <h2 className="font-serif text-lg font-semibold text-[#1B1C1C] mb-4">Pilih Metode Pembayaran</h2>
            <div className="grid grid-cols-3 gap-3">
              {methodOptions.map(({ value, label, Icon }) => (
                <button
                  key={value}
                  onClick={() => setMethod(value)}
                  className={`flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition-colors cursor-pointer ${
                    method === value
                      ? "border-[#725A39] bg-[#F6F3F2] shadow-xs"
                      : "border-[#D1C5B8] hover:bg-[#FBF9F8]"
                  }`}
                >
                  <Icon className={`w-6 h-6 ${method === value ? "text-[#725A39]" : "text-[#7F766A]"}`} />
                  <span className="text-xs font-semibold text-[#1B1C1C]">{label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white border border-[#D1C5B8] rounded-2xl p-6">
            {method === "QRIS" && (
              <div className="flex flex-col items-center gap-4 text-center">
                <p className="text-sm text-[#4D453C]">Scan kode QR di bawah ini menggunakan aplikasi e-wallet atau m-banking kamu.</p>
                {qrDataUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={qrDataUrl} alt="QRIS Code" className="rounded-xl border border-[#D1C5B8]" />
                ) : (
                  <div className="w-[220px] h-[220px] flex items-center justify-center bg-[#F6F3F2] rounded-xl border border-[#D1C5B8]">
                    <div className="w-6 h-6 border-2 border-[#725A39] border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
                <p className="text-xs text-[#7F766A] font-mono uppercase tracking-wide">Simulasi QRIS — bukan transaksi nyata</p>
              </div>
            )}

            {method === "CARD" && (
              <div className="flex flex-col gap-4">
                <p className="text-sm text-[#4D453C]">Masukkan detail kartu (simulasi — data tidak diproses ke bank manapun).</p>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#4D453C]">Nomor Kartu</label>
                  <input
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                    className="border border-[#D1C5B8] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#725A39]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-[#4D453C]">Berlaku Hingga</label>
                    <input
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      placeholder="MM/YY"
                      maxLength={5}
                      className="border border-[#D1C5B8] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#725A39]"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-[#4D453C]">CVC</label>
                    <input
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value)}
                      placeholder="123"
                      maxLength={4}
                      className="border border-[#D1C5B8] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#725A39]"
                    />
                  </div>
                </div>
              </div>
            )}

            {method === "CASH" && (
              <div className="flex flex-col gap-2 text-center py-4">
                <p className="text-sm text-[#4D453C]">
                  Bayar tunai saat barang diambil/diantar oleh kurir kami. Pesanan akan ditandai{" "}
                  <span className="font-semibold text-[#1B1C1C]">menunggu pembayaran</span> sampai kurir
                  mengonfirmasi penerimaan uang.
                </p>
              </div>
            )}
          </div>

          {error && <p className="text-sm text-[#BA1A1A] font-semibold">{error}</p>}
        </div>

        <div className="w-full lg:w-80 bg-white border border-[#D1C5B8] rounded-2xl p-6 flex flex-col gap-5 self-start">
          <h2 className="font-serif text-xl font-semibold text-[#1B1C1C] border-b border-[#D1C5B8] pb-3">
            Ringkasan
          </h2>
          <div className="flex flex-col gap-2 text-sm text-[#4D453C] max-h-48 overflow-y-auto">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between gap-2">
                <span className="line-clamp-1">{item.product.name}</span>
                <span className="font-semibold text-[#1B1C1C] whitespace-nowrap">{formatIDR(item.product.price)}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between border-t border-[#D1C5B8] pt-4">
            <span className="font-semibold text-[#1B1C1C]">Total</span>
            <span className="font-bold text-xl text-[#1B1C1C]">{formatIDR(subtotal)}</span>
          </div>
          <button
            onClick={handleConfirm}
            disabled={submitting}
            className="w-full bg-[#1B1C1C] hover:bg-[#333333] text-white rounded-xl py-3.5 font-semibold transition-colors cursor-pointer disabled:opacity-60"
          >
            {submitting ? "Memproses..." : method === "CASH" ? "Konfirmasi Pesanan" : "Saya Sudah Bayar"}
          </button>
        </div>
      </div>
    </div>
  );
}
