"use client";

import { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Clock,
  DollarSign,
  Activity,
  BarChart3,
  Calendar
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import mockData from "@/lib/mock-data.json";
import { formatCost } from "@/lib/utils";

export default function Dashboard() {
  const [timeRange, setTimeRange] = useState("24h");
  const stats = mockData.statistics.dashboard;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTimeRange("24h")}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              timeRange === "24h"
                ? "bg-blue-100 text-blue-700"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Last 24h
          </button>
          <button
            onClick={() => setTimeRange("7d")}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              timeRange === "7d"
                ? "bg-blue-100 text-blue-700"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Last 7d
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Active Gigs"
          value={stats.activeGigs}
          icon={Activity}
          trend={null}
          color="blue"
        />
        <KPICard
          title="Added (24h)"
          value={stats.added24h}
          icon={TrendingUp}
          trend="+15%"
          color="green"
        />
        <KPICard
          title="Deleted (24h)"
          value={stats.deleted24h}
          icon={TrendingDown}
          trend="-8%"
          color="red"
        />
        <KPICard
          title="Error Rate (24h)"
          value={`${(stats.errorRate24h * 100).toFixed(1)}%`}
          icon={AlertCircle}
          trend={stats.errorRate24h > 0.1 ? "High" : "Normal"}
          color={stats.errorRate24h > 0.1 ? "red" : "green"}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <KPICard
          title="Avg Run Time (7d)"
          value={`${stats.avgRunTime7d}s`}
          icon={Clock}
          trend="Normal"
          color="blue"
        />
        <KPICard
          title={`LLM Cost (${timeRange})`}
          value={formatCost(timeRange === "24h" ? stats.llmCost24h : stats.llmCost7d)}
          icon={DollarSign}
          trend={timeRange === "24h" ? "+12%" : "+8%"}
          color="purple"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Chart */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Activity Over Time</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart 
              data={mockData.statistics.hourlyActivity.map(item => ({
                ...item,
                deleted: -item.deleted // Make deleted values negative for display below baseline
              }))}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              barCategoryGap="20%"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="time" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px"
                }}
                formatter={(value, name) => [
                  name === "deleted" ? Math.abs(value as number) : value, // Show absolute value in tooltip
                  name === "deleted" ? "Deleted" : "Added"
                ]}
              />
              <Legend 
                formatter={(value) => value === "deleted" ? "Deleted" : "Added"}
              />
              <Bar
                dataKey="added"
                fill="#10b981"
                name="added"
                radius={[2, 2, 0, 0]}
              />
              <Bar
                dataKey="deleted"
                fill="#ef4444" 
                name="deleted"
                radius={[0, 0, 2, 2]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Sources by Active Gigs */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Top Sources by Active Gigs</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.activeGigsBySite}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="name" 
                stroke="#9ca3af"
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px"
                }}
              />
              <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Errors by Source */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Errors by Source</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={mockData.statistics.errorsBySources}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="name" 
                stroke="#9ca3af"
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px"
                }}
              />
              <Bar dataKey="errors" fill="#ef4444" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Cost by Source */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">LLM Cost by Source (24h)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={mockData.statistics.costBySources}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="name" 
                stroke="#9ca3af"
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px"
                }}
                formatter={(value: any) => formatCost(value)}
              />
              <Bar dataKey="cost" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

interface KPICardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend: string | null;
  color: "blue" | "green" | "red" | "purple";
}

function KPICard({ title, value, icon: Icon, trend, color }: KPICardProps) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    red: "bg-red-50 text-red-600",
    purple: "bg-purple-50 text-purple-600",
  };

  const trendColorClasses = {
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