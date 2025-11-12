'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@acrely/services';
import { Card } from '@acrely/ui';

interface HealthMetrics {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  database: {
    connected: boolean;
    response_time_ms: number;
  };
  storage: {
    accessible: boolean;
  };
  metrics: {
    error_count_24h: number;
    uptime_percentage: number;
    failed_cron_jobs_24h: number;
  };
  warnings: string[];
}

interface BackupInfo {
  backup_file: string;
  backup_size_mb: number;
  created_at: string;
  status: string;
}

export default function HealthOverview() {
  const [health, setHealth] = useState<HealthMetrics | null>(null);
  const [lastBackup, setLastBackup] = useState<BackupInfo | null>(null);
  const [storageUsage, setStorageUsage] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHealthData();
    const interval = setInterval(fetchHealthData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const fetchHealthData = async () => {
    try {
      // Fetch latest health check
      const { data: healthData } = await supabase
        .from('system_health')
        .select('*')
        .order('checked_at', { ascending: false })
        .limit(1)
        .single();

      if (healthData) {
        const metrics: HealthMetrics = {
          status: healthData.metadata?.status || 'healthy',
          timestamp: healthData.checked_at,
          database: {
            connected: true,
            response_time_ms: healthData.database_response_ms,
          },
          storage: {
            accessible: healthData.storage_accessible,
          },
          metrics: {
            error_count_24h: healthData.error_count,
            uptime_percentage: healthData.uptime_percentage,
            failed_cron_jobs_24h: healthData.metadata?.failed_cron_jobs || 0,
          },
          warnings: healthData.metadata?.warnings || [],
        };
        setHealth(metrics);
      }

      // Fetch last backup
      const { data: backupData } = await supabase
        .from('backup_history')
        .select('*')
        .eq('status', 'success')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (backupData) {
        setLastBackup(backupData);
      }

      // Fetch storage usage (simplified)
      const { data: storageData } = await supabase.rpc('get_database_stats');
      if (storageData && storageData.length > 0) {
        const totalSize = storageData[0].total_size_mb;
        setStorageUsage(totalSize);
      }

    } catch (error) {
      console.error('Error fetching health data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <span className="text-2xl">✅</span>;
      case 'degraded':
        return <span className="text-2xl">⚠️</span>;
      case 'unhealthy':
        return <span className="text-2xl">❌</span>;
      default:
        return <span className="text-2xl">❓</span>;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 bg-green-50';
      case 'degraded':
        return 'text-yellow-600 bg-yellow-50';
      case 'unhealthy':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-32 bg-gray-200 rounded"></div>
        <div className="h-32 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Status Card */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">System Status</h2>
            <p className="text-sm text-gray-500">
              Last updated: {health ? new Date(health.timestamp).toLocaleString() : 'N/A'}
            </p>
          </div>
          <div className={`flex items-center gap-3 px-6 py-3 rounded-lg ${health ? getStatusColor(health.status) : 'bg-gray-50'}`}>
            {getStatusIcon(health?.status || 'healthy')}
            <span className="text-xl font-semibold capitalize">
              {health?.status || 'Unknown'}
            </span>
          </div>
        </div>

        {/* Warnings */}
        {health && health.warnings.length > 0 && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Warnings:</h3>
            <ul className="list-disc list-inside space-y-1">
              {health.warnings.map((warning, idx) => (
                <li key={idx} className="text-yellow-700 text-sm">{warning}</li>
              ))}
            </ul>
          </div>
        )}
      </Card>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Database Response Time */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Database Response</p>
              <p className="text-3xl font-bold text-gray-900">
                {health?.database.response_time_ms || 0}
                <span className="text-sm text-gray-500 ml-1">ms</span>
              </p>
            </div>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              (health?.database.response_time_ms || 0) < 500 ? 'bg-green-100' : 'bg-yellow-100'
            }`}>
              <span className="text-2xl">🗄️</span>
            </div>
          </div>
        </Card>

        {/* Uptime Percentage */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Uptime (24h)</p>
              <p className="text-3xl font-bold text-gray-900">
                {health?.metrics.uptime_percentage.toFixed(2) || 100}
                <span className="text-sm text-gray-500 ml-1">%</span>
              </p>
            </div>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              (health?.metrics.uptime_percentage || 100) >= 99 ? 'bg-green-100' : 'bg-red-100'
            }`}>
              <span className="text-2xl">⏱️</span>
            </div>
          </div>
        </Card>

        {/* Storage Usage */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Storage Used</p>
              <p className="text-3xl font-bold text-gray-900">
                {storageUsage.toFixed(0)}
                <span className="text-sm text-gray-500 ml-1">MB</span>
              </p>
            </div>
            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-blue-100">
              <span className="text-2xl">💾</span>
            </div>
          </div>
        </Card>

        {/* Last Backup */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Last Backup</p>
              <p className="text-lg font-bold text-gray-900">
                {lastBackup
                  ? new Date(lastBackup.created_at).toLocaleDateString()
                  : 'Never'}
              </p>
              {lastBackup && (
                <p className="text-xs text-gray-500">
                  {lastBackup.backup_size_mb.toFixed(2)} MB
                </p>
              )}
            </div>
            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-purple-100">
              <span className="text-2xl">💿</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Error Count */}
      {health && health.metrics.error_count_24h > 0 && (
        <Card className="p-6 bg-red-50 border border-red-200">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🚨</span>
            <div>
              <h3 className="font-semibold text-red-800">
                {health.metrics.error_count_24h} Error(s) in Last 24 Hours
              </h3>
              <p className="text-sm text-red-600">
                Check the Audit Logs for details
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
