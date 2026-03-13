"use client";

import { Shield, AlertTriangle, XCircle, CheckCircle2 } from "lucide-react";

interface RiskBadgeProps {
  level: "low" | "medium" | "high" | "critical" | "Low" | "Medium" | "High" | "Critical" | null;
  score?: number | null;
  size?: "sm" | "md" | "lg";
  showScore?: boolean;
}

const riskConfig = {
  low: {
    color: "text-success",
    bg: "bg-success/10",
    border: "border-success/20",
    icon: CheckCircle2,
    label: "Low",
  },
  medium: {
    color: "text-warning",
    bg: "bg-warning/10",
    border: "border-warning/20",
    icon: AlertTriangle,
    label: "Medium",
  },
  high: {
    color: "text-danger",
    bg: "bg-danger/10",
    border: "border-danger/20",
    icon: AlertTriangle,
    label: "High",
  },
  critical: {
    color: "text-danger",
    bg: "bg-danger/10",
    border: "border-danger/20",
    icon: XCircle,
    label: "Critical",
  },
};

export function RiskBadge({ level, score, size = "sm", showScore = false }: RiskBadgeProps) {
  if (!level) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
        <Shield size={12} />
        Not Assessed
      </span>
    );
  }

  // Normalize level to lowercase to handle both "Low" and "low"
  const normalizedLevel = level.toLowerCase() as "low" | "medium" | "high" | "critical";
  const config = riskConfig[normalizedLevel];
  
  // Fallback if level is invalid
  if (!config) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
        <Shield size={12} />
        Unknown
      </span>
    );
  }
  
  const Icon = config.icon;

  const sizeClasses = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-3 py-1.5",
    lg: "text-base px-4 py-2",
  };

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16,
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${config.bg} ${config.border} ${config.color} font-semibold ${sizeClasses[size]}`}
    >
      <Icon size={iconSizes[size]} />
      <span>{config.label} Risk</span>
      {showScore && score !== null && score !== undefined && (
        <span className="ml-0.5">({score})</span>
      )}
    </span>
  );
}

export function RiskScoreIndicator({ score }: { score: number | null }) {
  if (score === null || score === undefined) {
    return null;
  }

  const level: "low" | "medium" | "high" | "critical" =
    score < 40 ? "low" : score < 60 ? "medium" : score < 80 ? "high" : "critical";

  const config = riskConfig[level];

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            level === "low"
              ? "bg-success"
              : level === "medium"
              ? "bg-warning"
              : "bg-danger"
          }`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className={`text-sm font-bold ${config.color} min-w-[3rem] text-right`}>
        {score}/100
      </span>
    </div>
  );
}
