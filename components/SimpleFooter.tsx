export default function SimpleFooter() {
  return (
    <footer className="bg-[#E4E2E1] border-t border-[#D1C5B8] py-6 mt-10">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="text-sm text-[#1B1C1C] font-body">
          © 2024 PindahTangan. Refined Electronics Logistics
        </div>
        <div className="flex gap-6 text-xs font-bold text-[#4D453C] uppercase tracking-wide">
          <span className="cursor-pointer hover:text-[#1B1C1C]">Privacy Policy</span>
          <span className="cursor-pointer hover:text-[#1B1C1C]">Terms of Service</span>
          <span className="cursor-pointer hover:text-[#1B1C1C]">Support</span>
        </div>
      </div>
    </footer>
  );
}
