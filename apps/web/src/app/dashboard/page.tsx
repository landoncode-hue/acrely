"use client";

import { useEffect, useState } from "react";
import { supabase } from "@acrely/services";
import { 
  Users, 
  Building2, 
  DollarSign, 
  TrendingUp, 
  AlertCircle,
  ArrowUp,
  ArrowDown
} from "lucide-react";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { useAuth } from "@/providers/AuthProvider";

interface DashboardStats {
  total_customers: number;
  new_customers_this_month: number;
  total_plots: number;
  available_plots: number;
  total_revenue: number;
  revenue_this_month: number;
  pending_commissions: number;
  overdue_payments: number;
}

export default function DashboardPage() {
  const { profile } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  async function fetchDashboardStats() {
    try {
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      // Fetch various stats in parallel
      const [
        { count: totalCustomers },
        { count: newCustomersThisMonth },
        { count: totalPlots },
        { count: availablePlots },
        { data: revenueData },
        { data: revenueThisMonthData },
        { data: pendingCommissionsData },
        { count: overduePayments },
      ] = await Promise.all([
        supabase.from("customers").select("*", { count: "exact", head: true }),
        supabase
          .from("customers")
          .select("*", { count: "exact", head: true })
          .gte("created_at", firstDayOfMonth.toISOString()),
        supabase.from("plots").select("*", { count: "exact", head: true }),
        supabase
          .from("plots")
          .select("*", { count: "exact", head: true })
          .eq("status", "available"),
        supabase.from("allocations").select("amount_paid"),
        supabase
          .from("allocations")
          .select("amount_paid")
          .gte("created_at", firstDayOfMonth.toISOString()),
        supabase.from("commissions").select("commission_amount").eq("status", "pending"),
        supabase
          .from("allocations")
          .select("*", { count: "exact", head: true })
          .eq("status", "active")
          .lt("next_payment_date", new Date().toISOString()),
      ]);

      const totalRevenue = (revenueData as any)?.reduce((sum: number, item: any) => sum + (item.amount_paid || 0), 0) || 0;
      const revenueThisMonth = (revenueThisMonthData as any)?.reduce((sum: number, item: any) => sum + (item.amount_paid || 0), 0) || 0;
      const pendingCommissions = (pendingCommissionsData as any)?.reduce((sum: number, item: any) => sum + (item.commission_amount || 0), 0) || 0;

      setStats({
        total_customers: totalCustomers || 0,
        new_customers_this_month: newCustomersThisMonth || 0,
        total_plots: totalPlots || 0,
        available_plots: availablePlots || 0,
        total_revenue: totalRevenue,
        revenue_this_month: revenueThisMonth,
        pending_commissions: pendingCommissions,
        overdue_payments: overduePayments || 0,
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Clients",
      value: stats?.total_customers || 0,
      change: `+${stats?.new_customers_this_month || 0} this month`,
      icon: Users,
      color: "primary",
      positive: true,
    },
    {
      title: "Available Plots",
      value: `${stats?.available_plots}/${stats?.total_plots}`,
      change: `${stats?.total_plots! - stats?.available_plots!} allocated`,
      icon: Building2,
      color: "accent",
      positive: true,
    },
    {
      title: "Total Revenue",
      value: `₦${(stats?.total_revenue || 0).toLocaleString()}`,
      change: `₦${(stats?.revenue_this_month || 0).toLocaleString()} this month`,
      icon: DollarSign,
      color: "primary",
      positive: true,
    },
    {
      title: "Pending Commissions",
      value: `₦${(stats?.pending_commissions || 0).toLocaleString()}`,
      change: "Awaiting approval",
      icon: TrendingUp,
      color: "amber",
      positive: false,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-primary-600 mt-1">Pinnacle Builders Homes & Properties</p>
        </div>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg bg-${card.color}-100`}>
                <card.icon className={`w-6 h-6 text-${card.color}-600`} />
              </div>
              {card.positive ? (
                <ArrowUp className="w-5 h-5 text-green-500" />
              ) : (
                <ArrowDown className="w-5 h-5 text-amber-500" />
              )}
            </div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">{card.title}</h3>
            <p className="text-2xl font-bold text-gray-900 mb-2">{card.value}</p>
            <p className="text-sm text-gray-600">{card.change}</p>
          </div>
        ))}
      </div>

      {/* Overdue Payments Alert */}
      {stats && stats.overdue_payments > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-red-900">Overdue Payments</h3>
            <p className="text-sm text-red-700 mt-1">
              {stats.overdue_payments} allocation{stats.overdue_payments > 1 ? "s have" : " has"} overdue payments.
              Please follow up with customers.
            </p>
          </div>
        </div>
      )}

      {/* Activity Feed & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions - Takes 2 columns */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors text-left">
              <Users className="w-6 h-6 text-primary-600 mb-2" />
              <h3 className="font-medium text-gray-900">Add New Client</h3>
              <p className="text-sm text-gray-500 mt-1">Register a new client</p>
            </button>
            <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors text-left">
              <Building2 className="w-6 h-6 text-primary-600 mb-2" />
              <h3 className="font-medium text-gray-900">Create Allocation</h3>
              <p className="text-sm text-gray-500 mt-1">Allocate a plot to client</p>
            </button>
            <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors text-left">
              <DollarSign className="w-6 h-6 text-primary-600 mb-2" />
              <h3 className="font-medium text-gray-900">Record Payment</h3>
              <p className="text-sm text-gray-500 mt-1">Record a new payment</p>
            </button>
          </div>
        </div>

        {/* Activity Feed - Takes 1 column */}
        {profile?.role && ["CEO", "MD", "SysAdmin"].includes(profile.role) && (
          <ActivityFeed limit={5} autoRefresh={true} />
        )}
      </div>
    </div>
  );
}
