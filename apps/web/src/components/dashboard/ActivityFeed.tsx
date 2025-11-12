"use client";

import { useEffect, useState } from "react";
import { supabase } from "@acrely/services";
import { Activity, ChevronRight } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import Link from "next/link";

interface RecentActivity {
  id: string;
  created_at: string;
  user_name: string;
  user_role: string;
  action: string;
  entity: string;
  description: string;
}

interface Props {
  limit?: number;
  autoRefresh?: boolean;
}

export function ActivityFeed({ limit = 5, autoRefresh = true }: Props) {
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRecentActivity = async () => {
    try {
      const { data, error } = await supabase
        .rpc("get_recent_audit_activity", { limit_count: limit });

      if (error) throw error;

      setActivities(data || []);
    } catch (error) {
      console.error("Error fetching recent activity:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecentActivity();

    if (autoRefresh) {
      const interval = setInterval(fetchRecentActivity, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [limit, autoRefresh]);

  const getActionColor = (action: string) => {
    switch (action) {
      case "INSERT":
        return "text-green-600 bg-green-50";
      case "UPDATE":
        return "text-blue-600 bg-blue-50";
      case "DELETE":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case "INSERT":
        return "Created";
      case "UPDATE":
        return "Updated";
      case "DELETE":
        return "Deleted";
      default:
        return action;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Activity className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Recent Activity</h3>
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-100 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Activity className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Recent Activity</h3>
        </div>
        {autoRefresh && (
          <span className="flex items-center gap-1.5 text-xs text-gray-500">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Live
          </span>
        )}
      </div>

      {activities.length === 0 ? (
        <div className="text-center py-8">
          <Activity className="w-12 h-12 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-500">No recent activity</p>
        </div>
      ) : (
        <div className="space-y-3">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className={`px-2 py-1 rounded text-xs font-medium ${getActionColor(activity.action)}`}>
                {getActionLabel(activity.action)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 truncate">
                  {activity.description}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-500">
                    {activity.user_name}
                  </span>
                  <span className="text-xs text-gray-400">•</span>
                  <span className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Link
        href="/dashboard/audit"
        className="mt-4 flex items-center justify-center gap-2 text-sm text-primary-600 hover:text-primary-700 font-medium"
      >
        View all activity
        <ChevronRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
