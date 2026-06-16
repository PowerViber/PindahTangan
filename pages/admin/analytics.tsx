import { useEffect, useMemo, useState } from "react";
import { IconClock } from "../../components/Icons";
import { supabase } from "../../lib/supabase";
import { formatIDR } from "../../components/ProductCard";

interface Submission {
  id: string;
  status: string;
  estimation_price: number | string | null;
  created_at: string;
}

interface Product {
  id: string;
  name: string;
  grade: string;
  price: number | string;
  sold?: boolean;
  created_at?: string;
}

interface MonthlyDatum {
  month: string;
  submissions: number;
  products: number;
  revenue: number;
}

interface GradeDatum {
  label: string;
  pct: number;
  color: string;
}

interface StatusDatum {
  label: string;
  count: number;
  color: string;
}

const MONTH_LABELS = ["JAN", "FEB", "MAR", "APR", "MEI", "JUN", "JUL", "AGT", "SEP", "OKT", "NOV", "DES"];
const GRADE_COLORS: Record<string, string> = {
  MINT: "#1B1C1C",
  GOOD: "#D2B48C",
  FAIR: "#E8E2D9",
  Unknown: "#7F766A",
};

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "#7F766A",
  PENDING: "#FEDDB3",
  ACTIVE: "#D2B48C",
  SOLD: "#1B1C1C",
  CANCELLED: "#BA1A1A",
  Unknown: "#4D453C",
};
const STATUS_ORDER = ["DRAFT", "PENDING", "ACTIVE", "SOLD", "CANCELLED"];

function toNumber(value: number | string | null | undefined) {
  return Number(value) || 0;
}

function sameMonth(dateStr: string | undefined, month: number, year: number) {
  if (!dateStr) return false;
  const date = new Date(dateStr);
  return date.getMonth() === month && date.getFullYear() === year;
}

function buildMonthlyData(submissions: Submission[], products: Product[]) {
  const now = new Date();
  return Array.from({ length: 6 }, (_, index) => {
    const offset = 5 - index;
    const date = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    const month = date.getMonth();
    const year = date.getFullYear();
    const productsInMonth = products.filter((product) => sameMonth(product.created_at, month, year));

    return {
      month: MONTH_LABELS[month],
      submissions: submissions.filter((submission) => sameMonth(submission.created_at, month, year)).length,
      products: productsInMonth.length,
      revenue: productsInMonth.reduce((sum, product) => sum + toNumber(product.price), 0),
    };
  });
}

