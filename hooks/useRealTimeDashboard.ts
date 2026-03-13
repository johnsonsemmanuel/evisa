"use client";

import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/lib/auth';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

// Declare global Pusher for Laravel Echo
declare global {
  interface Window {
    Pusher: typeof Pusher;
    Echo: Echo;
  }
}

interface DashboardMetrics {
  [key: string]: any;
}

interface ApplicationStatusUpdate {
  application_id: number;
  reference_number: string;
  previous_status: string;
  new_status: string;
  agency: string;
  mission_id?: number;
  tier: string;
  notes?: string;
  timestamp: string;
}

interface PaymentUpdate {
  payment_id: number;
  application_id: number;
  reference_number?: string;
  amount: number;
  currency: string;
  method: string;
  status: string;
  timestamp: string;
}

interface UseRealTimeDashboardOptions {
  agency?: 'gis' | 'mfa' | 'admin';
  missionId?: number;
  onMetricsUpdate?: (metrics: DashboardMetrics) => void;
  onApplicationStatusChange?: (update: ApplicationStatusUpdate) => void;
  onPaymentUpdate?: (update: PaymentUpdate) => void;
}

export function useRealTimeDashboard({
  agency,
  missionId,
  onMetricsUpdate,
  onApplicationStatusChange,
  onPaymentUpdate,
}: UseRealTimeDashboardOptions = {}) {
  const { user, token } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [metrics, setMetrics] = useState<DashboardMetrics>({});
  const echoRef = useRef<Echo | null>(null);

  useEffect(() => {
    if (!user || !token) return;

    // Initialize Laravel Echo with Pusher
    if (!window.Pusher) {
      window.Pusher = Pusher;
    }

    if (!echoRef.current) {
      echoRef.current = new Echo({
        broadcaster: 'pusher',
        key: process.env.NEXT_PUBLIC_PUSHER_APP_KEY,
        cluster: process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER,
        forceTLS: true,
        auth: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      });

      window.Echo = echoRef.current;
    }

    const echo = echoRef.current;

    // Connection status listeners
    echo.connector.pusher.connection.bind('connected', () => {
      console.log('WebSocket connected');
      setIsConnected(true);
    });

    echo.connector.pusher.connection.bind('disconnected', () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
    });

    echo.connector.pusher.connection.bind('error', (error: any) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
    });

    // Subscribe to appropriate channels based on user role and agency
    const channels: string[] = [];

    if (agency) {
      channels.push(`dashboard.${agency}`);
      
      // For MFA with specific mission
      if (agency === 'mfa' && missionId) {
        channels.push(`dashboard.mfa.mission.${missionId}`);
      }
    } else {
      // Auto-detect channels based on user role
      if (user.role === 'admin') {
        channels.push('dashboard.admin', 'payments.admin');
      } else if (user.role?.startsWith('gis_')) {
        channels.push('dashboard.gis');
      } else if (user.role?.startsWith('mfa_')) {
        channels.push('dashboard.mfa');
        if (user.mfa_mission_id) {
          channels.push(`dashboard.mfa.mission.${user.mfa_mission_id}`);
        }
      }
    }

    // Subscribe to user-specific channel for applicants
    if (user.role === 'applicant') {
      channels.push(`user.${user.id}`);
    }

    console.log('Subscribing to channels:', channels);

    const subscriptions = channels.map(channelName => {
      const channel = echo.private(channelName);

      // Listen for metrics updates
      channel.listen('.metrics.updated', (data: { metrics: DashboardMetrics }) => {
        console.log('Metrics updated:', data);
        setMetrics(prev => ({ ...prev, ...data.metrics }));
        onMetricsUpdate?.(data.metrics);
      });

      // Listen for application status changes
      channel.listen('.application.status.changed', (data: ApplicationStatusUpdate) => {
        console.log('Application status changed:', data);
        onApplicationStatusChange?.(data);
      });

      // Listen for payment updates (admin only)
      if (channelName.includes('admin') || channelName.includes('payments')) {
        channel.listen('.payment.completed', (data: PaymentUpdate) => {
          console.log('Payment completed:', data);
          onPaymentUpdate?.(data);
        });
      }

      return channel;
    });

    // Cleanup function
    return () => {
      subscriptions.forEach(channel => {
        channel.stopListening('.metrics.updated');
        channel.stopListening('.application.status.changed');
        channel.stopListening('.payment.completed');
      });
      
      if (echoRef.current) {
        echoRef.current.disconnect();
        echoRef.current = null;
      }
      
      setIsConnected(false);
    };
  }, [user, token, agency, missionId, onMetricsUpdate, onApplicationStatusChange, onPaymentUpdate]);

  return {
    isConnected,
    metrics,
    echo: echoRef.current,
  };
}

export default useRealTimeDashboard;