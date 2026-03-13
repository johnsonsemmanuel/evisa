"use client";

import React, { useState, useEffect } from "react";
import { X, CreditCard, Smartphone, Shield, AlertCircle, CheckCircle, Loader2, Globe, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";

interface PaymentMethod {
  id: string;
  provider: string;
  name: string;
  description: string;
  icon: string;
  currencies: string[];
  countries: string[];
  badge?: string | null;
}

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  onPay: (method: string) => Promise<void>;
  onPayLater?: () => Promise<void>;
  totalFee: number;
  currency?: string;
  breakdown: { label: string; amount: number }[];
  visaTypeName: string;
  applicantName: string;
  referenceNumber?: string;
}

const getIconComponent = (iconName: string) => {
  switch (iconName) {
    case 'credit-card':
      return <CreditCard size={22} className="text-info" />;
    case 'smartphone':
      return <Smartphone size={22} className="text-accent" />;
    case 'globe':
      return <Globe size={22} className="text-success" />;
    case 'building':
      return <Building size={22} className="text-warning" />;
    default:
      return <CreditCard size={22} className="text-info" />;
  }
};

const getBadgeColor = (badge: string | null) => {
  switch (badge) {
    case 'Popular':
      return 'bg-accent/10 text-accent';
    case 'Local':
      return 'bg-info/10 text-info';
    default:
      return '';
  }
};

