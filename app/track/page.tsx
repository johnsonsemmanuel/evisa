"use client";

import { useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { ArrowRight, Search, FileText, Clock, CheckCircle, Shield, Globe, HelpCircle, Mail, Menu, X } from "lucide-react";

export default function TrackPage() {
  const [referenceNumber, setReferenceNumber] = useState("");
  const [passportNumber, setPassportNumber] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<any>(null);
  const [errors, setErrors] = useState<{ reference?: string; passport?: string; general?: string }>({});
  const [touched, setTouched] = useState<{ reference?: boolean; passport?: boolean }>({});
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const validateField = (field: "reference" | "passport", value: string) => {
    if (field === "reference" && value.trim().length < 5) return "Invalid application reference number";
    if (field === "passport" && value.trim().length < 5) return "Passport number must be at least 5 characters";
    return undefined;
  };

  const handleBlur = (field: "reference" | "passport") => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const value = field === "reference" ? referenceNumber : passportNumber;
    setErrors(prev => ({ ...prev, [field]: validateField(field, value) }));
  };

  const handleSearch = async () => {
    const refError = validateField("reference", referenceNumber);
    const passError = validateField("passport", passportNumber);
    if (refError || passError) {
      setErrors({ reference: refError, passport: passError });
      setTouched({ reference: true, passport: true });
      return;
    }
    setIsSearching(true);
    setErrors({});
    setSearchResult(null);
    try {
      const response = await api.post("/track", {
        reference_number: referenceNumber.trim(),
        identifier: passportNumber.trim(),
      });
      setSearchResult(response.data);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setErrors({ general: "No application found. Please check your reference number and passport number." });
      } else {
        setErrors({ general: "An error occurred. Please try again later." });
      }
    } finally {
      setIsSearching(false);
    }
  };

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
                <img src="/gis-logo-new.png" alt="Ghana Immigration Service" width={56} height={56} className="drop-shadow-md" />
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
                { label: "Visa Requirements", href: "/visa-requirements" },
                { label: "Track Application", href: "/track", active: true },
                { label: "Help", href: "/help" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-sm font-medium px-3.5 py-2 rounded-lg transition-colors ${item.active ? "text-[#006B3F] bg-[#006B3F]/5" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
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
      <section className="pt-28 pb-8 bg-gradient-to-b from-[#006B3F]/5 to-white">
        <div className="max-w-2xl mx-auto px-5 text-center">
          <div className="inline-flex items-center gap-2 bg-[#006B3F]/5 border border-[#006B3F]/10 rounded-full px-4 py-1.5 mb-5">
            <Search size={14} className="text-[#006B3F]" />
            <span className="text-[#006B3F] text-xs font-semibold uppercase tracking-wider">Application Tracking</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3">Track Application</h1>
          <p className="text-gray-500 leading-relaxed">
            Enter the application reference number and passport number to check the status of a Ghana e-Visa application.
          </p>
        </div>
      </section>

      {/* Search Form */}
      <section className="py-8">
        <div className="max-w-xl mx-auto px-5">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xl p-6 sm:p-8">
            <div className="mb-5">
              <label className="block text-gray-700 text-sm font-semibold mb-2">Application Reference Number</label>
              <input
                type="text"
                value={referenceNumber}
                onChange={(e) => { setReferenceNumber(e.target.value.toUpperCase()); if (touched.reference) setErrors(prev => ({ ...prev, reference: validateField("reference", e.target.value) })); }}
                onBlur={() => handleBlur("reference")}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="e.g. GH-2026-00123"
                className={`w-full px-4 py-3.5 bg-gray-50 rounded-xl text-gray-900 placeholder:text-gray-400 border focus:outline-none focus:ring-2 transition-all text-sm ${touched.reference && errors.reference ? "border-red-300 focus:ring-red-200" : "border-gray-200 focus:ring-[#006B3F]/20 focus:border-[#006B3F]"
                  }`}
              />
              {touched.reference && errors.reference && <p className="text-red-500 text-xs mt-1.5">{errors.reference}</p>}
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-semibold mb-2">Passport Number</label>
              <input
                type="text"
                value={passportNumber}
                onChange={(e) => { setPassportNumber(e.target.value.toUpperCase()); if (touched.passport) setErrors(prev => ({ ...prev, passport: validateField("passport", e.target.value) })); }}
                onBlur={() => handleBlur("passport")}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Enter passport number"
                className={`w-full px-4 py-3.5 bg-gray-50 rounded-xl text-gray-900 placeholder:text-gray-400 border focus:outline-none focus:ring-2 transition-all text-sm ${touched.passport && errors.passport ? "border-red-300 focus:ring-red-200" : "border-gray-200 focus:ring-[#006B3F]/20 focus:border-[#006B3F]"
                  }`}
              />
              {touched.passport && errors.passport && <p className="text-red-500 text-xs mt-1.5">{errors.passport}</p>}
            </div>

            <button
              onClick={handleSearch}
              disabled={isSearching}
              className="w-full inline-flex items-center justify-center gap-2 bg-[#006B3F] hover:bg-[#005A34] text-white font-bold px-8 py-4 rounded-xl transition-colors disabled:opacity-50 cursor-pointer shadow-lg shadow-[#006B3F]/20"
            >
              {isSearching ? (
                <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Searching&hellip;</>
              ) : (
                <><Search size={18} /> Track Application</>
              )}
            </button>

            {errors.general && (
              <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-xl">
                <p className="text-red-600 text-sm">{errors.general}</p>
              </div>
            )}

            <div className="flex items-center justify-center gap-2 mt-5 text-gray-400 text-xs">
              <HelpCircle size={13} />
              <span>The reference number was emailed after submission.</span>
            </div>
          </div>
        </div>
      </section>

      {/* Results Section */}
      {searchResult && (
        <section className="py-8">
          <div className="max-w-4xl mx-auto px-5">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
              <div className="grid lg:grid-cols-3">
                <div className="lg:col-span-2 p-6 sm:p-8">
                  <h2 className="text-lg font-bold text-gray-900 mb-6">Application Details</h2>
                  <div className="space-y-0 divide-y divide-gray-100">
                    {[
                      ["Reference Number", searchResult.reference_number],
                      ["Visa Type", searchResult.visa_type || "—"],
                      ["Current Status", searchResult.status?.replace(/_/g, " ")],
                      ...(searchResult.submitted_at ? [["Submitted", new Date(searchResult.submitted_at).toLocaleDateString()]] : []),
                      ...(searchResult.decided_at ? [["Decision Date", new Date(searchResult.decided_at).toLocaleDateString()]] : []),
                    ].map(([label, value], idx) => (
                      <div key={idx} className="flex justify-between py-3.5">
                        <span className="text-gray-500 text-sm">{label}</span>
                        <span className={`font-semibold text-sm ${label === "Current Status" ? "text-[#006B3F] capitalize" : "text-gray-900"}`}>{value}</span>
                      </div>
                    ))}
                  </div>

                  {searchResult.timeline && searchResult.timeline.length > 0 && (
                    <div className="mt-8">
                      <h3 className="text-base font-bold text-gray-900 mb-4">Timeline</h3>
                      <div className="space-y-3">
                        {searchResult.timeline.map((item: any, index: number) => (
                          <div key={index} className="flex gap-3 items-center">
                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${item.status === "approved" ? "bg-green-50" : item.status === "denied" ? "bg-red-50" : "bg-amber-50"
                              }`}>
                              {item.status === "approved" ? <CheckCircle size={16} className="text-green-600" /> : item.status === "denied" ? <FileText size={16} className="text-red-600" /> : <Clock size={16} className="text-amber-600" />}
                            </div>
                            <div className="flex-1">
                              <span className="font-medium text-gray-900 text-sm capitalize">{item.status?.replace(/_/g, " ")}</span>
                              <span className="text-xs text-gray-400 ml-2">{new Date(item.changed_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-gray-50 p-6 sm:p-8 border-l border-gray-100">
                  <div className={`rounded-xl p-5 mb-4 ${searchResult.status === "approved" ? "bg-green-50 border border-green-100" : searchResult.status === "denied" ? "bg-red-50 border border-red-100" : "bg-amber-50 border border-amber-100"
                    }`}>
                    <div className="flex items-center gap-2 mb-1">
                      {searchResult.status === "approved" ? <CheckCircle size={16} className="text-green-600" /> : searchResult.status === "denied" ? <FileText size={16} className="text-red-600" /> : <Clock size={16} className="text-amber-600" />}
                      <span className={`text-sm font-bold capitalize ${searchResult.status === "approved" ? "text-green-700" : searchResult.status === "denied" ? "text-red-700" : "text-amber-700"}`}>
                        {searchResult.status?.replace(/_/g, " ")}
                      </span>
                    </div>
                    {searchResult.status === "approved" && <p className="text-xs text-green-600/80">The eVisa is ready for download.</p>}
                    {searchResult.status === "under_review" && <p className="text-xs text-amber-600/80">Being reviewed by an officer.</p>}
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 border border-gray-100">
                      <Shield size={16} className="text-[#006B3F]" />
                      <div>
                        <p className="text-xs font-semibold text-gray-900">Secure Portal</p>
                        <p className="text-xs text-gray-400">256-bit encryption</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 border border-gray-100">
                      <Globe size={16} className="text-[#C8962E]" />
                      <div>
                        <p className="text-xs font-semibold text-gray-900">Track Anywhere</p>
                        <p className="text-xs text-gray-400">24/7 online access</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 py-12 mt-12">
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
