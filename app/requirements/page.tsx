"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  FileText,
  Camera,
  Folder,
  Plane,
  CreditCard,
  Mail,
  Syringe,
  GraduationCap,
  ScrollText,
  Wallet,
  MapPin,
  Shield,
  Briefcase,
  Building2,
  FileCheck,
  Ticket,
  Stamp,
  ChevronDown,
  Menu,
  X,
} from "lucide-react";

const sections: Record<string, { label: string; subtitle: string; icon: React.ReactNode; color: string; items: { icon: React.ReactNode; title: string; description: string }[] }> = {
  general: {
    label: "General",
    subtitle: "All visa types",
    icon: <FileText size={20} />,
    color: "#006B3F",
    items: [
      { icon: <FileText size={22} />, title: "Valid Passport", description: "A passport valid for at least six (6) months beyond your intended stay in Ghana." },
      { icon: <Camera size={22} />, title: "Passport-Sized Photo", description: "A clear, recent colored photo meeting standard visa photo guidelines." },
      { icon: <Folder size={22} />, title: "Supporting Documents", description: "Invitation letter, business letter, or other supporting documents depending on visa type." },
      { icon: <Plane size={22} />, title: "Travel Details", description: "Information about your travel dates, purpose of visit, and accommodation arrangements." },
      { icon: <CreditCard size={22} />, title: "Proof of Payment", description: "Valid debit/credit card or mobile money method for secure online payment." },
      { icon: <Mail size={22} />, title: "Active Email Address", description: "To receive notifications and your approved e-Visa." },
      { icon: <Syringe size={22} />, title: "Yellow Fever Card", description: "Required at port of entry. You must present proof of yellow fever vaccination upon arrival in Ghana." },
    ],
  },
  student: {
    label: "Student",
    subtitle: "Study visas",
    icon: <GraduationCap size={20} />,
    color: "#2E6B96",
    items: [
      { icon: <GraduationCap size={22} />, title: "Admission Letter", description: "Official acceptance letter from Ghanaian institution." },
      { icon: <ScrollText size={22} />, title: "Academic Transcripts", description: "Documents showing approved previous academic records and certificates." },
      { icon: <Wallet size={22} />, title: "Financial Sponsorship", description: "Proof of financial support for studies." },
    ],
  },
  tourist: {
    label: "Tourist",
    subtitle: "Tourism visas",
    icon: <Plane size={20} />,
    color: "#006B3F",
    items: [
      { icon: <MapPin size={22} />, title: "Travel Itinerary", description: "Detailed travel plans and places to visit in Ghana." },
      { icon: <Shield size={22} />, title: "Travel Insurance", description: "Medical and travel insurance covering Ghana." },
    ],
  },
  business: {
    label: "Business",
    subtitle: "Business visas",
    icon: <Briefcase size={20} />,
    color: "#C8962E",
    items: [
      { icon: <Briefcase size={22} />, title: "Employment Letter", description: "Letter from your employer confirming your employment." },
      { icon: <Building2 size={22} />, title: "Company Registration", description: "Certificate of incorporation of inviting company." },
      { icon: <FileCheck size={22} />, title: "Business Invitation", description: "Official invitation letter from Ghanaian company." },
    ],
  },
  transit: {
    label: "Transit",
    subtitle: "Transit visas",
    icon: <Ticket size={20} />,
    color: "#CE1126",
    items: [
      { icon: <Ticket size={22} />, title: "Onward Travel Ticket", description: "Confirmed ticket to final destination." },
      { icon: <Stamp size={22} />, title: "Visa for Final Destination", description: "Valid visa for your final destination." },
    ],
  },
};

