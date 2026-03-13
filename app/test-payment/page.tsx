"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle, CreditCard, Loader2 } from "lucide-react";

function TestPaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [processing, setProcessing] = useState(false);
  const [completed, setCompleted] = useState(false);

  const reference = searchParams.get('reference');
  const amount = searchParams.get('amount');
  const currency = searchParams.get('currency');
  const method = searchParams.get('method');
  const callback = searchParams.get('callback');

  const handlePayment = async (success: boolean) => {
    setProcessing(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setProcessing(false);
    setCompleted(true);

    // Send callback to backend
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/applicant/payment/test-callback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          reference: reference,
          status: success ? 'success' : 'failed',
        }),
      });

      if (!response.ok) {
        console.error('Test payment callback failed:', response.status, response.statusText);
      } else {
        const result = await response.json();
        console.log('Test payment callback result:', result);
      }
    } catch (error) {
      console.error('Failed to send test payment callback:', error);
    }

    // Redirect to callback URL after a short delay
    setTimeout(() => {
      if (callback) {
        const callbackUrl = new URL(callback);
        callbackUrl.searchParams.set('reference', reference || '');
        callbackUrl.searchParams.set('status', success ? 'success' : 'failed');
        window.location.href = callbackUrl.toString();
      } else {
        router.push('/dashboard/applicant');
      }
    }, 1500);
  };

  if (completed) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-success" />
          </div>
          <h1 className="text-xl font-bold text-text-primary mb-2">Payment Successful!</h1>
          <p className="text-text-secondary mb-4">Redirecting you back...</p>
          <div className="flex justify-center">
            <Loader2 size={20} className="animate-spin text-accent" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <CreditCard size={32} className="text-accent" />
          </div>
          <h1 className="text-xl font-bold text-text-primary mb-2">Test Payment Gateway</h1>
          <p className="text-text-secondary text-sm">This is a simulated payment for development purposes</p>
        </div>

          <div className="bg-surface rounded-xl p-4 mb-6 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Amount:</span>
              <span className="font-medium">{currency} {amount}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Provider:</span>
              <span className="font-medium capitalize">
                {method === 'gcb' ? 'GCB Payment Gateway' : 
                 method === 'paystack' ? 'Paystack' : 
                 method?.replace('_', ' ')}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Reference:</span>
              <span className="font-mono text-xs">{reference}</span>
            </div>
          </div>

        <div className="space-y-3">
          <Button
            onClick={() => handlePayment(true)}
            loading={processing}
            className="w-full"
            size="lg"
          >
            {processing ? 'Processing...' : 'Simulate Successful Payment'}
          </Button>
          
          <Button
            onClick={() => handlePayment(false)}
            variant="secondary"
            disabled={processing}
            className="w-full"
            size="lg"
          >
            Simulate Failed Payment
          </Button>
        </div>

        <p className="text-xs text-text-muted text-center mt-4">
          In production, this would redirect to the actual payment gateway
        </p>
      </div>
    </div>
  );
}

export default function TestPaymentPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-surface flex items-center justify-center"><Loader2 className="animate-spin" /></div>}>
      <TestPaymentContent />
    </Suspense>
  );
}