import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { IconMapPin, IconTruck, IconClock } from "../../components/Icons";
import { supabase } from "../../lib/supabase";

interface Submission {
  id: string;
  product_name: string;
  status: string;
  pickup_date?: string | null;
  pickup_time?: string | null;
  address?: string;
  contact?: string;
  created_at: string;
}

interface SummaryItem {
  label: string;
  value: number;
  Icon: typeof IconTruck;
}

function timeAgo(dateStr: string) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) return `${mins}m yang lalu`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}j yang lalu`;
  const days = Math.floor(hours / 24);
  return `${days}h yang lalu`;
}

function getStatusClasses(status: string, selected = false) {
  if (selected) {
    return "bg-[#4D453C] text-[#D1C5B8] border-[#4D453C]";
  }

  const styles: Record<string, string> = {
    PENDING: "bg-[#FEDDB3] border-[#725A39]/30 text-[#725A39]",
    ACTIVE: "bg-green-50 border-green-200 text-green-700",
    SOLD: "bg-[#1B1C1C] border-[#1B1C1C] text-white",
    CANCELLED: "bg-red-50 border-red-200 text-red-700",
    DRAFT: "bg-[#F6F3F2] border-[#D1C5B8] text-[#7F766A]",
  };

  return styles[status] || "bg-[#F6F3F2] border-[#D1C5B8] text-[#4D453C]";
}

function SummaryCard({ item }: { item: SummaryItem }) {
  return (
    <div className="bg-[#FBF9F8] border border-[#D1C5B8] rounded-lg p-5 flex items-start justify-between gap-4">
      <div>
        <div className="font-serif text-2xl font-semibold text-[#1B1C1C]">{item.value}</div>
        <div className="font-body text-xs text-[#4D453C]">{item.label}</div>
      </div>
      <item.Icon className="w-4 h-4 text-[#7F766A]" />
    </div>
  );
}

function LoadingBlock() {
  return (
    <div className="flex justify-center py-16">
      <div className="w-8 h-8 border-2 border-[#725A39] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function SubmissionAvatar({ name }: { name: string }) {
  return (
    <div className="w-10 h-10 bg-[#E1DFDC] rounded-lg flex items-center justify-center text-[#7F766A] font-bold text-sm shadow-2xs flex-shrink-0">
      {name[0]?.toUpperCase()}
    </div>
  );
}

function PickupDetail({ selected }: { selected: Submission | undefined }) {
  return (
    <section className="lg:col-span-2 bg-[#FBF9F8] border border-[#D1C5B8] rounded-lg p-5">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#D1C5B8]">
        <span className="font-body text-sm font-bold text-[#1B1C1C]">
          {selected ? "Detail Pickup" : "Pilih item di samping"}
        </span>
        {selected && (
          <span className={`text-xs font-bold px-3 py-1 rounded-full border ${getStatusClasses(selected.status)}`}>
            {selected.status}
          </span>
        )}
      </div>

      {selected ? (
        <div className="flex flex-col gap-4">
          <div className="bg-white border border-[#D1C5B8] rounded-lg p-4 flex items-start gap-4">
            <SubmissionAvatar name={selected.product_name} />
            <div className="flex-1">
              <h3 className="font-body text-base font-bold text-[#1B1C1C]">{selected.product_name}</h3>
              <div className="font-mono text-[10px] text-[#7F766A] mt-0.5">{selected.id.slice(0, 8).toUpperCase()}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <InfoPanel
              Icon={IconClock}
              label="Jadwal"
              value={selected.pickup_date || "Belum dijadwalkan"}
              detail={selected.pickup_time || "-"}
            />
            <InfoPanel
              Icon={IconMapPin}
              label="Alamat"
              value={selected.address || "Belum diisi"}
              detail={selected.contact ? `Kontak: ${selected.contact}` : undefined}
            />
          </div>

          <Link
            href={`/admin/qc/${selected.id}`}
            className="bg-[#D2B48C] hover:bg-[#C5A67F] text-[#5B4526] font-body font-bold text-sm px-5 py-2.5 rounded-sm transition-colors w-fit"
          >
            Buka Detail QC
          </Link>
        </div>
      ) : (
        <div className="text-center py-12 font-sans text-sm text-[#7F766A]">
          Pilih salah satu submission di panel kanan.
        </div>
      )}
    </section>
  );
}

function InfoPanel({
  Icon,
  label,
  value,
  detail,
}: {
  Icon: typeof IconClock;
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <div className="bg-white border border-[#D1C5B8] rounded-lg p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-3.5 h-3.5 text-[#725A39]" />
        <span className="font-body text-xs font-bold text-[#4D453C]">{label}</span>
      </div>
      <div className="font-body text-sm font-bold text-[#1B1C1C] line-clamp-2">{value}</div>
      {detail && <div className="font-body text-xs text-[#4D453C] mt-1">{detail}</div>}
    </div>
  );
}

function SubmissionList({
  submissions,
  selectedId,
  onSelect,
}: {
  submissions: Submission[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <aside className="bg-[#FBF9F8] border border-[#D1C5B8] rounded-lg p-5 max-h-[600px] overflow-y-auto">
      <h2 className="font-body font-bold text-[#1B1C1C] mb-4 text-sm">All Submissions</h2>
      {submissions.length === 0 ? (
        <div className="text-center py-8 font-sans text-sm text-[#7F766A]">
          Tidak ada submission.
        </div>
      ) : (
        <div className="space-y-2">
          {submissions.map((submission) => {
            const selected = selectedId === submission.id;
            return (
              <button
                key={submission.id}
                onClick={() => onSelect(submission.id)}
                className={`w-full text-left rounded-sm p-3 border transition-colors cursor-pointer ${
                  selected ? "bg-[#1B1C1C] border-[#1B1C1C] text-white" : "bg-white border-[#D1C5B8] hover:border-[#725A39]"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-body font-bold text-sm line-clamp-1">{submission.product_name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-sm ${getStatusClasses(submission.status, selected)}`}>
                    {submission.status}
                  </span>
                </div>
                <div className={`font-body text-xs mt-1 ${selected ? "text-[#D1C5B8]" : "text-[#4D453C]"}`}>
                  {submission.pickup_date || "No pickup date"} - {timeAgo(submission.created_at)}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </aside>
  );
}

