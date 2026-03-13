"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CreditCard, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PaymentModal } from "@/components/ui/payment-modal";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import toast from "react-hot-toast";
import type { Application } from "@/lib/types";

export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const { data: appData, isLoading } = useQuery({
    queryKey: ["application", id],
    queryFn: () =>
      api.get<{ application: Application }>(`/applicant/applications/${id}`).then((r) => r.data),
  });

  const application = appData?.application;

  // Auto-open payment modal when page loads
  useEffect(() => {
    if (application && !isLoading) {
      setShowPaymentModal(true);
    }
  }, [application, isLoading]);

  const handlePay = async (method: string) => {
    if (!application) return;
    try {
      // Initialize real payment with selected method
      // Use GHS for local payment methods, USD for international
      const currency = method === 'gcb' || method === 'paystack' ? 'GHS' : 'USD';
      
      const res = await api.post(`/applicant/applications/${application.id}/payment/initialize`, {
        payment_method: method,
        currency: currency,
        callback_url: `${window.location.origin}/dashboard/applicant/applications/${application.id}/payment-callback`
      });

      if (res.data.success) {
        const { checkout_url, authorization_url, reference } = res.data;
        
        const redirectUrl = checkout_url || authorization_url;
        if (redirectUrl) {
          // Redirect to payment gateway
          window.location.href = redirectUrl;
        } else {
          // Handle bank transfer or other manual methods
          toast.success(res.data.message || "Payment initialized successfully");
          setShowPaymentModal(false);
          
          // Show instructions for manual payment methods
          if (method === 'bank_transfer') {
            toast.success(
              "Bank transfer details have been sent to your email. Please complete the transfer and upload proof of payment.",
              { duration: 8000, icon: "🏦" }
            );
          }
          
          // Redirect back to application
          router.push(`/dashboard/applicant/applications/${id}`);
        }
      } else {
        toast.error(res.data.message || "Payment initialization failed");
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || "Payment failed");
    }
  };

  const handleClose = () => {
    setShowPaymentModal(false);
    router.push(`/dashboard/applicant/applications/${id}`);
  };

  if (isLoading) {
    return (
      <DashboardShell title="Payment">
        <div className="flex items-center justify-center py-16">
          <Loader2 size={32} className="animate-spin text-accent" />
        </div>
      </DashboardShell>
    );
  }

  if (!application) {
    return (
      <DashboardShell title="Application Not Found">
        <div className="text-center py-16">
          <p className="text-text-primary font-semibold mb-4">Application not found</p>
          <Button variant="secondary" onClick={() => router.push("/dashboard/applicant")}>
            Back to Dashboard
          </Button>
        </div>
      </DashboardShell>
    );
  }

  // Calculate fees (simplified for now)
  const fees = {
    base: 260.00,
    processing: application.processing_tier === "express" ? 130.00 : application.processing_tier === "fast_track" ? 78.00 : 0,
    entry: application.visa_type?.entry_type === "multiple" ? 208.00 : 0,
    total: 260.00 + (application.processing_tier === "express" ? 130.00 : application.processing_tier === "fast_track" ? 78.00 : 0) + (application.visa_type?.entry_type === "multiple" ? 208.00 : 0)
  };

  return (
    <DashboardShell 
      title="Payment Required"
      description={`Complete payment for application ${application.reference_number}`}
      actions={
        <Button 
          variant="secondary" 
          size="sm" 
          leftIcon={<ArrowLeft size={14} />} 
          onClick={() => router.push(`/dashboard/applicant/applications/${id}`)}
        >
          Back to Application
        </Button>
      }
    >
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-border p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center rounded-full bg-accent/10">
            <CreditCard size={32} className="text-accent" />
          </div>
          
          <h1 className="text-2xl font-bold text-text-primary mb-2">
            {application.payment?.status === "failed" ? "Payment Failed" : "Payment Required"}
          </h1>
          
          <p className="text-text-secondary mb-8">
            {application.payment?.status === "failed" 
              ? "Your previous payment could not be processed. Please try again with a different payment method."
              : "Complete your payment to submit your application for processing."
            }
          </p>

          <div className="bg-surface rounded-xl p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <span className="text-text-secondary">Application</span>
              <span className="font-medium text-text-primary">{application.reference_number}</span>
            </div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-text-secondary">Visa Type</span>
              <span className="font-medium text-text-primary">{application.visa_type?.name}</span>
            </div>
            <div className="border-t border-border pt-4 flex items-center justify-between">
              <span className="font-semibold text-text-primary">Total Amount</span>
              <span className="text-2xl font-bold text-accent">${fees.total.toFixed(2)}</span>
            </div>
          </div>

          <Button 
            onClick={() => setShowPaymentModal(true)}
            className="w-full"
            leftIcon={<CreditCard size={16} />}
          >
            {application.payment?.status === "failed" ? "Retry Payment" : "Make Payment"}
          </Button>
        </div>
      </div>

      <PaymentModal
        open={showPaymentModal}
        onClose={handleClose}
        onPay={handlePay}
        totalFee={fees.total}
        breakdown={[
          { label: "Base Fee", amount: fees.base },
          ...(fees.processing > 0 ? [{ label: "Processing Fee", amount: fees.processing }] : []),
          ...(fees.entry > 0 ? [{ label: "Multiple Entry Fee", amount: fees.entry }] : []),
        ]}
        visaTypeName={application.visa_type?.name || "Visa"}
        applicantName={`${application.first_name} ${application.last_name}`}
        referenceNumber={application.reference_number}
      />
    </DashboardShell>
  );
}