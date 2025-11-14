"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { supabase } from "@acrely/services";
import { 
  Users, 
  Building2, 
  DollarSign, 
  FileText,
  TrendingUp,
  TrendingDown,
  Activity,
  AlertCircle
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

interface SystemStats {
  totalUsers: number;
  totalCustomers: number;
  totalAllocations: number;
  totalPayments: number;
  pendingPayments: number;
  auditLogs30d: number;
}

interface ActivityStat {
  totalActions: number;
  totalCreates: number;
  totalUpdates: number;
  totalDeletes: number;
  uniqueUsers: number;
  mostActiveEntity: string;
}

export default function AdminDashboardPage() {
  const { profile, loading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [activityStats, setActivityStats] = useState<ActivityStat | null>(null);
  const [loading, setLoading] = useState(true);

  // Check admin access
  useEffect(() => {
    if (!authLoading && profile) {
      const adminRoles = ["CEO", "MD", "SysAdmin"];
      if (!adminRoles.includes(profile.role)) {
        toast.error("Access denied. Admin privileges required.");
        router.push("/dashboard");
      }
    }
  }, [profile, authLoading, router]);

  // Fetch system health
  const fetchSystemHealth = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .rpc("system_health_check");

      if (error) throw error;

      // Transform the array into an object
      const statsObj: any = {};
      (data as any)?.forEach((item: any) => {
        const key = item.metric.replace(/\s+/g, "");
        statsObj[key.charAt(0).toLowerCase() + key.slice(1)] = item.value;
      });

      setStats({
        totalUsers: statsObj.totalUsers || 0,
        totalCustomers: statsObj.totalCustomers || 0,
        totalAllocations: statsObj.totalAllocations || 0,
        totalPayments: statsObj.totalPayments || 0,
        pendingPayments: statsObj.pendingPayments || 0,
        auditLogs30d: statsObj.auditLogs30d || 0,
      });
    } catch (error: any) {
      console.error("Error fetching system health:", error);
      toast.error("Failed to load system stats");
    } finally {
      setLoading(false);
    }
  };

  // Fetch activity stats
  const fetchActivityStats = async () => {
    try {
      const { data, error } = await supabase
        .rpc("get_audit_activity_stats", { days_back: 1 } as any);

      if (error) throw error;

      if (data && (data as any).length > 0) {
        const firstItem = (data as any)[0];
        setActivityStats({
          totalActions: Number(firstItem.total_actions) || 0,
          totalCreates: Number(firstItem.total_creates) || 0,
          totalUpdates: Number(firstItem.total_updates) || 0,
          totalDeletes: Number(firstItem.total_deletes) || 0,
          uniqueUsers: Number(firstItem.unique_users) || 0,
          mostActiveEntity: firstItem.most_active_entity || "—",
        });
      }
    } catch (error: any) {
      console.error("Error fetching activity stats:", error);
    }
  };

  useEffect(() => {
    if (profile?.role && ["CEO", "MD", "SysAdmin"].includes(profile.role)) {
      fetchSystemHealth();
      fetchActivityStats();
    }
  }, [profile?.role]);

  if (authLoading || !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">System Overview</h1>
        <p className="text-sm text-gray-600">
          Real-time system health and activity monitoring
        </p>
      </div>

      {/* System Health Cards */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">System Health</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard
            title="Total Users"
            value={stats?.totalUsers || 0}
            icon={<Users className="w-6 h-6" />}
            color="blue"
            loading={loading}
          />
          <StatCard
            title="Total Customers"
            value={stats?.totalCustomers || 0}
            icon={<Users className="w-6 h-6" />}
            color="green"
            loading={loading}
          />
          <StatCard
            title="Total Allocations"
            value={stats?.totalAllocations || 0}
            icon={<FileText className="w-6 h-6" />}
            color="purple"
            loading={loading}
          />
          <StatCard
            title="Total Payments"
            value={stats?.totalPayments || 0}
            icon={<DollarSign className="w-6 h-6" />}
            color="emerald"
            loading={loading}
          />
          <StatCard
            title="Pending Payments"
            value={stats?.pendingPayments || 0}
            icon={<AlertCircle className="w-6 h-6" />}
            color="amber"
            loading={loading}
            warning={!!stats?.pendingPayments && stats.pendingPayments > 0}
          />
          <StatCard
            title="Audit Logs (30d)"
            value={stats?.auditLogs30d || 0}
            icon={<Activity className="w-6 h-6" />}
            color="indigo"
            loading={loading}
          />
        </div>
      </div>

      {/* Today's Activity */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Today's Activity</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ActivityCard
            title="Total Actions"
            value={activityStats?.totalActions || 0}
            subtitle={`${activityStats?.uniqueUsers || 0} active users`}
            icon={<Activity className="w-5 h-5" />}
            color="gray"
          />
          <ActivityCard
            title="Creates"
            value={activityStats?.totalCreates || 0}
            icon={<TrendingUp className="w-5 h-5" />}
            color="green"
          />
          <ActivityCard
            title="Updates"
            value={activityStats?.totalUpdates || 0}
            icon={<FileText className="w-5 h-5" />}
            color="blue"
          />
          <ActivityCard
            title="Deletes"
            value={activityStats?.totalDeletes || 0}
            icon={<TrendingDown className="w-5 h-5" />}
            color="red"
          />
          <div className="col-span-1 md:col-span-2 bg-white rounded-2xl border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-2">Most Active Entity</p>
            <p className="text-2xl font-bold text-gray-900 capitalize">
              {activityStats?.mostActiveEntity || "—"}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => router.push("/dashboard/audit")}
            className="bg-white rounded-2xl border border-gray-200 p-6 hover:border-primary-300 hover:shadow-md transition-all text-left"
          >
            <Activity className="w-8 h-8 text-primary-600 mb-3" />
            <h3 className="font-semibold text-gray-900">View Audit Logs</h3>
            <p className="text-sm text-gray-600 mt-1">
              Review all system activity
            </p>
          </button>
          
          <button
            onClick={() => router.push("/dashboard/customers")}
            className="bg-white rounded-2xl border border-gray-200 p-6 hover:border-primary-300 hover:shadow-md transition-all text-left"
          >
            <Users className="w-8 h-8 text-green-600 mb-3" />
            <h3 className="font-semibold text-gray-900">Manage Customers</h3>
            <p className="text-sm text-gray-600 mt-1">
              View and edit customer data
            </p>
          </button>
          
          <button
            onClick={() => router.push("/dashboard/reports")}
            className="bg-white rounded-2xl border border-gray-200 p-6 hover:border-primary-300 hover:shadow-md transition-all text-left"
          >
            <FileText className="w-8 h-8 text-blue-600 mb-3" />
            <h3 className="font-semibold text-gray-900">Generate Reports</h3>
            <p className="text-sm text-gray-600 mt-1">
              Create system reports
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  loading?: boolean;
  warning?: boolean;
}

function StatCard({ title, value, icon, color, loading, warning }: StatCardProps) {
  const colorClasses: Record<string, string> = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    purple: "bg-purple-100 text-purple-600",
    emerald: "bg-emerald-100 text-emerald-600",
    amber: "bg-amber-100 text-amber-600",
    indigo: "bg-indigo-100 text-indigo-600",
  };

  return (
    <div className={`bg-white rounded-2xl border border-gray-200 p-6 ${warning ? "border-amber-300" : ""}`}>
      <div className="flex items-center justify-between mb-3">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${colorClasses[color]}`}>
          {icon}
        </div>
        {warning && (
          <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
            Action needed
          </span>
        )}
      </div>
      <p className="text-sm text-gray-600 mb-1">{title}</p>
      {loading ? (
        <div className="h-9 bg-gray-100 rounded animate-pulse"></div>
      ) : (
        <p className="text-3xl font-bold text-gray-900">{value.toLocaleString()}</p>
      )}
    </div>
  );
}

interface ActivityCardProps {
  title: string;
  value: number;
  subtitle?: string;
  icon: React.ReactNode;
  color: string;
}

function ActivityCard({ title, value, subtitle, icon, color }: ActivityCardProps) {
  const colorClasses: Record<string, string> = {
    gray: "bg-gray-100 text-gray-600",
    green: "bg-green-100 text-green-600",
    blue: "bg-blue-100 text-blue-600",
    red: "bg-red-100 text-red-600",
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorClasses[color]}`}>
          {icon}
        </div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value.toLocaleString()}</p>
      {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
    </div>
  );
}
