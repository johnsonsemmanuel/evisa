"use client";

import { useCallback, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useRealTimeDashboard } from "@/hooks/useRealTimeDashboard";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { MetricsSkeleton } from "@/components/ui/skeleton";
import {
  FileText,
  Users,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  ChevronRight,
  BarChart3,
  Shield,
  Settings,
  Wifi,
  WifiOff,
} from "lucide-react";
import type { AdminOverview } from "@/lib/types";

export default function AdminDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const [realtimeMetrics, setRealtimeMetrics] = useState<AdminOverview | null>(null);

  // Real-time dashboard hook
  const { isConnected } = useRealTimeDashboard({
    agency: 'admin',
    onMetricsUpdate: useCallback((newMetrics: any) => {
      setRealtimeMetrics(newMetrics);
    }, []),
    onPaymentUpdate: useCallback((update: any) => {
      console.log('Payment update:', update);
      // Optionally show toast notification for new payments
    }, []),
  });

  const { data, isLoading } = useQuery({
    queryKey: ["admin-overview"],
    queryFn: () =>
      api.get<AdminOverview>("/admin/reports/overview").then((r) => r.data),
    refetchInterval: isConnected ? 300000 : 60000, // Reduce polling when connected to WebSocket
  });

  // Use real-time metrics if available, otherwise fall back to polled data
  const currentData = realtimeMetrics || data;
  const apps = currentData?.applications;
  const payments = currentData?.payments;
  const users_data = currentData?.users;

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <DashboardShell
      title="Admin Overview"
      description="System-wide analytics and management"
      actions={
        <div className="flex items-center gap-3">
          {/* Real-time connection indicator */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
            isConnected 
              ? 'bg-green-100 text-green-700 border border-green-200' 
              : 'bg-gray-100 text-gray-600 border border-gray-200'
          }`}>
            {isConnected ? (
              <>
                <Wifi size={12} />
                Live
              </>
            ) : (
              <>
                <WifiOff size={12} />
                Polling
              </>
            )}
          </div>
          <Button
            variant="secondary"
            leftIcon={<BarChart3 size={16} />}
            onClick={() => router.push("/dashboard/admin/reports")}
          >
            Full Reports
          </Button>
        </div>
      }
    >
      {/* ── Welcome Banner ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-accent via-accent-light to-accent p-6 lg:p-8 mb-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-1/2 w-48 h-48 bg-gold/15 rounded-full translate-y-1/2" />
        <div className="relative z-10">
          <p className="text-white/80 text-sm font-medium mb-1">{greeting()},</p>
          <h2 className="text-white text-2xl font-bold mb-2">
            {user?.first_name || "Admin"} {user?.last_name || ""}
          </h2>
          <p className="text-white/70 text-sm max-w-md">
            Monitor system performance, manage users, and oversee all visa processing operations.
          </p>
          <div className="flex items-center gap-3 mt-5">
            <Button
              onClick={() => router.push("/dashboard/admin/reports")}
              leftIcon={<BarChart3 size={15} />}
              className="!bg-white !text-accent hover:!bg-white/90 !shadow-lg !font-bold"
            >
              View Reports
            </Button>
            <Button
              variant="ghost"
              onClick={() => router.push("/dashboard/admin/users")}
              className="!text-white/90 hover:!text-white hover:!bg-white/15"
            >
              Manage Users <ArrowRight size={14} className="ml-1" />
            </Button>
          </div>
        </div>
      </div>

      {/* ── Application Metric Cards ── */}
      <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3">
        Applications
      </h2>
      {isLoading ? (
        <MetricsSkeleton />
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="card-interactive group" onClick={() => router.push("/dashboard/admin/applications")}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-11 h-11 rounded-xl bg-info/8 flex items-center justify-center group-hover:bg-info/12 transition-colors">
                <FileText size={20} className="text-info" />
              </div>
              <ChevronRight size={16} className="text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-3xl font-bold text-text-primary tracking-tight">{apps?.total ?? 0}</p>
            <p className="text-xs text-text-muted font-medium mt-1">Total Applications</p>
          </div>

          <div className="card-interactive group" onClick={() => router.push("/dashboard/admin/applications")}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-11 h-11 rounded-xl bg-warning/8 flex items-center justify-center group-hover:bg-warning/12 transition-colors">
                <Clock size={20} className="text-warning" />
              </div>
              <ChevronRight size={16} className="text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-3xl font-bold text-text-primary tracking-tight">{apps?.under_review ?? 0}</p>
            <p className="text-xs text-text-muted font-medium mt-1">Under Review</p>
          </div>

          <div className="card-interactive group" onClick={() => router.push("/dashboard/admin/applications")}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-11 h-11 rounded-xl bg-success/8 flex items-center justify-center group-hover:bg-success/12 transition-colors">
                <CheckCircle2 size={20} className="text-success" />
              </div>
              <ChevronRight size={16} className="text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-3xl font-bold text-text-primary tracking-tight">{apps?.approved ?? 0}</p>
            <p className="text-xs text-text-muted font-medium mt-1">Approved</p>
          </div>

          <div className="card-interactive group" onClick={() => router.push("/dashboard/admin/applications")}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-11 h-11 rounded-xl bg-danger/8 flex items-center justify-center group-hover:bg-danger/12 transition-colors">
                <AlertTriangle size={20} className="text-danger" />
              </div>
              <ChevronRight size={16} className="text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-3xl font-bold text-text-primary tracking-tight">{apps?.escalated ?? 0}</p>
            <p className="text-xs text-text-muted font-medium mt-1">Escalated to MFA</p>
          </div>
        </div>
      )}

      {/* ── Payments & Users ── */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Payments Card */}
        <div className="card-accent">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 bg-success/8 rounded-xl flex items-center justify-center">
              <CreditCard size={20} className="text-success" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-text-primary">Payments</h3>
              <p className="text-xs text-text-muted">Revenue overview</p>
            </div>
          </div>
          <p className="text-3xl font-bold text-success mb-4">
            ${payments?.total_collected ?? "0.00"}
          </p>
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
            <div className="text-center">
              <p className="text-2xl font-bold text-text-primary">{payments?.completed ?? 0}</p>
              <p className="text-xs text-text-muted">Completed</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-warning">{payments?.pending ?? 0}</p>
              <p className="text-xs text-text-muted">Pending</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-danger">{payments?.failed ?? 0}</p>
              <p className="text-xs text-text-muted">Failed</p>
            </div>
          </div>
        </div>

        {/* Users Card */}
        <div className="card-accent">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 bg-primary/8 rounded-xl flex items-center justify-center">
              <Users size={20} className="text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-text-primary">Users</h3>
              <p className="text-xs text-text-muted">System users overview</p>
            </div>
          </div>
          <p className="text-3xl font-bold text-text-primary mb-4">
            {(users_data?.total_applicants ?? 0) + (users_data?.total_officers ?? 0)}
          </p>
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
            <div className="text-center">
              <p className="text-2xl font-bold text-text-primary">{users_data?.total_applicants ?? 0}</p>
              <p className="text-xs text-text-muted">Applicants</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-text-primary">{users_data?.total_officers ?? 0}</p>
              <p className="text-xs text-text-muted">Officers</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-success">{users_data?.active_officers ?? 0}</p>
              <p className="text-xs text-text-muted">Active</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Quick Actions ── */}
      <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3">
        Quick Actions
      </h2>
      <div className="grid sm:grid-cols-3 gap-4">
        <button
          onClick={() => router.push("/dashboard/admin/users")}
          className="card hover:border-accent/30 transition-colors text-left cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Users size={20} className="text-primary" />
            </div>
            <div>
              <p className="font-semibold text-text-primary text-sm">Manage Users</p>
              <p className="text-xs text-text-muted">Roles & permissions</p>
            </div>
          </div>
        </button>
        <button
          onClick={() => router.push("/dashboard/admin/tier-rules")}
          className="card hover:border-accent/30 transition-colors text-left cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
              <Settings size={20} className="text-accent" />
            </div>
            <div>
              <p className="font-semibold text-text-primary text-sm">Tier Rules</p>
              <p className="text-xs text-text-muted">Routing & SLA config</p>
            </div>
          </div>
        </button>
        <button
          onClick={() => router.push("/dashboard/admin/reports")}
          className="card hover:border-accent/30 transition-colors text-left cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
              <BarChart3 size={20} className="text-warning" />
            </div>
            <div>
              <p className="font-semibold text-text-primary text-sm">Reports</p>
              <p className="text-xs text-text-muted">Volumes, SLA & audit</p>
            </div>
          </div>
        </button>
      </div>
    </DashboardShell>
  );
}
