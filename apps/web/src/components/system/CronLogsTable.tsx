'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@acrely/services';
import { Card, Table } from '@acrely/ui';

interface CronLog {
  id: string;
  job_name: string;
  executed_at: string;
  duration_ms: number;
  status: 'success' | 'failed' | 'warning';
  error_message?: string;
  metadata?: any;
}

interface CronSummary {
  job_name: string;
  total_executions: number;
  successful: number;
  failed: number;
  warnings: number;
  avg_duration_ms: number;
  last_execution: string;
  success_rate: number;
}

export default function CronLogsTable() {
  const [logs, setLogs] = useState<CronLog[]>([]);
  const [summary, setSummary] = useState<CronSummary[]>([]);
  const [view, setView] = useState<'logs' | 'summary'>('summary');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCronData();
    const interval = setInterval(fetchCronData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchCronData = async () => {
    try {
      // Fetch recent logs
      const { data: logsData } = await supabase
        .from('cron_logs')
        .select('*')
        .order('executed_at', { ascending: false })
        .limit(50);

      if (logsData) {
        setLogs(logsData);
      }

      // Fetch summary
      const { data: summaryData } = await supabase
        .from('cron_summary')
        .select('*');

      if (summaryData) {
        setSummary(summaryData);
      }
    } catch (error) {
      console.error('Error fetching cron data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      success: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      warning: 'bg-yellow-100 text-yellow-800',
    };

    const icons = {
      success: '✅',
      failed: '❌',
      warning: '⚠️',
    };

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        <span>{icons[status as keyof typeof icons]}</span>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      {/* Header with View Toggle */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Cron Jobs</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setView('summary')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              view === 'summary'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Summary
          </button>
          <button
            onClick={() => setView('logs')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              view === 'logs'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Recent Logs
          </button>
        </div>
      </div>

      {/* Summary View */}
      {view === 'summary' && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Job Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Runs
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Success Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Run
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {summary.map((job) => (
                <tr key={job.job_name} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {job.job_name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {job.total_executions}
                      <div className="text-xs text-gray-500">
                        ✅ {job.successful} | ❌ {job.failed} | ⚠️ {job.warnings}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div
                          className={`h-2 rounded-full ${
                            job.success_rate >= 95 ? 'bg-green-500' :
                            job.success_rate >= 80 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${job.success_rate}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {job.success_rate}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {job.avg_duration_ms.toFixed(0)} ms
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(job.last_execution).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {summary.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No cron job data available
            </div>
          )}
        </div>
      )}

      {/* Logs View */}
      {view === 'logs' && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Executed At
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Job Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(log.executed_at).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {log.job_name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(log.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {log.duration_ms} ms
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {log.error_message ? (
                      <div className="text-red-600 max-w-md truncate" title={log.error_message}>
                        {log.error_message}
                      </div>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {logs.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No recent cron logs
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
