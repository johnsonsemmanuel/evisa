"use client";

import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useRealTimeDashboard } from "@/hooks/useRealTimeDashboard";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { StatusBadge, SlaIndicator, RiskBadge } from "@/components/ui/badge";
import { MetricsSkeleton } from "@/components/ui/skeleton";
import {
  FolderOpen,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ChevronRight,
  FileCheck,
  Inbox,
  BadgeCheck,
  Shield,
  Users,
  TrendingUp,
  BarChart3,
  Wifi,
  WifiOff,
} from "lucide-react";
import type { GisMetrics, Application } from "@/lib/types";

export default function GisDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [realtimeMetrics, setRealtimeMetrics] = useState<GisMetrics | null>(null);

  // Real-time dashboard hook
  const { isConnected, metrics: liveMetrics } = useRealTimeDashboard({
    agency: 'gis',
    onMetricsUpdate: useCallback((newMetrics: any) => {
      setRealtimeMetrics(newMetrics);
    }, []),
    onApplicationStatusChange: useCallback((update: any) => {
      // Optionally show toast notification for status changes
      console.log('Application status changed:', update);
    }, []),
  });

  const { data: metrics, isLoading } = useQuery({
    queryKey: ["gis-metrics"],
    queryFn: () => api.get<GisMetrics>("/gis/metrics").then((r) => r.data),
    refetchInterval: isConnected ? 300000 : 30000, // Reduce polling when connected to WebSocket
  });

  // Use real-time metrics if available, otherwise fall back to polled data
  const currentMetrics = realtimeMetrics || metrics;

  const { data: recentCases } = useQuery({
    queryKey: ["gis-recent-cases"],
    queryFn: () =>
      api.get<{ data: Application[] }>("/gis/cases", { params: { per_page: 6 } }).then((r) => r.data),
    refetchInterval: 60000,
  });

  const { data: areaData, isLoading: areaLoading } = useQuery({
    queryKey: ["gis-area-data", selectedArea],
    queryFn: async () => {
      if (!selectedArea) return null;
      if (selectedArea === "review_queue") {
        return api.get("/gis/cases?queue=review_queue&per_page=10").then(r => r.data);
      } else if (selectedArea === "approval_queue") {
        return api.get("/gis/cases?queue=approval_queue&per_page=10").then(r => r.data);
      } else if (selectedArea === "all_cases") {
        return api.get("/gis/cases?per_page=10").then(r => r.data);
      } else if (selectedArea === "sla_alerts") {
        return api.get("/gis/cases?sla_breached=true&per_page=10").then(r => r.data);
      } else if (selectedArea === "flagged_etas") {
        return api.get("/gis/cases?type=eta&status=flagged&per_page=10").then(r => r.data);
      }
      return null;
    },
    enabled: !!selectedArea,
    refetchInterval: 30000,
  });

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <DashboardShell
      title="GIS Dashboard"
      description="Ghana Immigration Service — Case overview"
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
            leftIcon={<FolderOpen size={16} />}
            onClick={() => router.push("/dashboard/gis/cases")}
          >
            Case Queue
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
            {user?.first_name || "Officer"} {user?.last_name || ""}
          </h2>
          <p className="text-white/70 text-sm max-w-md">
            Review and process visa applications assigned to the Ghana Immigration Service.
          </p>
          <div className="flex items-center gap-3 mt-5">
            <Button
              onClick={() => router.push("/dashboard/gis/cases?queue=review_queue")}
              leftIcon={<FolderOpen size={15} />}
              className="!bg-white !text-accent hover:!bg-white/90 !shadow-lg !font-bold"
            >
              Review Queue
            </Button>
            <Button
              variant="ghost"
              onClick={() => router.push("/dashboard/gis/cases")}
              className="!text-white/90 hover:!text-white hover:!bg-white/15"
            >
              All Cases <ArrowRight size={14} className="ml-1" />
            </Button>
          </div>
        </div>
      </div>

      {/* ── Area Selection Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        {/* Review Queue */}
        <div 
          className={`card p-6 cursor-pointer transition-all duration-200 hover:shadow-lg ${
            selectedArea === "review_queue" 
              ? "ring-2 ring-info bg-info/5 border-info" 
              : "hover:border-info/30"
          }`}
          onClick={() => setSelectedArea(selectedArea === "review_queue" ? null : "review_queue")}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-info/8 flex items-center justify-center">
              <FolderOpen size={24} className="text-info" />
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-text-primary">{currentMetrics?.review_queue ?? 0}</p>
              <p className="text-xs text-text-muted">Pending</p>
            </div>
          </div>
          <h3 className="font-semibold text-text-primary mb-2">Review Queue</h3>
          <p className="text-sm text-text-secondary mb-4">Applications waiting for initial review and processing.</p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-muted">
              {selectedArea === "review_queue" ? "Click to hide details" : "Click to view details"}
            </span>
            <ChevronRight size={16} className={`text-text-muted transition-transform ${selectedArea === "review_queue" ? "rotate-90" : ""}`} />
          </div>
        </div>

        {/* Approval Queue */}
        <div 
          className={`card p-6 cursor-pointer transition-all duration-200 hover:shadow-lg ${
            selectedArea === "approval_queue" 
              ? "ring-2 ring-warning bg-warning/5 border-warning" 
              : "hover:border-warning/30"
          }`}
          onClick={() => setSelectedArea(selectedArea === "approval_queue" ? null : "approval_queue")}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-warning/8 flex items-center justify-center">
              <BadgeCheck size={24} className="text-warning" />
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-text-primary">{currentMetrics?.approval_queue ?? 0}</p>
              <p className="text-xs text-text-muted">Pending</p>
            </div>
          </div>
          <h3 className="font-semibold text-text-primary mb-2">Approval Queue</h3>
          <p className="text-sm text-text-secondary mb-4">Applications ready for final approval decision.</p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-muted">
              {selectedArea === "approval_queue" ? "Click to hide details" : "Click to view details"}
            </span>
            <ChevronRight size={16} className={`text-text-muted transition-transform ${selectedArea === "approval_queue" ? "rotate-90" : ""}`} />
          </div>
        </div>

        {/* All Cases */}
        <div 
          className={`card p-6 cursor-pointer transition-all duration-200 hover:shadow-lg ${
            selectedArea === "all_cases" 
              ? "ring-2 ring-success bg-success/5 border-success" 
              : "hover:border-success/30"
          }`}
          onClick={() => setSelectedArea(selectedArea === "all_cases" ? null : "all_cases")}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-success/8 flex items-center justify-center">
              <BarChart3 size={24} className="text-success" />
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-text-primary">{currentMetrics?.pending_review ?? 0}</p>
              <p className="text-xs text-text-muted">Total</p>
            </div>
          </div>
          <h3 className="font-semibold text-text-primary mb-2">All Cases</h3>
          <p className="text-sm text-text-secondary mb-4">Complete overview of all GIS applications.</p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-muted">
              {selectedArea === "all_cases" ? "Click to hide details" : "Click to view details"}
            </span>
            <ChevronRight size={16} className={`text-text-muted transition-transform ${selectedArea === "all_cases" ? "rotate-90" : ""}`} />
          </div>
        </div>

        {/* SLA Alerts */}
        <div 
          className={`card p-6 cursor-pointer transition-all duration-200 hover:shadow-lg ${
            selectedArea === "sla_alerts" 
              ? "ring-2 ring-danger bg-danger/5 border-danger" 
              : "hover:border-danger/30"
          }`}
          onClick={() => setSelectedArea(selectedArea === "sla_alerts" ? null : "sla_alerts")}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-danger/8 flex items-center justify-center">
              <AlertTriangle size={24} className="text-danger" />
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-text-primary">{currentMetrics?.sla_breaches ?? 0}</p>
              <p className="text-xs text-text-muted">Alerts</p>
            </div>
          </div>
          <h3 className="font-semibold text-text-primary mb-2">SLA Alerts</h3>
          <p className="text-sm text-text-secondary mb-4">Applications requiring urgent attention.</p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-muted">
              {selectedArea === "sla_alerts" ? "Click to hide details" : "Click to view details"}
            </span>
            <ChevronRight size={16} className={`text-text-muted transition-transform ${selectedArea === "sla_alerts" ? "rotate-90" : ""}`} />
          </div>
        </div>

        {/* Flagged ETAs */}
        <div 
          className={`card p-6 cursor-pointer transition-all duration-200 hover:shadow-lg ${
            selectedArea === "flagged_etas" 
              ? "ring-2 ring-warning bg-warning/5 border-warning" 
              : "hover:border-warning/30"
          }`}
          onClick={() => setSelectedArea(selectedArea === "flagged_etas" ? null : "flagged_etas")}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-warning/8 flex items-center justify-center">
              <Shield size={24} className="text-warning" />
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-text-primary">{currentMetrics?.flagged_etas ?? 0}</p>
              <p className="text-xs text-text-muted">Flagged</p>
            </div>
          </div>
          <h3 className="font-semibold text-text-primary mb-2">Flagged ETAs</h3>
          <p className="text-sm text-text-secondary mb-4">ETA applications requiring admin review.</p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-muted">
              {selectedArea === "flagged_etas" ? "Click to hide details" : "Click to view details"}
            </span>
            <ChevronRight size={16} className={`text-text-muted transition-transform ${selectedArea === "flagged_etas" ? "rotate-90" : ""}`} />
          </div>
        </div>
      </div>

      {/* ── Area Details ── */}
      {selectedArea && (
        <div className="bg-white rounded-2xl border border-border shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <div>
              <h2 className="text-base font-bold text-text-primary">
                {selectedArea === "review_queue" && "Review Queue Details"}
                {selectedArea === "approval_queue" && "Approval Queue Details"}
                {selectedArea === "all_cases" && "All Cases"}
                {selectedArea === "sla_alerts" && "SLA Alerts"}
                {selectedArea === "flagged_etas" && "Flagged ETAs"}
              </h2>
              <p className="text-xs text-text-muted mt-0.5">
                {selectedArea === "review_queue" && "Applications waiting for initial review"}
                {selectedArea === "approval_queue" && "Applications ready for final approval"}
                {selectedArea === "all_cases" && "Complete overview of all applications"}
                {selectedArea === "sla_alerts" && "Applications requiring urgent attention"}
                {selectedArea === "flagged_etas" && "ETA applications flagged for admin review"}
              </p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => router.push(`/dashboard/gis/cases${selectedArea === "review_queue" ? "?queue=review_queue" : selectedArea === "approval_queue" ? "?queue=approval_queue" : selectedArea === "sla_alerts" ? "?sla_breached=true" : selectedArea === "flagged_etas" ? "?type=eta&status=flagged" : ""}`)}
            >
              View All <ArrowRight size={13} className="ml-1" />
            </Button>
          </div>

          {areaLoading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-16 bg-surface animate-pulse rounded-lg" />
              ))}
            </div>
          ) : !areaData?.data?.length ? (
            <div className="text-center py-16">
              <div className="w-14 h-14 bg-surface rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Inbox size={24} className="text-text-muted" />
              </div>
              <p className="text-text-primary font-semibold mb-1">No cases found</p>
              <p className="text-sm text-text-muted mb-6 max-w-xs mx-auto">
                {selectedArea === "review_queue" && "No applications in review queue"}
                {selectedArea === "approval_queue" && "No applications pending approval"}
                {selectedArea === "all_cases" && "No applications found"}
                {selectedArea === "sla_alerts" && "No SLA breaches found"}
                {selectedArea === "flagged_etas" && "No flagged ETAs found"}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {areaData.data.map((app: Application) => {
                const hoursLeft = app.sla_deadline
                  ? Math.max(0, (new Date(app.sla_deadline).getTime() - Date.now()) / 3600000)
                  : null;
                const isUrgent = hoursLeft !== null && hoursLeft < 12;

                return (
                  <div
                    key={app.id}
                    className={`flex items-center gap-4 px-6 py-4 hover:bg-surface/60 transition-colors cursor-pointer group ${isUrgent ? "bg-danger/3" : ""}`}
                    onClick={() => router.push(`/dashboard/gis/cases/${app.id}`)}
                  >
                    <div className={`w-10 h-10 rounded-lg ${isUrgent ? "bg-danger/10" : "bg-info/10"} flex items-center justify-center shrink-0`}>
                      {isUrgent ? (
                        <AlertTriangle size={18} className="text-danger" />
                      ) : (
                        <FileCheck size={18} className="text-info" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-text-primary truncate">{app.reference_number}</p>
                        <StatusBadge status={app.status} />
                      </div>
                      <div className="flex items-center gap-4 text-xs text-text-muted">
                        <span>{app.visa_type?.name}</span>
                        {app.assigned_officer && (
                          <span>{app.assigned_officer.first_name} {app.assigned_officer.last_name}</span>
                        )}
                        {app.current_queue && (
                          <span className="px-2 py-0.5 rounded-full bg-surface">
                            {app.current_queue.replace('_', ' ')}
                          </span>
                        )}
                        {app.risk_level && (
                          <RiskBadge level={app.risk_level} score={app.risk_score} showScore />
                        )}
                        {hoursLeft !== null && (
                          <SlaIndicator hoursLeft={hoursLeft} isWithinSla={hoursLeft > 0} />
                        )}
                      </div>
                      {app.purpose_of_visit && (
                        <p className="text-xs text-text-muted mt-1 line-clamp-2">{app.purpose_of_visit}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Recent Cases (shown when no area selected) ── */}
      {!selectedArea && (
        <div className="bg-white rounded-2xl border border-border shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <div>
              <h2 className="text-base font-bold text-text-primary">Recent Cases</h2>
              <p className="text-xs text-text-muted mt-0.5">Latest applications in your queue</p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => router.push("/dashboard/gis/cases")}
            >
              View All <ArrowRight size={13} className="ml-1" />
            </Button>
          </div>

          {isLoading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-14 bg-surface animate-pulse rounded-lg" />
              ))}
            </div>
          ) : !recentCases?.data?.length ? (
            <div className="text-center py-16">
              <div className="w-14 h-14 bg-surface rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Inbox size={24} className="text-text-muted" />
              </div>
              <p className="text-text-primary font-semibold mb-1">No cases yet</p>
              <p className="text-sm text-text-muted mb-6 max-w-xs mx-auto">
                Applications assigned to GIS will appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {recentCases.data.slice(0, 6).map((app: Application) => {
                const hoursLeft = app.sla_deadline
                  ? Math.max(0, (new Date(app.sla_deadline).getTime() - Date.now()) / 3600000)
                  : null;
                const isUrgent = hoursLeft !== null && hoursLeft < 12;

                return (
                  <div
                    key={app.id}
                    className={`flex items-center gap-4 px-6 py-3.5 hover:bg-surface/60 transition-colors cursor-pointer group ${isUrgent ? "bg-danger/3" : ""}`}
                    onClick={() => router.push(`/dashboard/gis/cases/${app.id}`)}
                  >
                    <div className={`w-9 h-9 rounded-lg ${isUrgent ? "bg-danger/10" : "bg-info/10"} flex items-center justify-center shrink-0`}>
                      {isUrgent ? (
                        <AlertTriangle size={16} className="text-danger" />
                      ) : (
                        <FileCheck size={16} className="text-info" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-text-primary truncate">{app.reference_number}</p>
                        <StatusBadge status={app.status} />
                      </div>
                      <div className="flex items-center gap-4 text-xs text-text-muted">
                        <span>{app.visa_type?.name}</span>
                        {app.assigned_officer && (
                          <span>{app.assigned_officer.first_name} {app.assigned_officer.last_name}</span>
                        )}
                        {app.risk_level && (
                          <RiskBadge level={app.risk_level} score={app.risk_score} />
                        )}
                        {hoursLeft !== null && (
                          <SlaIndicator hoursLeft={hoursLeft} isWithinSla={hoursLeft > 0} />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Quick Actions ── */}
      <div className="mt-8">
        <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3">
          Quick Actions
        </h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <button
            onClick={() => router.push("/dashboard/gis/cases?queue=review_queue")}
            className="card hover:border-accent/30 transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-info/10 rounded-lg flex items-center justify-center">
                <FolderOpen size={20} className="text-info" />
              </div>
              <div>
                <p className="font-semibold text-text-primary text-sm">Review Queue</p>
                <p className="text-xs text-text-muted">{currentMetrics?.review_queue ?? 0} cases awaiting review</p>
              </div>
            </div>
          </button>
          <button
            onClick={() => router.push("/dashboard/gis/cases?queue=approval_queue")}
            className="card hover:border-accent/30 transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
                <BadgeCheck size={20} className="text-warning" />
              </div>
              <div>
                <p className="font-semibold text-text-primary text-sm">Approval Queue</p>
                <p className="text-xs text-text-muted">{currentMetrics?.approval_queue ?? 0} pending approval</p>
              </div>
            </div>
          </button>
          <button
            onClick={() => router.push("/dashboard/gis/sla-alerts")}
            className="card hover:border-accent/30 transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-danger/10 rounded-lg flex items-center justify-center">
                <Shield size={20} className="text-danger" />
              </div>
              <div>
                <p className="font-semibold text-text-primary text-sm">SLA Alerts</p>
                <p className="text-xs text-text-muted">{currentMetrics?.sla_breaches ?? 0} breaches detected</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </DashboardShell>
  );
}
