'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@acrely/services';
import { format } from 'date-fns';

interface FieldReport {
  id: string;
  agent_id: string;
  report_date: string;
  total_visits: number;
  successful_visits: number;
  payments_collected: number;
  leads_generated: number;
  notes: string | null;
  status: 'pending' | 'approved' | 'flagged' | 'rejected';
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_notes: string | null;
  created_at: string;
  agent: {
    full_name: string;
    email: string;
  };
}

interface FilterState {
  agent: string;
  status: string;
  startDate: string;
  endDate: string;
}

export default function FieldReportsPage() {
  const [reports, setReports] = useState<FieldReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<FieldReport | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewAction, setReviewAction] = useState<'approve' | 'flag' | 'reject'>('approve');

  const [filters, setFilters] = useState<FilterState>({
    agent: '',
    status: 'all',
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchReports();
  }, [filters]);

  const fetchReports = async () => {
    try {
      setLoading(true);

      let query = supabase
        .from('field_reports')
        .select(`
          *,
          agent:users!field_reports_agent_id_fkey(full_name, email)
        `)
        .gte('report_date', filters.startDate)
        .lte('report_date', filters.endDate)
        .order('report_date', { ascending: false });

      if (filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      if (filters.agent) {
        query = query.eq('agent_id', filters.agent);
      }

      const { data, error } = await query;

      if (error) throw error;

      setReports(data || []);
    } catch (error) {
      console.error('Error fetching field reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const openReviewModal = (report: FieldReport, action: typeof reviewAction) => {
    setSelectedReport(report);
    setReviewAction(action);
    setReviewNotes('');
    setShowReviewModal(true);
  };

  const handleReview = async () => {
    if (!selectedReport) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const updateData: Record<string, string | null> = {
        status: reviewAction === 'approve' ? 'approved' : reviewAction === 'flag' ? 'flagged' : 'rejected',
        reviewed_by: user?.id || null,
        reviewed_at: new Date().toISOString(),
        review_notes: reviewNotes.trim() || null,
      };

      const { error } = await supabase
        .from('field_reports')
        .update(updateData as never)
        .eq('id', selectedReport.id);

      if (error) throw error;

      // Refresh reports
      fetchReports();
      setShowReviewModal(false);
      setSelectedReport(null);
    } catch (error) {
      console.error('Error reviewing report:', error);
      alert('Failed to review report. Please try again.');
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      flagged: 'bg-red-100 text-red-800',
      rejected: 'bg-gray-100 text-gray-800',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status] || ''}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const calculateSuccessRate = (report: FieldReport) => {
    if (report.total_visits === 0) return '0';
    return ((report.successful_visits / report.total_visits) * 100).toFixed(0);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Field Reports Management</h1>
        <p className="text-gray-600 mt-2">Review and manage agent field activity reports</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="all">All Reports</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="flagged">Flagged</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
            <input
              type="date"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
            <input
              type="date"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={fetchReports}
              className="w-full bg-green-600 text-white rounded-lg px-4 py-2 hover:bg-green-700 transition"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-2xl font-bold text-gray-900">{reports.length}</div>
          <div className="text-sm text-gray-600">Total Reports</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-2xl font-bold text-yellow-600">
            {reports.filter((r) => r.status === 'pending').length}
          </div>
          <div className="text-sm text-gray-600">Pending Review</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-2xl font-bold text-green-600">
            {reports.filter((r) => r.status === 'approved').length}
          </div>
          <div className="text-sm text-gray-600">Approved</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-2xl font-bold text-red-600">
            {reports.filter((r) => r.status === 'flagged').length}
          </div>
          <div className="text-sm text-gray-600">Flagged</div>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Agent</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Visits</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Success Rate</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payments</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Leads</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    Loading reports...
                  </td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    No reports found
                  </td>
                </tr>
              ) : (
                reports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {format(new Date(report.report_date), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{report.agent.full_name}</div>
                      <div className="text-sm text-gray-500">{report.agent.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {report.successful_visits} / {report.total_visits}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div
                            className={`h-2 rounded-full ${
                              parseInt(calculateSuccessRate(report)) >= 70
                                ? 'bg-green-500'
                                : parseInt(calculateSuccessRate(report)) >= 50
                                ? 'bg-yellow-500'
                                : 'bg-red-500'
                            }`}
                            style={{ width: `${calculateSuccessRate(report)}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-900">{calculateSuccessRate(report)}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₦{report.payments_collected.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {report.leads_generated}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(report.status)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {report.status === 'pending' ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => openReviewModal(report, 'approve')}
                            className="text-green-600 hover:text-green-800 font-medium"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => openReviewModal(report, 'flag')}
                            className="text-red-600 hover:text-red-800 font-medium"
                          >
                            Flag
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setSelectedReport(report)}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          View Details
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">
              {reviewAction === 'approve' ? 'Approve' : reviewAction === 'flag' ? 'Flag' : 'Reject'} Report
            </h2>
            <p className="text-gray-600 mb-4">
              Agent: <strong>{selectedReport.agent.full_name}</strong>
              <br />
              Date: <strong>{format(new Date(selectedReport.report_date), 'MMM dd, yyyy')}</strong>
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Review Notes {reviewAction !== 'approve' && <span className="text-red-500">*</span>}
              </label>
              <textarea
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500"
                rows={4}
                placeholder="Add your review notes here..."
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowReviewModal(false)}
                className="flex-1 bg-gray-200 text-gray-800 rounded-lg px-4 py-2 hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleReview}
                disabled={reviewAction !== 'approve' && !reviewNotes.trim()}
                className={`flex-1 rounded-lg px-4 py-2 text-white ${
                  reviewAction === 'approve'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {reviewAction === 'approve' ? 'Approve' : reviewAction === 'flag' ? 'Flag' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
