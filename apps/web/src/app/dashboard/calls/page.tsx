"use client";

import { useEffect, useState } from "react";
import { supabase } from "@acrely/services";
import { Phone, Clock, User } from "lucide-react";
import { Card, CardContent, CardHeader } from "@acrely/ui";

interface CallLog {
  id: string;
  phone: string;
  duration_seconds: number;
  outcome: string;
  notes: string;
  created_at: string;
  customer_id: string;
  lead_id: string;
}

export default function CallLogsPage() {
  const [calls, setCalls] = useState<CallLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCallLogs();
  }, []);

  async function fetchCallLogs() {
    try {
      const { data, error } = await supabase
        .from("call_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      setCalls(data || []);
    } catch (error) {
      console.error("Error fetching call logs:", error);
    } finally {
      setLoading(false);
    }
  }

  function formatDuration(seconds: number) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading call logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Call Logs</h1>
          <p className="text-sm text-gray-600 mt-1">Track all customer and lead calls</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Recent Calls</h2>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {calls.map((call) => (
              <div key={call.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div className="flex items-center gap-4 flex-1">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Phone className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{call.phone}</p>
                    <p className="text-sm text-gray-600">{call.notes || "No notes"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    {call.duration_seconds ? formatDuration(call.duration_seconds) : "N/A"}
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(call.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {calls.length === 0 && (
            <div className="text-center py-12">
              <Phone className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Call Logs</h3>
              <p className="text-gray-600">Call logs will appear here once recorded</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
