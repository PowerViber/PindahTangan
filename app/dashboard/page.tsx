import Link from "next/link";
import { IconBox, IconTag, IconCheck, IconClipboard, IconStore, IconBell, IconTruck } from "../components/Icons";

const stats = [
  { label: "Active Listings", value: 3,  Icon: IconStore },
  { label: "Total Items",     value: 12, Icon: IconBox   },
  { label: "Active Bids",     value: 1,  Icon: IconTag   },
  { label: "Sold",            value: 5,  Icon: IconCheck },
];

const actionItems = [
  { title: "MacBook Pro 14\" — Tawaran Baru", desc: "Calon pembeli menawar Rp17.250.000 untuk barangmu.", time: "12m lalu", highlighted: true },
  { title: "Bid Baru di iPhone 13",           desc: "Tawaran sebesar Rp9.300.000 telah diterima.",          time: "1j lalu",  highlighted: false },
  { title: "Pickup Terjadwal",                desc: "Kurir akan datang besok pukul 10:00–12:00.",     time: "3j lalu",  highlighted: false },
];

const feed = [
  { name: "MacBook Pro 14\" (2021)", price: "Rp27.000.000", grade: "MINT" },
  { name: "Sony WH-1000XM4",         price: "Rp3.300.000",   grade: "GOOD" },
  { name: "iPad Air (2022)",         price: "Rp5.900.000",   grade: "GOOD" },
  { name: "Canon EOS M50",           price: "Rp8.100.000",   grade: "FAIR" },
];

export default function DashboardPage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-10">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 pb-6">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-6 h-6 bg-[#D2B48C] rounded-sm" />
            <span className="font-mono text-xs font-medium text-[#7F766A] tracking-wide">SELLER DASHBOARD</span>
          </div>
          <h1 className="font-serif text-4xl font-semibold text-[#1B1C1C]">Selamat Datang Kembali, Budi</h1>
        </div>
        <div className="flex gap-3">
          <Link
            href="/marketplace"
            className="flex items-center gap-2 bg-[#D2B48C] hover:bg-[#C5A67F] text-[#5B4526] font-body font-medium text-sm px-6 py-3 rounded-sm transition-colors"
          >
            <IconStore className="w-4 h-4" />
            View Marketplace
          </Link>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 mb-12">
        {/* Activity Overview */}
        <div className="lg:col-span-2">
          <h2 className="font-serif text-2xl font-medium text-[#1B1C1C] border-b border-[#D1C5B8] pb-2 mb-6">
            Activity Overview
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {stats.map((s) => (
              <div key={s.label} className="bg-white border border-[#D1C5B8] rounded-sm p-6 flex flex-col gap-2">
                <s.Icon className="w-5 h-5 text-[#725A39]" />
                <div className="font-serif text-3xl font-semibold text-[#1B1C1C]">{s.value}</div>
                <div className="font-body text-xs text-[#4D453C]">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Center */}
        <div>
          <h2 className="font-serif text-2xl font-medium text-[#1B1C1C] border-b border-[#D1C5B8] pb-2 mb-6 flex items-center gap-2">
            <IconBell className="w-4 h-4 text-[#725A39]" />
            Action Center
          </h2>
          <div className="flex flex-col gap-3">
            {actionItems.map((a) => (
              <div
                key={a.title}
                className={`bg-white rounded-sm p-6 border ${a.highlighted ? "border-[#725A39]" : "border-[#D1C5B8]"}`}
              >
                <div className="flex justify-between items-start gap-2 mb-1">
                  <span className="font-body text-sm font-bold text-[#1B1C1C]">{a.title}</span>
                </div>
                <p className="font-body text-xs text-[#4D453C] mb-2">{a.desc}</p>
                <span className="font-mono text-[10px] text-[#7F766A] tracking-wide">{a.time.toUpperCase()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Personalized Marketplace Feed */}
      <div>
        <div className="flex items-center justify-between border-b border-[#D1C5B8] pb-2 mb-6">
          <h2 className="font-serif text-2xl font-medium text-[#1B1C1C] flex items-center gap-2">
            <IconTruck className="w-4 h-4 text-[#725A39]" />
            Personalized Marketplace Feed
          </h2>
          <Link href="/marketplace" className="font-body text-sm font-bold text-[#725A39] hover:underline">
            View All
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {feed.map((f) => (
            <Link
              key={f.name}
              href="/marketplace"
              className="bg-white border border-[#E8E2D9] rounded-sm overflow-hidden hover:border-[#D1C5B8] transition-colors"
            >
              <div className="bg-[#FBF9F8] h-32 flex items-center justify-center text-[#A89070] text-xs relative">
                Foto Produk
                <span className="absolute top-2 left-2 bg-[#1B1C1C] text-white text-[10px] font-bold px-2 py-0.5 rounded-sm">
                  {f.grade}
                </span>
              </div>
              <div className="p-4">
                <div className="font-serif text-sm font-medium text-[#1B1C1C] mb-1">{f.name}</div>
                <div className="font-body text-sm font-bold text-[#1B1C1C]">{f.price}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
