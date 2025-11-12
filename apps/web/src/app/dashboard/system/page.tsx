'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@acrely/services';
import HealthOverview from '@/components/system/HealthOverview';
import CronLogsTable from '@/components/system/CronLogsTable';

export default function SystemDashboardPage() {
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string>('');

  useEffect(() => {
    checkAuthorization();
  }, []);

  const checkAuthorization = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = '/';
        return;
      }

      // Fetch user profile to check role
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile && (profile.role === 'SysAdmin' || profile.role === 'CEO')) {
        setAuthorized(true);
        setUserRole(profile.role);
      } else {
        // Redirect unauthorized users
        window.location.href = '/dashboard';
      }
    } catch (error) {
      console.error('Authorization check failed:', error);
      window.location.href = '/';
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!authorized) {
    return null; // Will redirect
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          System Maintenance Dashboard
        </h1>
        <p className="text-gray-600">
          Monitor system health, cron jobs, and performance metrics
        </p>
        <div className="mt-2 text-sm text-gray-500">
          Logged in as: <span className="font-semibold">{userRole}</span>
        </div>
      </div>

      {/* Health Overview Section */}
      <div className="mb-8">
        <HealthOverview />
      </div>

      {/* Cron Logs Section */}
      <div className="mb-8">
        <CronLogsTable />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={async () => {
            if (confirm('Trigger manual health check?')) {
              const { data } = await supabase.functions.invoke('system-health-check');
              alert('Health check triggered. Check logs for results.');
            }
          }}
          className="p-6 bg-blue-50 border-2 border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
        >
          <div className="text-3xl mb-2">🏥</div>
          <h3 className="font-semibold text-blue-900">Run Health Check</h3>
          <p className="text-sm text-blue-600 mt-1">Manually trigger system health check</p>
        </button>

        <button
          onClick={async () => {
            if (confirm('Create database backup now?')) {
              const { data } = await supabase.functions.invoke('backup-database');
              alert('Backup initiated. Check backup history for status.');
            }
          }}
          className="p-6 bg-purple-50 border-2 border-purple-200 rounded-lg hover:bg-purple-100 transition-colors"
        >
          <div className="text-3xl mb-2">💿</div>
          <h3 className="font-semibold text-purple-900">Create Backup</h3>
          <p className="text-sm text-purple-600 mt-1">Manually create database backup</p>
        </button>

        <button
          onClick={async () => {
            if (confirm('Run storage cleanup?')) {
              const { data } = await supabase.functions.invoke('storage-cleanup');
              alert('Storage cleanup initiated. Check cron logs for results.');
            }
          }}
          className="p-6 bg-green-50 border-2 border-green-200 rounded-lg hover:bg-green-100 transition-colors"
        >
          <div className="text-3xl mb-2">🧹</div>
          <h3 className="font-semibold text-green-900">Clean Storage</h3>
          <p className="text-sm text-green-600 mt-1">Remove old archived receipts</p>
        </button>
      </div>

      {/* Footer */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-sm text-gray-600 text-center">
          🛡️ <strong>Pinnacle Builders Homes & Properties</strong> — System Maintenance v1.8.0
        </p>
      </div>
    </div>
  );
}
