"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, Download, Mail, Home, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";

function EtaSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const referenceNumber = searchParams.get('ref');

  return (
    <div className="min-h-screen bg-gradient-to-br from-success/5 via-white to-primary/5">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Success Card */}
          <div className="bg-white rounded-2xl border border-border shadow-lg p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={40} className="text-success" />
            </div>
            
            <h1 className="text-3xl font-bold text-text-primary mb-4">
              ETA Application Submitted Successfully!
            </h1>
            
            <p className="text-text-secondary mb-6">
              Your Electronic Travel Authorization application has been submitted and is being processed.
            </p>

            {referenceNumber && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-sm font-semibold text-text-primary mb-2">Application Reference Number</p>
                <p className="text-lg font-mono text-primary">{referenceNumber}</p>
                <p className="text-xs text-text-muted mt-2">
                  Please save this reference number for tracking your application
                </p>
              </div>
            )}

            {/* What Happens Next */}
            <div className="bg-info/5 border border-info/20 rounded-lg p-6 mb-6 text-left">
              <h3 className="text-lg font-bold text-info mb-4">What Happens Next?</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-info/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-info">1</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text-primary">Automatic Processing</p>
                    <p className="text-xs text-text-secondary">Your application will be automatically processed within minutes</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-info/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-info">2</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text-primary">Email Confirmation</p>
                    <p className="text-xs text-text-secondary">You'll receive your ETA via email if approved</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-info/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-info">3</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text-primary">Print & Travel</p>
                    <p className="text-xs text-text-secondary">Print your ETA and present it at the airport</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Important Information */}
            <div className="bg-warning/5 border border-warning/20 rounded-lg p-6 mb-6 text-left">
              <h3 className="text-lg font-bold text-warning mb-4">Important Information</h3>
              <ul className="text-sm text-text-secondary space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-warning mt-1">•</span>
                  <span>ETA is FREE - no payment required</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-warning mt-1">•</span>
                  <span>Valid for 90 days from issue date</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-warning mt-1">•</span>
                  <span>Single entry only</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-warning mt-1">•</span>
                  <span>Must be presented at port of entry</span>
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href={`/track${referenceNumber ? `?ref=${referenceNumber}` : ''}`}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
              >
                <Mail size={18} />
                Track Application
              </Link>
              <Button
                variant="secondary"
                onClick={() => router.push('/')}
                className="flex-1"
                leftIcon={<Home size={18} />}
              >
                Back to Home
              </Button>
            </div>
          </div>

          {/* Additional Help */}
          <div className="mt-8 text-center">
            <p className="text-sm text-text-muted mb-4">
              Need help or have questions about your application?
            </p>
            <Link
              href="/help"
              className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-semibold text-sm"
            >
              Contact Support <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EtaSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-success/5 via-white to-primary/5 flex items-center justify-center"><Loader2 className="animate-spin" /></div>}>
      <EtaSuccessContent />
    </Suspense>
  );
}