export function PaymentModal({
  open,
  onClose,
  onPay,
  onPayLater,
  totalFee,
  currency = "USD",
  breakdown,
  visaTypeName,
  applicantName,
  referenceNumber,
}: PaymentModalProps) {
  const [selectedMethod, setSelectedMethod] = useState("");
  const [processing, setProcessing] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loadingMethods, setLoadingMethods] = useState(true);

  // Fetch payment methods when modal opens
  useEffect(() => {
    if (open) {
      fetchPaymentMethods();
    }
  }, [open]);

  const fetchPaymentMethods = async () => {
    try {
      setLoadingMethods(true);
      const response = await api.get('/applicant/payment-methods?country=GH');
      const methods = response.data.methods || [];
      setPaymentMethods(methods);
      
      // Auto-select first method if available
      if (methods.length > 0 && !selectedMethod) {
        setSelectedMethod(methods[0].id);
      }
    } catch (error) {
      console.error('Failed to fetch payment methods:', error);
      // Fallback to basic methods if API fails
      setPaymentMethods([
        {
          id: 'paystack',
          provider: 'paystack',
          name: 'Paystack',
          description: 'Pay with cards, mobile money, or bank transfer',
          icon: 'credit-card',
          currencies: ['GHS', 'USD'],
          countries: ['GH'],
          badge: 'Popular',
        },
        {
          id: 'gcb',
          provider: 'gcb',
          name: 'GCB Payment Gateway',
          description: 'Pay with cards, mobile money, or bank account via GCB',
          icon: 'building',
          currencies: ['GHS'],
          countries: ['GH'],
          badge: 'Local',
        },
      ]);
      if (!selectedMethod) {
        setSelectedMethod('paystack');
      }
    } finally {
      setLoadingMethods(false);
    }
  };

  if (!open) return null;

  const handlePay = async () => {
    if (!agreed || !selectedMethod) return;
    setProcessing(true);
    try {
      await onPay(selectedMethod);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={!processing ? onClose : undefined} />
      <div className="relative bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-scale-in">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-border rounded-t-2xl px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-lg font-bold text-text-primary">Complete Payment</h2>
            <p className="text-sm text-text-secondary mt-0.5">Secure payment for your visa application</p>
          </div>
          {!processing && (
            <button onClick={onClose} className="p-2 hover:bg-surface rounded-lg transition-colors duration-150 ease-out">
              <X size={20} className="text-text-muted" />
            </button>
          )}
        </div>

        <div className="p-6 space-y-6">
          {/* Application Summary */}
          <div className="bg-surface rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">Application</span>
              <span className="text-sm font-medium text-text-primary">{referenceNumber || "Draft"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">Visa Type</span>
              <span className="text-sm font-medium text-text-primary">{visaTypeName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">Applicant</span>
              <span className="text-sm font-medium text-text-primary">{applicantName}</span>
            </div>
          </div>

          {/* Fee Breakdown */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-text-primary">Fee Breakdown</h3>
            {breakdown.map((item, i) => (
              <div key={i} className="flex items-center justify-between py-1">
                <span className="text-sm text-text-secondary">{item.label}</span>
                <span className="text-sm text-text-primary">${item.amount.toFixed(2)}</span>
              </div>
            ))}
            <div className="border-t border-border pt-2 mt-2 flex items-center justify-between">
              <span className="font-semibold text-text-primary">Total</span>
              <span className="text-xl font-bold text-accent">
                {currency === "USD" ? "$" : currency}{totalFee.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-text-primary">Payment Method</h3>
            
            {loadingMethods ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 size={24} className="animate-spin text-accent" />
                <span className="ml-2 text-text-secondary">Loading payment methods...</span>
              </div>
            ) : (
              paymentMethods.map((method) => (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => setSelectedMethod(method.id)}
                  disabled={processing}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-150 ease-out cursor-pointer flex items-center gap-4
                    ${selectedMethod === method.id
                      ? "border-accent bg-accent/5"
                      : "border-border hover:border-accent/30"
                    } ${processing ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <div className="shrink-0">{getIconComponent(method.icon)}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-text-primary">{method.name}</span>
                      {method.badge && (
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getBadgeColor(method.badge)}`}>
                          {method.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-text-muted mt-0.5">{method.description}</p>
                  </div>
                  {selectedMethod === method.id && (
                    <CheckCircle size={20} className="text-accent shrink-0" />
                  )}
                </button>
              ))
            )}
          </div>

          {/* Payment Security Notice */}
          <div className="flex items-start gap-3 p-4 rounded-xl bg-success/5 border border-success/20">
            <Shield size={18} className="text-success shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-text-primary">Secure Payment</p>
              <p className="text-xs text-text-secondary mt-1">
                Your payment is processed securely through our certified payment partners. 
                All transactions are encrypted and PCI DSS compliant.
              </p>
            </div>
          </div>

          {/* Warning */}
          <div className="flex items-start gap-3 p-4 rounded-xl bg-warning/5 border border-warning/20">
            <AlertCircle size={18} className="text-warning shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-text-primary">Payment Required</p>
              <p className="text-xs text-text-secondary mt-1">
                Your application will not be processed until payment is confirmed.
                Unpaid applications are automatically cancelled after 48 hours.
              </p>
            </div>
          </div>

          {/* Terms Agreement */}
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              disabled={processing}
              className="mt-1 w-4 h-4 rounded border-border text-accent focus:ring-accent/20 cursor-pointer"
            />
            <span className="text-xs text-text-secondary leading-relaxed">
              I confirm that all information provided is accurate. I understand that the visa fee is
              non-refundable once processing begins, and that providing false information may result
              in application denial and possible legal action.
            </span>
          </label>

          {/* Security Badge */}
          <div className="flex items-center justify-center gap-2 text-xs text-text-muted">
            <Shield size={14} />
            <span>Secured by 256-bit SSL encryption</span>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-border rounded-b-2xl px-6 py-4 flex items-center justify-between">
          {!processing ? (
            <button
              onClick={async () => {
                if (onPayLater) {
                  setProcessing(true);
                  try {
                    await onPayLater();
                  } finally {
                    setProcessing(false);
                  }
                } else {
                  onClose();
                }
              }}
              className="text-sm text-text-secondary hover:text-text-primary transition-colors duration-150 ease-out"
            >
              Pay Later
            </button>
          ) : (
            <span className="text-sm text-text-muted">Processing...</span>
          )}
          <Button
            onClick={handlePay}
            disabled={!agreed || processing || !selectedMethod || loadingMethods}
            className="!bg-accent hover:!bg-accent-dark min-w-[180px]"
          >
            {processing ? (
              <span className="flex items-center gap-2">
                <Loader2 size={16} className="animate-spin" /> Processing...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <CreditCard size={16} /> Pay ${totalFee.toFixed(2)}
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