export default function RequirementsPage() {
  const [openSection, setOpenSection] = useState<string>("general");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const current = sections[openSection];

  return (
    <div className="min-h-screen bg-white">
      {/* Ghana flag accent strip */}
      <div className="fixed top-0 left-0 right-0 z-[60] flex h-1">
        <div className="flex-1 bg-[#CE1126]" />
        <div className="flex-1 bg-[#C8962E]" />
        <div className="flex-1 bg-[#006B3F]" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-1 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <Link href="/" className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <div className="flex items-center gap-2">
                <img src="/gis-logo-cxytxk.png" alt="Ministry of Foreign Affairs" width={40} height={40} className="drop-shadow-md" />
                <img src="/gis-logo-new.png" alt="Ghana Immigration Service" width={40} height={40} className="drop-shadow-md" />
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-bold text-gray-900 tracking-wide leading-tight">Republic of Ghana</p>
                <p className="text-[10px] text-gray-400 tracking-widest uppercase">Electronic Visa Portal</p>
              </div>
            </Link>
            <div className="hidden md:flex items-center gap-1">
              {[
                { label: "Home", href: "/" },
                { label: "Visa Types", href: "/#visa-types" },
                { label: "Visa Requirements", href: "/visa-requirements", active: true },
                { label: "Track Application", href: "/track" },
                { label: "Help", href: "/help" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-sm font-medium px-3.5 py-2 rounded-lg transition-colors ${
                    item.active ? "text-[#006B3F] bg-[#006B3F]/5" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              <div className="w-px h-6 bg-gray-200 mx-2" />
              <Link href="/register" className="inline-flex items-center gap-2 bg-[#006B3F] hover:bg-[#005A34] text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-all shadow-lg shadow-[#006B3F]/20 ml-1">
                Apply Now <ArrowRight size={14} />
              </Link>
            </div>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 text-gray-700 rounded-lg">
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 shadow-xl animate-slide-down">
            <div className="px-5 py-4 space-y-1">
              {["Home|/", "Visa Types|/#visa-types", "Visa Requirements|/visa-requirements", "Track Application|/track", "Help|/help"].map((item) => {
                const [label, href] = item.split("|");
                return <Link key={href} href={href} onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg">{label}</Link>;
              })}
              <Link href="/register" onClick={() => setMobileMenuOpen(false)} className="block text-center bg-[#006B3F] text-white text-sm font-semibold px-4 py-3 rounded-lg mt-3">Apply Now</Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Banner */}
      <section className="pt-28 pb-8 bg-gradient-to-b from-[#C8962E]/5 to-white">
        <div className="max-w-3xl mx-auto px-5 text-center">
          <div className="inline-flex items-center gap-2 bg-[#C8962E]/8 border border-[#C8962E]/15 rounded-full px-4 py-1.5 mb-5">
            <FileText size={14} className="text-[#C8962E]" />
            <span className="text-[#C8962E] text-xs font-semibold uppercase tracking-wider">Visa Requirements</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3">
            Visa <span className="text-[#006B3F]">Requirements</span>
          </h1>
          <p className="text-gray-500 leading-relaxed max-w-lg mx-auto">
            Ensure you have all the necessary documents before starting your Ghana e-Visa application. Requirements vary by visa type.
          </p>
        </div>
      </section>

      {/* Section Tabs */}
      <section className="py-8">
        <div className="max-w-5xl mx-auto px-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
            {Object.entries(sections).map(([key, sec]) => (
              <button
                key={key}
                onClick={() => setOpenSection(key)}
                className={`rounded-xl p-4 text-left transition-all cursor-pointer border ${
                  openSection === key
                    ? "bg-white shadow-lg outline outline-2"
                    : "bg-white border-gray-100 hover:border-gray-200 hover:shadow-md"
                }`}
                style={openSection === key ? { outlineColor: sec.color, borderColor: sec.color + "40" } : {}}
              >
                <div className="flex items-center gap-2.5 mb-2">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${sec.color}10`, color: sec.color }}
                  >
                    {sec.icon}
                  </div>
                  <ChevronDown
                    size={16}
                    className={`ml-auto transition-transform duration-200 ${openSection === key ? "rotate-180" : ""}`}
                    style={{ color: openSection === key ? sec.color : "#9CA3AF" }}
                  />
                </div>
                <h3 className={`text-sm font-bold ${openSection === key ? "text-gray-900" : "text-gray-700"}`}>{sec.label}</h3>
                <p className="text-[11px] text-gray-400">{sec.subtitle}</p>
              </button>
            ))}
          </div>

          {/* Requirements Grid */}
          {current && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${current.color}10`, color: current.color }}
                >
                  {current.icon}
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900">{current.label} Requirements</h2>
                  <p className="text-xs text-gray-400">{current.subtitle}</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-0">
                {current.items.map((req, i) => (
                  <div key={i} className="p-6 border-b border-r border-gray-50 hover:bg-gray-50/50 transition-colors group">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform"
                      style={{ backgroundColor: `${current.color}08`, color: current.color }}
                    >
                      {req.icon}
                    </div>
                    <h3 className="font-bold text-gray-900 text-sm mb-1">{req.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{req.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="max-w-2xl mx-auto px-5 text-center">
          <div className="bg-gradient-to-br from-[#006B3F] to-[#005A34] rounded-2xl p-10 shadow-xl">
            <h3 className="text-2xl font-extrabold text-white mb-3">Ready to Apply?</h3>
            <p className="text-white/70 mb-8 max-w-md mx-auto">
              Once you have all required documents, start your Ghana e-Visa application online.
            </p>
            <Link
              href="/register"
              className="group inline-flex items-center gap-2.5 bg-white hover:bg-white/90 text-[#006B3F] font-bold px-8 py-4 rounded-xl transition-all shadow-lg text-sm sm:text-base"
            >
              Begin Application
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-12 mt-8">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <img src="/gis-logo.png" alt="Republic of Ghana" width={36} height={36} className="opacity-80" />
                <div>
                  <p className="font-bold text-white text-sm">Republic of Ghana</p>
                  <p className="text-gray-500 text-[10px] uppercase tracking-wider">e-Visa Portal</p>
                </div>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                The official electronic visa application portal of the Ghana Immigration Service.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-sm mb-4 text-gray-300 uppercase tracking-wider">Quick Links</h4>
              <ul className="space-y-2.5">
                {["Apply for Visa|/register", "Visa Requirements|/visa-requirements", "Track Application|/track", "Help|/help"].map((item, index) => {
                  const [label, href] = item.split("|");
                  return (
                    <li key={`quick-${index}`}>
                      <Link href={href} className="text-gray-400 hover:text-white text-sm transition-colors">{label}</Link>
                    </li>
                  );
                })}
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-sm mb-4 text-gray-300 uppercase tracking-wider">Legal</h4>
              <ul className="space-y-2.5">
                {["Privacy Policy|/privacy-policy", "Terms of Service|/terms", "Cookie Policy|/cookies", "Accessibility|/accessibility"].map((item, index) => {
                  const [label, href] = item.split("|");
                  return (
                    <li key={`legal-${index}`}>
                      <Link href={href} className="text-gray-400 hover:text-white text-sm transition-colors">{label}</Link>
                    </li>
                  );
                })}
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-sm mb-4 text-gray-300 uppercase tracking-wider">Contact</h4>
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <span className="text-gray-400 text-sm">+233 (0) 302 258 250</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-gray-400 text-sm">evisa@gis.gov.gh</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-gray-400 text-sm">Ghana Immigration Service<br />Independence Ave, Accra</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-xs">© {new Date().getFullYear()} Ghana Immigration Service. All rights reserved.</p>
            <p className="text-gray-600 text-xs">Powered by the Ministry of the Interior, Republic of Ghana</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
