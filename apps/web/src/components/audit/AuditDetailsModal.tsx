"use client";

import { Modal } from "@repo/ui/components/Modal";
import { format } from "date-fns";
import { useState } from "react";
import { X, Calendar, User, Activity, FileText, ChevronRight } from "lucide-react";

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

interface Props {
  log: AuditLog | null;
  isOpen: boolean;
  onClose: () => void;
}

export function AuditDetailsModal({ log, isOpen, onClose }: Props) {
  const [activeTab, setActiveTab] = useState<"overview" | "changes" | "metadata">("overview");

  if (!log) return null;

  const getChangedFields = () => {
    if (!log.old_data || !log.new_data) return [];
    
    const changes: { field: string; oldValue: any; newValue: any }[] = [];
    const oldKeys = Object.keys(log.old_data);
    const newKeys = Object.keys(log.new_data);
    const allKeys = [...new Set([...oldKeys, ...newKeys])];

    allKeys.forEach(key => {
      const oldVal = log.old_data?.[key];
      const newVal = log.new_data?.[key];
      
      if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
        changes.push({
          field: key,
          oldValue: oldVal,
          newValue: newVal
        });
      }
    });

    return changes;
  };

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return "—";
    if (typeof value === "boolean") return value ? "Yes" : "No";
    if (typeof value === "object") return JSON.stringify(value, null, 2);
    return String(value);
  };

  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case "INSERT": return "bg-green-100 text-green-700 border-green-200";
      case "UPDATE": return "bg-blue-100 text-blue-700 border-blue-200";
      case "DELETE": return "bg-red-100 text-red-700 border-red-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const changes = getChangedFields();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Audit Log Details</h2>
            <p className="text-sm text-gray-500">ID: {log.id}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
              activeTab === "overview"
                ? "border-primary-600 text-primary-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            Overview
          </button>
          {log.action === "UPDATE" && changes.length > 0 && (
            <button
              onClick={() => setActiveTab("changes")}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                activeTab === "changes"
                  ? "border-primary-600 text-primary-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              Changes ({changes.length})
            </button>
          )}
          {log.metadata && (
            <button
              onClick={() => setActiveTab("metadata")}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                activeTab === "metadata"
                  ? "border-primary-600 text-primary-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              Metadata
            </button>
          )}
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Action Badge */}
            <div>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getActionBadgeColor(log.action)}`}>
                {log.action}
              </span>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  <span>Timestamp</span>
                </div>
                <p className="text-sm font-medium text-gray-900">
                  {format(new Date(log.created_at), "PPpp")}
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <User className="w-4 h-4" />
                  <span>User</span>
                </div>
                <p className="text-sm font-medium text-gray-900">{log.user_name}</p>
                <p className="text-xs text-gray-500">{log.user_email}</p>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                  {log.user_role}
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Activity className="w-4 h-4" />
                  <span>Entity</span>
                </div>
                <p className="text-sm font-medium text-gray-900 capitalize">{log.entity}</p>
                <p className="text-xs text-gray-500 font-mono">{log.entity_id}</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <FileText className="w-4 h-4" />
                  <span>Description</span>
                </div>
                <p className="text-sm font-medium text-gray-900">{log.description}</p>
              </div>
            </div>

            {/* Data Preview */}
            {(log.old_data || log.new_data) && (
              <div className="space-y-4">
                {log.old_data && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Previous State</h3>
                    <pre className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs overflow-x-auto">
                      {JSON.stringify(log.old_data, null, 2)}
                    </pre>
                  </div>
                )}
                {log.new_data && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">New State</h3>
                    <pre className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs overflow-x-auto">
                      {JSON.stringify(log.new_data, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === "changes" && (
          <div className="space-y-3">
            {changes.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No changes detected</p>
            ) : (
              changes.map((change, idx) => (
                <div key={idx} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-3 capitalize">
                    {change.field.replace(/_/g, " ")}
                  </h3>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-xs text-red-600 font-medium mb-1">Old Value</p>
                      <p className="text-sm text-gray-900 break-words">
                        {formatValue(change.oldValue)}
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <div className="flex-1 bg-green-50 border border-green-200 rounded-lg p-3">
                      <p className="text-xs text-green-600 font-medium mb-1">New Value</p>
                      <p className="text-sm text-gray-900 break-words">
                        {formatValue(change.newValue)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "metadata" && (
          <div>
            <pre className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-xs overflow-x-auto">
              {JSON.stringify(log.metadata, null, 2)}
            </pre>
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}
