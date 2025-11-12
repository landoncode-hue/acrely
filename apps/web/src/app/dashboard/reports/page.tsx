"use client";

import { useEffect, useState } from "react";
import { supabase } from "@acrely/services";
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  Building2,
  Download,
  Calendar,
  FileText,
  PieChart as PieChartIcon
} from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface MonthlyRevenue {
  month: string;
  total_amount: number;
  total_payments: number;
  confirmed_payments: number;
}

interface EstatePerformance {
  estate_name: string;
  total_plots: number;
  available_plots: number;
  allocated_plots: number;
  sold_plots: number;
  total_revenue: number;
  revenue_collected: number;
  outstanding_balance: number;
}

interface CommissionSummary {
  agent_name: string;
  total_commissions: number;
  pending_amount: number;
  approved_amount: number;
  paid_amount: number;
}

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("all");
  const [monthlyRevenue, setMonthlyRevenue] = useState<MonthlyRevenue[]>([]);
  const [estatePerformance, setEstatePerformance] = useState<EstatePerformance[]>([]);
  const [commissionSummary, setCommissionSummary] = useState<CommissionSummary[]>([]);

  useEffect(() => {
    fetchReports();
  }, [dateRange]);

  async function fetchReports() {
    try {
      setLoading(true);

      // Fetch monthly payment performance
      const { data: revenueData } = await supabase
        .from("monthly_payment_performance")
        .select("*")
        .order("month", { ascending: false })
        .limit(12);

      // Fetch estate performance
      const { data: estatesData } = await supabase
        .from("estate_performance")
        .select("*")
        .order("total_revenue", { ascending: false });

      // Fetch commission summary
      const { data: commissionsData } = await supabase
        .from("commission_summary")
        .select("*")
        .order("total_amount", { ascending: false });

      setMonthlyRevenue(revenueData || []);
      setEstatePerformance(estatesData || []);
      setCommissionSummary(commissionsData || []);
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-sky-200 border-t-sky-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading reports...</p>
        </div>
      </div>
    );
  }

  const totalRevenue = monthlyRevenue.reduce((sum, m) => sum + Number(m.total_amount), 0);
  const totalPayments = monthlyRevenue.reduce((sum, m) => sum + m.total_payments, 0);
  const totalCommissions = commissionSummary.reduce((sum, c) => sum + Number(c.pending_amount) + Number(c.approved_amount), 0);

  // Export functions
  const exportToCSV = () => {
    const csvData = [
      ["Estate Performance Report"],
      ["Estate", "Total Plots", "Available", "Allocated", "Sold", "Revenue", "Outstanding"],
      ...estatePerformance.map((e) => [
        e.estate_name,
        e.total_plots,
        e.available_plots,
        e.allocated_plots,
        e.sold_plots,
        e.revenue_collected,
        e.outstanding_balance,
      ]),
      [],
      ["Commission Summary"],
      ["Agent", "Total", "Pending", "Approved", "Paid"],
      ...commissionSummary.map((c) => [
        c.agent_name,
        c.total_commissions,
        c.pending_amount,
        c.approved_amount,
        c.paid_amount,
      ]),
    ];

    const csv = csvData.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `acrely-reports-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  const exportToPDF = () => {
    window.print();
  };

  // Chart colors
  const COLORS = ["#0284c7", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"];

  // Prepare chart data
  const revenueChartData = monthlyRevenue.slice(0, 6).reverse().map((m) => ({
    month: new Date(m.month).toLocaleDateString("en-US", { month: "short" }),
    revenue: Number(m.total_amount),
    payments: m.total_payments,
  }));

  const commissionChartData = commissionSummary.slice(0, 5).map((c) => ({
    name: c.agent_name.split(" ")[0],
    pending: Number(c.pending_amount),
    approved: Number(c.approved_amount),
    paid: Number(c.paid_amount),
  }));

  const estatePieData = estatePerformance.slice(0, 5).map((e) => ({
    name: e.estate_name,
    value: Number(e.revenue_collected),
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-500 mt-1">Comprehensive business intelligence</p>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
          >
            <option value="all">All Time</option>
            <option value="year">This Year</option>
            <option value="quarter">This Quarter</option>
            <option value="month">This Month</option>
          </select>
          <button 
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <FileText className="w-5 h-5" />
            CSV
          </button>
          <button 
            onClick={exportToPDF}
            className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700"
          >
            <Download className="w-5 h-5" />
            PDF
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-green-100">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">Total Revenue</h3>
          <p className="text-2xl font-bold text-gray-900">₦{totalRevenue.toLocaleString()}</p>
          <p className="text-sm text-gray-600 mt-2">{totalPayments} payments recorded</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-purple-100">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">Pending Commissions</h3>
          <p className="text-2xl font-bold text-gray-900">₦{totalCommissions.toLocaleString()}</p>
          <p className="text-sm text-gray-600 mt-2">{commissionSummary.length} agents</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-sky-100">
              <Building2 className="w-6 h-6 text-sky-600" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">Active Estates</h3>
          <p className="text-2xl font-bold text-gray-900">{estatePerformance.length}</p>
          <p className="text-sm text-gray-600 mt-2">
            {estatePerformance.reduce((sum, e) => sum + e.total_plots, 0)} total plots
          </p>
        </div>
      </div>

      {/* Revenue & Commission Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Revenue Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-sky-600" />
            Revenue Trend (6 Months)
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                formatter={(value: number) => `₦${value.toLocaleString()}`}
                contentStyle={{ backgroundColor: "white", border: "1px solid #e5e7eb" }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#0284c7" 
                strokeWidth={2}
                name="Revenue"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Commission Breakdown Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-600" />
            Top 5 Agents - Commission Status
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={commissionChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                formatter={(value: number) => `₦${value.toLocaleString()}`}
                contentStyle={{ backgroundColor: "white", border: "1px solid #e5e7eb" }}
              />
              <Legend />
              <Bar dataKey="pending" fill="#f59e0b" name="Pending" />
              <Bar dataKey="approved" fill="#0284c7" name="Approved" />
              <Bar dataKey="paid" fill="#10b981" name="Paid" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Estate Revenue Pie Chart */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <PieChartIcon className="w-5 h-5 text-green-600" />
          Revenue by Estate (Top 5)
        </h2>
        <div className="flex flex-col lg:flex-row items-center gap-8">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={estatePieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name}: ₦${(entry.value / 1000000).toFixed(1)}M`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {estatePieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `₦${value.toLocaleString()}`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-col gap-2">
            {estatePieData.map((estate, index) => (
              <div key={index} className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded" 
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-sm text-gray-700">{estate.name}</span>
                <span className="text-sm font-semibold text-gray-900">
                  ₦{estate.value.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Monthly Revenue Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Monthly Revenue Performance</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Month</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Payments</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Confirmed</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {monthlyRevenue.map((month, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {new Date(month.month).toLocaleDateString("en-US", { 
                      year: "numeric", 
                      month: "long" 
                    })}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{month.total_payments}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{month.confirmed_payments}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    ₦{Number(month.total_amount).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Estate Performance */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Estate Performance</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estate</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Plots</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Available</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Allocated</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sold</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Outstanding</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {estatePerformance.map((estate, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{estate.estate_name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{estate.total_plots}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{estate.available_plots}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{estate.allocated_plots}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{estate.sold_plots}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    ₦{Number(estate.revenue_collected).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-amber-600">
                    ₦{Number(estate.outstanding_balance).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Commission Summary */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Agent Commission Summary</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Agent</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pending</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Approved</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paid</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {commissionSummary.map((agent, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{agent.agent_name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{agent.total_commissions}</td>
                  <td className="px-4 py-3 text-sm text-amber-600">
                    ₦{Number(agent.pending_amount).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-sky-600">
                    ₦{Number(agent.approved_amount).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-green-600">
                    ₦{Number(agent.paid_amount).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
