"use client";

import { X, Download, FileText, Calendar, CreditCard, User, MapPin } from "lucide-react";
import { Button } from "@acrely/ui";

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  receipt: {
    receipt_number: string;
    file_url: string | null;
    amount: number;
    payment_date: string;
    customer_name: string;
    estate_name: string | null;
    plot_reference: string | null;
    payment_method: string | null;
    payment_reference: string;
  } | null;
}

export function ReceiptModal({ isOpen, onClose, receipt }: ReceiptModalProps) {
  if (!isOpen || !receipt) return null;

  const handleDownload = () => {
    if (receipt.file_url) {
      window.open(receipt.file_url, "_blank");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6 text-white" />
            <div>
              <h2 className="text-xl font-semibold text-white">Payment Receipt</h2>
              <p className="text-blue-100 text-sm">{receipt.receipt_number}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {/* Receipt Preview or Details */}
          {receipt.file_url ? (
            <div className="space-y-4">
              {/* Receipt Details Card */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Customer</p>
                    <p className="font-semibold text-gray-900">{receipt.customer_name}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Plot</p>
                    <p className="font-semibold text-gray-900">
                      {receipt.plot_reference} - {receipt.estate_name}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Payment Date</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(receipt.payment_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CreditCard className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Payment Method</p>
                    <p className="font-semibold text-gray-900">
                      {receipt.payment_method?.replace("_", " ").toUpperCase()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Amount Display */}
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg p-6 text-center">
                <p className="text-blue-100 text-sm mb-2">Amount Paid</p>
                <p className="text-4xl font-bold text-white">
                  ₦{receipt.amount.toLocaleString()}
                </p>
                <p className="text-blue-100 text-xs mt-2">Ref: {receipt.payment_reference}</p>
              </div>

              {/* Receipt Iframe Preview */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <iframe
                  src={receipt.file_url}
                  className="w-full h-[500px]"
                  title="Receipt Preview"
                />
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">Receipt is being generated...</p>
              <p className="text-sm text-gray-400 mt-2">Please check back in a moment</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t">
          <p className="text-sm text-gray-600">
            Generated by Pinnacle Builders Homes & Properties
          </p>
          <div className="flex gap-3">
            <Button
              onClick={onClose}
              className="bg-gray-200 text-gray-700 hover:bg-gray-300"
            >
              Close
            </Button>
            {receipt.file_url && (
              <Button
                onClick={handleDownload}
                className="bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download Receipt
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