function buildGradeDistribution(products: Product[]) {
  const gradeCounts = products.reduce<Record<string, number>>((acc, product) => {
    const grade = product.grade || "Unknown";
    acc[grade] = (acc[grade] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(gradeCounts).map(([label, count]) => ({
    label,
    pct: products.length > 0 ? Math.round((count / products.length) * 100) : 0,
    color: GRADE_COLORS[label] || GRADE_COLORS.Unknown,
  }));
}

function statusCount(submissions: Submission[], status: string) {
  return submissions.filter((submission) => submission.status === status).length;
}

function buildStatusDistribution(submissions: Submission[]) {
  const counts = submissions.reduce<Record<string, number>>((acc, submission) => {
    const status = submission.status || "Unknown";
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(counts)
    .sort(([a], [b]) => {
      const aIndex = STATUS_ORDER.indexOf(a);
      const bIndex = STATUS_ORDER.indexOf(b);

      if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    })
    .map(([label, count]) => ({
      label,
      count,
      color: STATUS_COLORS[label] || STATUS_COLORS.Unknown,
    }));
}

function LoadingBlock() {
  return (
    <div className="flex justify-center py-16">
      <div className="w-8 h-8 border-2 border-[#725A39] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function KpiCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[#FBF9F8] border border-[#E8E2D9] rounded-lg p-6">
      <div className="font-body text-xs font-bold text-[#4D453C] tracking-wide mb-3">{label}</div>
      <span className="font-sans text-3xl font-semibold text-[#1B1C1C]">{value}</span>
    </div>
  );
}

function StatusCard({ item }: { item: StatusDatum }) {
  return (
    <div className="bg-[#FBF9F8] border border-[#E8E2D9] rounded-lg p-5">
      <div className="flex items-center gap-2 mb-2">
        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
        <span className="font-body text-xs font-bold text-[#4D453C] tracking-wide">{item.label.toUpperCase()}</span>
      </div>
      <div className="font-serif text-2xl font-semibold text-[#1B1C1C]">{item.count}</div>
    </div>
  );
}

function RevenueTrend({ monthlyData }: { monthlyData: MonthlyDatum[] }) {
  const maxRevenue = Math.max(...monthlyData.map((item) => item.revenue), 1);

  return (
    <section className="bg-[#FBF9F8] border border-[#E8E2D9] rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-serif text-xl font-semibold text-[#1B1C1C]">Revenue Trends</h2>
        <span className="border border-[#D1C5B8] rounded-full px-3 py-1 text-xs font-body text-[#4D453C]">6 Bulan</span>
      </div>
      <div className="flex items-end gap-3 h-56">
        {monthlyData.map((item, index) => (
          <div key={item.month} className="flex-1 flex flex-col items-center gap-2 justify-end h-full">
            <span className="font-mono text-[9px] text-[#735A39] font-bold">
              {item.revenue > 0 ? formatIDR(item.revenue).replace("Rp", "").trim() : "0"}
            </span>
            <div
              className={`w-full rounded-t-sm ${index === monthlyData.length - 1 ? "bg-[#725A39]" : "bg-[#E8E2D9]"}`}
              style={{ height: `${Math.max((item.revenue / maxRevenue) * 80, 4)}%` }}
            />
            <span className="font-mono text-[10px] text-[#5F5E5E] font-semibold">{item.month}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function ProductGradePanel({ grades }: { grades: GradeDatum[] }) {
  const rings = grades.reduce<Array<GradeDatum & { offset: number }>>((acc, grade) => {
    const offset = acc.reduce((sum, item) => sum + item.pct, 0);
    return [...acc, { ...grade, offset }];
  }, []);

  return (
    <section className="bg-[#FBF9F8] border border-[#E8E2D9] rounded-lg p-6">
      <h2 className="font-serif text-xl font-semibold text-[#1B1C1C] mb-6">Product Grade</h2>
      {grades.length > 0 ? (
        <>
          <div className="flex flex-col gap-3 mb-6">
            {grades.map((grade) => (
              <div key={grade.label} className="flex justify-between text-sm">
                <span className="font-body text-[#1B1C1C]">{grade.label}</span>
                <span className="font-body font-bold text-[#1B1C1C]">{grade.pct}%</span>
              </div>
            ))}
          </div>
          <svg viewBox="0 0 42 42" className="w-32 h-32 mx-auto">
            {rings.map((grade) => {
              const dash = grade.pct;
              return (
                <circle
                  key={grade.label}
                  cx="21"
                  cy="21"
                  r="15.9"
                  fill="transparent"
                  stroke={grade.color}
                  strokeWidth="6"
                  strokeDasharray={`${dash} ${100 - dash}`}
                  strokeDashoffset={`${25 - grade.offset}`}
                  transform="rotate(-90 21 21)"
                />
              );
            })}
          </svg>
        </>
      ) : (
        <div className="text-center py-8 font-sans text-sm text-[#7F766A]">Belum ada data produk.</div>
      )}
    </section>
  );
}

function TurnoverChart({ monthlyData }: { monthlyData: MonthlyDatum[] }) {
  const maxTurnover = Math.max(...monthlyData.flatMap((item) => [item.submissions, item.products]), 1);

  return (
    <section className="bg-[#FBF9F8] border border-[#E8E2D9] rounded-lg p-10">
      <div className="flex justify-between items-center mb-10">
        <h2 className="font-serif text-xl font-semibold text-[#1B1C1C]">Submissions vs Products (Monthly)</h2>
        <div className="flex gap-4 text-xs font-body text-[#4D453C]">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#D2B48C]" /> Submissions</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#1B1C1C]" /> Products Added</span>
        </div>
      </div>
      <div className="flex items-end gap-6 h-64 border-b border-[#E8E2D9] pb-2">
        {monthlyData.map((item) => (
          <div key={item.month} className="flex-1 flex items-end justify-center gap-1">
            <div className="w-12 rounded-t-sm bg-[#D2B48C]" style={{ height: `${Math.max((item.submissions / maxTurnover) * 100, 4)}%` }} />
            <div className="w-12 rounded-t-sm bg-[#1B1C1C]" style={{ height: `${Math.max((item.products / maxTurnover) * 100, 4)}%` }} />
          </div>
        ))}
      </div>
      <div className="flex gap-6 mt-3">
        {monthlyData.map((item) => (
          <div key={item.month} className="flex-1 text-center font-body text-xs font-bold text-[#4D453C]">{item.month}</div>
        ))}
      </div>
    </section>
  );
}

export default function AnalyticsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalyticsData() {
      setLoading(true);
      const [subRes, prodRes] = await Promise.all([
        supabase.from("submissions").select("*").order("created_at", { ascending: false }),
        supabase.from("products").select("*").order("created_at", { ascending: false }),
      ]);

      if (subRes.data) setSubmissions(subRes.data);
      if (prodRes.data) setProducts(prodRes.data);
      setLoading(false);
    }

    loadAnalyticsData();
  }, []);

  const analytics = useMemo(() => {
    const soldProducts = products.filter((product) => product.sold);
    const totalRevenue = soldProducts.reduce((sum, product) => sum + toNumber(product.price), 0);
    const totalEstimation = submissions.reduce((sum, submission) => sum + toNumber(submission.estimation_price), 0);
    const soldCount = statusCount(submissions, "SOLD");
    const avgMargin =
      totalEstimation > 0 && totalRevenue > 0
        ? Math.round(((totalRevenue - totalEstimation * 0.7) / totalRevenue) * 100 * 10) / 10
        : 0;
    const conversionRate =
      submissions.length > 0
        ? Math.round((soldCount / submissions.length) * 100 * 10) / 10
        : 0;

    return {
      kpis: [
        { label: "TOTAL SUBMISSIONS", value: String(submissions.length) },
        { label: "TOTAL REVENUE", value: formatIDR(totalRevenue) },
        { label: "EST. MARGIN", value: `${avgMargin}%` },
        { label: "CONVERSION RATE", value: `${conversionRate}%` },
      ],
      statusCards: buildStatusDistribution(submissions),
      monthlyData: buildMonthlyData(submissions, products),
      gradeDistribution: buildGradeDistribution(products),
    };
  }, [products, submissions]);

  return (
    <div className="px-12 py-10 max-w-5xl">
      <header className="flex items-center justify-between border-b border-[#E8E2D9] pb-6 mb-10">
        <div>
          <h1 className="font-serif text-5xl font-semibold text-[#1B1C1C] mb-2">Performance Analytics</h1>
          <p className="font-sans text-base text-[#4D453C]">Monitoring ecosystem health and logistics throughput.</p>
        </div>
        <button className="flex items-center gap-2 bg-[#FBF9F8] border border-[#D1C5B8] rounded-sm px-4 py-2.5">
          <IconClock className="w-3.5 h-3.5 text-[#4D453C]" />
          <span className="font-body text-sm font-medium text-[#1B1C1C]">All Time</span>
        </button>
      </header>

      {loading ? (
        <LoadingBlock />
      ) : (
        <>
          <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            {analytics.kpis.map((item) => (
              <KpiCard key={item.label} label={item.label} value={item.value} />
            ))}
          </section>

          <section className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            {analytics.statusCards.map((item) => (
              <StatusCard key={item.label} item={item} />
            ))}
          </section>

          <div className="grid lg:grid-cols-[2fr_1fr] gap-5 mb-8">
            <RevenueTrend monthlyData={analytics.monthlyData} />
            <ProductGradePanel grades={analytics.gradeDistribution} />
          </div>

          <TurnoverChart monthlyData={analytics.monthlyData} />
        </>
      )}
    </div>
  );
}
