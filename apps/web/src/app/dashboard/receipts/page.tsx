"use client";

import { useEffect, useState } from "react";
import { supabase } from "@acrely/services";
import { Button } from "@acrely/ui";
import { FileText, Search, Download, Eye, Trash2, Calendar, User, MapPin } from "lucide-react";
import { ReceiptModal } from "@/components/receipts/ReceiptModal";
import toast, { Toaster } from "react-hot-toast";

interface Receipt {
  id: string;
  receipt_number: string;
  amount: number;
  payment_date: string;
  file_url: string | null;
  estate_name: string | null;
  plot_reference: string | null;
  payment_method: string | null;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  payment_reference: string;
  payment_status: string;
  generated_by_name: string | null;
  created_at: string;
}

interface ReceiptData {
  receipt_number: string;
  file_url: string | null;
  amount: number;
  payment_date: string;
  customer_name: string;
  estate_name: string | null;
  plot_reference: string | null;
  payment_method: string | null;
  payment_reference: string;
}

export default function ReceiptsPage() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptData | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  useEffect(() => {
    fetchReceipts();
  }, []);

  async function fetchReceipts() {
    try {
      const { data, error } = await supabase
        .from("receipt_details")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setReceipts(data || []);
    } catch (error) {
      console.error("Error fetching receipts:", error);
      toast.error("Failed to fetch receipts");
    } finally {
      setLoading(false);
    }
  }

  const filteredReceipts = receipts.filter((receipt) => {
    const matchesSearch =
      receipt.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      receipt.receipt_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      receipt.plot_reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      receipt.estate_name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDate = dateFilter
      ? new Date(receipt.payment_date).toISOString().split("T")[0] === dateFilter
      : true;

    return matchesSearch && matchesDate;
  });

  const handleViewReceipt = (receipt: Receipt) => {
    setSelectedReceipt({
      receipt_number: receipt.receipt_number,
      file_url: receipt.file_url,
      amount: receipt.amount,
      payment_date: receipt.payment_date,
      customer_name: receipt.customer_name,
      estate_name: receipt.estate_name,
      plot_reference: receipt.plot_reference,
      payment_method: receipt.payment_method,
      payment_reference: receipt.payment_reference,
    });
    setIsReceiptModalOpen(true);
  };

  const handleDeleteReceipt = async (receiptId: string, receiptNumber: string) => {
    if (!confirm(`Are you sure you want to delete receipt ${receiptNumber}? This action cannot be undone.`)) {
      return;
    }

    try {
      const { error } = await supabase.from("receipts").delete().eq("id", receiptId);

      if (error) throw error;

      toast.success("Receipt deleted successfully");
      fetchReceipts();
    } catch (error) {
      console.error("Error deleting receipt:", error);
      toast.error("Failed to delete receipt");
    }
  };

  const handleDownloadReceipt = (fileUrl: string | null, receiptNumber: string) => {
    if (!fileUrl) {
      toast.error("Receipt file not available");
      return;
    }
    window.open(fileUrl, "_blank");
  };

  const getTotalAmount = () => {
    return filteredReceipts.reduce((sum, receipt) => sum + receipt.amount, 0);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading receipts...</div>;
  }

  return (
    <>
      <Toaster position="top-right" />
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Receipt Management</h1>
            <p className="text-gray-600 mt-1">View and manage payment receipts</p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
            <p className="text-sm text-blue-700 font-medium">Total Receipts</p>
            <p className="text-2xl font-bold text-blue-900">{filteredReceipts.length}</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-3 rounded-lg">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Amount</p>
                <p className="text-2xl font-bold text-gray-900">₦{getTotalAmount().toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-gray-900">
                  {
                    filteredReceipts.filter(
                      (r) =>
                        new Date(r.payment_date).getMonth() === new Date().getMonth() &&
                        new Date(r.payment_date).getFullYear() === new Date().getFullYear()
                    ).length
                  }
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 p-3 rounded-lg">
                <User className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Unique Customers</p>
                <p className="text-2xl font-bold text-gray-900">
                  {new Set(filteredReceipts.map((r) => r.customer_name)).size}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by customer, receipt #, plot, or estate..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          {(searchTerm || dateFilter) && (
            <button
              onClick={() => {
                setSearchTerm("");
                setDateFilter("");
              }}
              className="mt-3 text-sm text-blue-600 hover:text-blue-700"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Receipts Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Receipt #</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plot</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredReceipts.map((receipt) => (
                  <tr key={receipt.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-blue-600" />
                        <span className="font-mono font-medium text-gray-900">{receipt.receipt_number}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div>
                        <p className="font-medium text-gray-900">{receipt.customer_name}</p>
                        <p className="text-xs text-gray-500">{receipt.customer_phone}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-gray-400" />
                        <span>
                          {receipt.plot_reference} - {receipt.estate_name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                      ₦{receipt.amount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(receipt.payment_date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                        {receipt.payment_method?.replace("_", " ").toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleViewReceipt(receipt)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Receipt"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {receipt.file_url && (
                          <button
                            onClick={() => handleDownloadReceipt(receipt.file_url, receipt.receipt_number)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Download Receipt"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteReceipt(receipt.id, receipt.receipt_number)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Receipt"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredReceipts.length === 0 && (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 font-medium">No receipts found</p>
              <p className="text-sm text-gray-400 mt-1">
                {searchTerm || dateFilter ? "Try adjusting your filters" : "Receipts will appear here once payments are made"}
              </p>
            </div>
          )}
        </div>

        <ReceiptModal
          isOpen={isReceiptModalOpen}
          onClose={() => {
            setIsReceiptModalOpen(false);
            setSelectedReceipt(null);
          }}
          receipt={selectedReceipt}
        />
      </div>
    </>
  );
}