export default function LogisticsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    async function loadLogisticsData() {
      setLoading(true);
      const { data, error } = await supabase
        .from("submissions")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setSubmissions(data);
        setSelectedId((current) => current || data[0]?.id || null);
      }
      setLoading(false);
    }

    loadLogisticsData();
  }, []);

  const dashboard = useMemo(() => {
    const scheduledPickups = submissions.filter((submission) => submission.pickup_date);
    const pendingPickup = submissions.filter((submission) => submission.status === "PENDING");
    const selected = submissions.find((submission) => submission.id === selectedId);

    return {
      selected,
      summaryItems: [
        { label: "Total Submissions", value: submissions.length, Icon: IconTruck },
        { label: "Scheduled Pickups", value: scheduledPickups.length, Icon: IconClock },
        { label: "Pending Pickup", value: pendingPickup.length, Icon: IconMapPin },
      ] satisfies SummaryItem[],
    };
  }, [selectedId, submissions]);

  return (
    <div className="px-12 py-10 max-w-5xl">
      <div className="flex items-center justify-between mb-1">
        <h1 className="font-serif text-3xl font-semibold text-[#1B1C1C]">Logistics Dashboard</h1>
        <Link
          href="/admin/qc"
          className="bg-[#725A39] hover:bg-[#5B4526] text-white px-5 py-2.5 rounded-sm text-sm font-body font-bold transition-colors"
        >
          QC Queue -&gt;
        </Link>
      </div>
      <p className="font-sans text-base text-[#4D453C] mb-8">Kelola dan pantau rute pickup &amp; pengiriman secara aktif.</p>

      {loading ? (
        <LoadingBlock />
      ) : (
        <>
          <section className="grid grid-cols-3 gap-4 mb-6">
            {dashboard.summaryItems.map((item) => (
              <SummaryCard key={item.label} item={item} />
            ))}
          </section>

          <div className="grid lg:grid-cols-3 gap-6">
            <PickupDetail selected={dashboard.selected} />
            <SubmissionList submissions={submissions} selectedId={selectedId} onSelect={setSelectedId} />
          </div>
        </>
      )}
    </div>
  );
}
