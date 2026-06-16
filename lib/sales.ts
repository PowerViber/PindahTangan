import { supabase } from "./supabase";

export interface ProductSaleInfo {
  orderId: string;
  buyerId: string;
  buyerName: string;
  buyerEmail: string;
  paymentMethod: string;
  orderStatus: string;
  soldAt: string;
  paidAt: string | null;
  price: number;
  total: number;
}

export const paymentMethodLabel: Record<string, string> = {
  QRIS: "QRIS",
  CARD: "Kartu Debit/Kredit",
  CASH: "Tunai (COD)",
};

interface RawSaleDetail {
  product_id: string;
  order_id: string;
  buyer_id: string;
  buyer_name: string;
  buyer_email: string;
  payment_method: string;
  order_status: string;
  sold_at: string;
  paid_at: string | null;
  price: number | string;
  total: number | string;
}

export async function fetchSalesByProductIds(productIds: string[]) {
  const uniqueProductIds = Array.from(new Set(productIds.filter(Boolean)));
  if (uniqueProductIds.length === 0) return {} as Record<string, ProductSaleInfo>;

  const { data, error } = await supabase.rpc("sold_product_details", {
    p_product_ids: uniqueProductIds,
  });

  if (error || !data) {
    return {} as Record<string, ProductSaleInfo>;
  }

  return (data as RawSaleDetail[]).reduce<Record<string, ProductSaleInfo>>((acc, item) => {
    acc[item.product_id] = {
      orderId: item.order_id,
      buyerId: item.buyer_id,
      buyerName: item.buyer_name,
      buyerEmail: item.buyer_email,
      paymentMethod: item.payment_method,
      orderStatus: item.order_status,
      soldAt: item.sold_at,
      paidAt: item.paid_at,
      price: Number(item.price) || 0,
      total: Number(item.total) || 0,
    };
    return acc;
  }, {});
}
