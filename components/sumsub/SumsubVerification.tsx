"use client";

import { useEffect, useRef, useState } from "react";
import api from "@/lib/api";

// Import Sumsub WebSDK
import snsWebSdk from '@sumsub/websdk';

interface SumsubVerificationProps {
  applicationId?: number;
  etaApplicationId?: number;
  applicationType: 'visa' | 'eta';
  levelName?: string;
  onComplete?: (result: any) => void;
  onError?: (error: any) => void;
}

export default function SumsubVerification({
  applicationId,
  etaApplicationId,
  applicationType,
  levelName,
  onComplete,
  onError
}: SumsubVerificationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'completed' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [sdkInstance, setSdkInstance] = useState<any>(null);

  useEffect(() => {
    if (!applicationId && !etaApplicationId) {
      setError('Application ID is required');
      setStatus('error');
      return;
    }

    initializeSumsub();
  }, [applicationId, etaApplicationId, applicationType]);

  const initializeSumsub = async () => {
    setStatus('loading');
    setError(null);

    try {
      // Generate access token
      const tokenResponse = await api.post('/api/sumsub/generate-token', {
        application_id: applicationId,
        eta_application_id: etaApplicationId,
        application_type: applicationType,
        level_name: levelName,
      });

      if (!tokenResponse.data.success) {
        throw new Error(tokenResponse.data.error?.message || 'Failed to generate token');
      }

      const { token, external_user_id } = tokenResponse.data;

      // Initialize Sumsub SDK
      const sdk = snsWebSdk.init(token, async () => {
        // Token refresh callback - return new token
        const refreshResponse = await api.post('/api/sumsub/generate-token', {
          application_id: applicationId,
          eta_application_id: etaApplicationId,
          application_type: applicationType,
          level_name: levelName,
        });
        return refreshResponse.data.token;
      })
      .withConf({
        lang: 'en',
      })
      .on('idCheck.onError', (error: any) => {
        console.error('Sumsub SDK error:', error);
        setError(error.message || 'Verification failed');
        setStatus('error');
        onError?.(error);
      })
      .onMessage((type: string, payload: any) => {
        console.log('Sumsub message:', type, payload);
        
        switch (type) {
          case 'idCheck.onApplicantLoaded':
            // Update applicant ID in our system
            if (payload.applicantId) {
              api.post('/api/sumsub/update-applicant-id', {
                external_user_id,
                applicant_id: payload.applicantId,
              });
            }
            break;
            
          case 'idCheck.onApplicantSubmitted':
            setStatus('completed');
            onComplete?.(payload);
            break;
            
          case 'idCheck.onApplicantActionSubmitted':
            // Additional documents submitted
            break;
        }
      })
      .build();

      setSdkInstance(sdk);
      
      // Launch SDK in container
      if (containerRef.current) {
        sdk.launch(containerRef.current);
        setStatus('ready');
      }

    } catch (err: any) {
      console.error('Sumsub initialization failed:', err);
      setError(err.response?.data?.error?.message || err.message || 'Failed to initialize verification');
      setStatus('error');
      onError?.(err);
    }
  };

  const handleRetry = () => {
    initializeSumsub();
  };

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing verification...</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center mb-4">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Verification Error</h3>
          </div>
        </div>
        <div className="text-sm text-red-700 mb-4">
          {error}
        </div>
        <button
          onClick={handleRetry}
          className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (status === 'completed') {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-green-800">Verification Completed</h3>
            <p className="text-sm text-green-700 mt-1">
              Your documents have been submitted for review. You will be notified of the result.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-lg">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Identity Verification</h3>
        <p className="text-sm text-gray-600 mt-1">
          Please complete the identity verification process to continue with your application.
        </p>
      </div>
      
      {/* Sumsub SDK Container */}
      <div 
        ref={containerRef}
        className="min-h-[400px] p-4"
        id="sumsub-websdk-container"
      >
        {/* SDK will be loaded here */}
      </div>
    </div>
  );
}