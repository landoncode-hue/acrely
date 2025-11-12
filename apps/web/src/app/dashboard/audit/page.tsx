"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { supabase } from "@acrely/services";
import { AuditTable } from "@/components/audit/AuditTable";
import { AuditDetailsModal } from "@/components/audit/AuditDetailsModal";
import { Shield, Download, RefreshCw, Calendar } from "lucide-react";
import { format } from "date-fns";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

interface AuditLog {
  id: string;
  created_at: string;
  user_name: string;
  user_email: string;
  user_role: string;
  action: string;
  entity: string;
  entity_id: string;
  description: string;
  old_data?: any;
  new_data?: any;
  metadata?: any;
}

export default function AuditPage() {
  const { profile, loading: authLoading } = useAuth();
  const router = useRouter();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [dateRange, setDateRange] = useState({
    start: format(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"),
    end: format(new Date(), "yyyy-MM-dd"),
  });

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

  // Fetch audit logs
  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("audit_logs_view")
        .select("*")
        .gte("created_at", new Date(dateRange.start).toISOString())
        .lte("created_at", new Date(dateRange.end + "T23:59:59").toISOString())
        .order("created_at", { ascending: false })
        .limit(500);

      if (error) throw error;

      setLogs(data || []);
    } catch (error: any) {
      console.error("Error fetching audit logs:", error);
      toast.error("Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile?.role && ["CEO", "MD", "SysAdmin"].includes(profile.role)) {
      fetchAuditLogs();
    }
  }, [profile?.role, dateRange]);

  const handleViewDetails = (log: AuditLog) => {
    setSelectedLog(log);
    setShowModal(true);
  };

  const handleExportCSV = () => {
    try {
      // Create CSV content
      const headers = [
        "Date",
        "Time",
        "User",
        "Email",
        "Role",
        "Action",
        "Entity",
        "Entity ID",
        "Description",
      ];

      const rows = logs.map((log) => [
        format(new Date(log.created_at), "yyyy-MM-dd"),
        format(new Date(log.created_at), "HH:mm:ss"),
        log.user_name || "",
        log.user_email || "",
        log.user_role || "",
        log.action,
        log.entity,
        log.entity_id,
        log.description || "",
      ]);

      const csvContent = [
        headers.join(","),
        ...rows.map((row) =>
          row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
        ),
      ].join("\n");

      // Download
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `audit-logs-${format(new Date(), "yyyy-MM-dd")}.csv`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Audit logs exported successfully");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export audit logs");
    }
  };

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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary-100 flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
              <p className="text-sm text-gray-600">
                System-wide activity tracking and monitoring
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Date Range Filters */}
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) =>
                setDateRange({ ...dateRange, start: e.target.value })
              }
              className="text-sm border-none focus:outline-none focus:ring-0"
            />
            <span className="text-gray-400">—</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) =>
                setDateRange({ ...dateRange, end: e.target.value })
              }
              className="text-sm border-none focus:outline-none focus:ring-0"
            />
          </div>

          <button
            onClick={fetchAuditLogs}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>

          <button
            onClick={handleExportCSV}
            disabled={logs.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <p className="text-sm text-gray-600 mb-1">Total Logs</p>
          <p className="text-3xl font-bold text-gray-900">{logs.length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <p className="text-sm text-gray-600 mb-1">Creates</p>
          <p className="text-3xl font-bold text-green-600">
            {logs.filter((l) => l.action === "INSERT").length}
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <p className="text-sm text-gray-600 mb-1">Updates</p>
          <p className="text-3xl font-bold text-blue-600">
            {logs.filter((l) => l.action === "UPDATE").length}
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <p className="text-sm text-gray-600 mb-1">Deletes</p>
          <p className="text-3xl font-bold text-red-600">
            {logs.filter((l) => l.action === "DELETE").length}
          </p>
        </div>
      </div>

      {/* Audit Table */}
      <AuditTable
        logs={logs}
        onViewDetails={handleViewDetails}
        loading={loading}
      />

      {/* Details Modal */}
      <AuditDetailsModal
        log={selectedLog}
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedLog(null);
        }}
      />
    </div>
  );
}
