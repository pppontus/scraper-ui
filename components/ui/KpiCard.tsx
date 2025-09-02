import React from "react";

type Color = "blue" | "green" | "red" | "purple";

export interface KpiCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: string | null;
  color?: Color;
}

export function KpiCard({ title, value, icon: Icon, trend = null, color = "blue" }: KpiCardProps) {
  const colorClasses: Record<Color, string> = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    red: "bg-red-50 text-red-600",
    purple: "bg-purple-50 text-purple-600",
  };

  const trendColorClasses: Record<Color, string> = {
    blue: "text-blue-600",
    green: "text-green-600",
    red: "text-red-600",
    purple: "text-purple-600",
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-600">{title}</span>
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="flex items-baseline justify-between">
        <span className="text-2xl font-bold text-gray-900">{value}</span>
        {trend && (
          <span className={`text-sm font-medium ${trendColorClasses[color]}`}>
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}

