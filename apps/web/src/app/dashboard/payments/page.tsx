"use client";

import { useEffect, useState } from "react";
import { supabase } from "@acrely/services";
import { Button } from "@acrely/ui";
import { Plus, Search, FileText, Eye } from "lucide-react";
import { PaymentForm } from "@/components/forms/PaymentForm";
import { ReceiptModal } from "@/components/receipts/ReceiptModal";
import toast, { Toaster } from "react-hot-toast";

interface Payment {
  id: string;
  amount: number;
  payment_method: string;
  payment_date: string;
  reference: string;
  status: string;
  receipt_url: string | null;
  allocation: {
    customer: {
      full_name: string;
    };
    plot: {
      plot_number: string;
      estate_name: string;
      estate_code: string;
    };
  };
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

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptData | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  useEffect(() => {
    fetchPayments();
  }, []);

  async function fetchPayments() {
    try {
      const { data, error } = await supabase
        .from("payments")
        .select(
          `
          *,
          allocation:allocations(
            customer:customers(full_name),
            plot:plots(plot_number, estate_name, estate_code)
          )
        `
        )
        .order("payment_date", { ascending: false });

      if (error) throw error;
      setPayments(data || []);
    } catch (error) {
      console.error("Error fetching payments:", error);
      toast.error("Failed to fetch payments");
    } finally {
      setLoading(false);
    }
  }

  const filteredPayments = payments.filter(
    (payment) =>
      payment.allocation?.customer?.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.allocation?.plot?.plot_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const styles = {
      confirmed: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      failed: "bg-red-100 text-red-800",
    };
    return styles[status as keyof typeof styles] || "bg-gray-100 text-gray-800";
  };

  const getMethodBadge = (method: string) => {
    const labels = {
      cash: "Cash",
      bank_transfer: "Bank Transfer",
      card: "Card",
      cheque: "Cheque",
    };
    return labels[method as keyof typeof labels] || method;
  };

  const handleViewReceipt = async (payment: Payment) => {
    try {
      // Fetch receipt details from receipts table
      const { data: receipt, error } = await supabase
        .from("receipts")
        .select("*")
        .eq("payment_id", payment.id)
        .single();

      if (error) {
        // If no receipt found, try to generate one
        if (error.code === "PGRST116") {
          toast.loading("Generating receipt...");
          
          // Call generate-receipt Edge Function
          const { data: genData, error: genError } = await supabase.functions.invoke(
            "generate-receipt",
            {
              body: { payment_id: payment.id },
            }
          );

          if (genError) {
            toast.dismiss();
            toast.error("Failed to generate receipt");
            return;
          }

          // Fetch the newly created receipt
          const { data: newReceipt, error: fetchError } = await supabase
            .from("receipts")
            .select("*")
            .eq("payment_id", payment.id)
            .single();

          if (fetchError) {
            toast.dismiss();
            toast.error("Receipt generated but could not be retrieved");
            return;
          }

          toast.dismiss();
          toast.success("Receipt generated successfully!");
          
          setSelectedReceipt({
            receipt_number: newReceipt.receipt_number,
            file_url: newReceipt.file_url,
            amount: newReceipt.amount,
            payment_date: newReceipt.payment_date,
            customer_name: newReceipt.metadata?.customer_name || payment.allocation.customer.full_name,
            estate_name: newReceipt.estate_name,
            plot_reference: newReceipt.plot_reference,
            payment_method: newReceipt.payment_method,
            payment_reference: payment.reference,
          });
        } else {
          throw error;
        }
      } else {
        // Receipt exists, display it
        setSelectedReceipt({
          receipt_number: receipt.receipt_number,
          file_url: receipt.file_url,
          amount: receipt.amount,
          payment_date: receipt.payment_date,
          customer_name: receipt.metadata?.customer_name || payment.allocation.customer.full_name,
          estate_name: receipt.estate_name,
          plot_reference: receipt.plot_reference,
          payment_method: receipt.payment_method,
          payment_reference: payment.reference,
        });
      }

      setIsReceiptModalOpen(true);
    } catch (error) {
      console.error("Error fetching receipt:", error);
      toast.error("Failed to fetch receipt");
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading payments...</div>;
  }

  return (
    <>
      <Toaster position="top-right" />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Payments</h1>
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="w-5 h-5 mr-2" />
            Record Payment
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by customer name, reference, or plot number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plot</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reference</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(payment.payment_date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {payment.allocation?.customer?.full_name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {payment.allocation?.plot?.estate_name} - {payment.allocation?.plot?.plot_number}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">₦{payment.amount.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                        {getMethodBadge(payment.payment_method)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 font-mono">{payment.reference}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(payment.status)}`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-center">
                      {payment.status === "confirmed" ? (
                        <button
                          className="inline-flex items-center gap-2 px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Receipt"
                          onClick={() => handleViewReceipt(payment)}
                        >
                          <Eye className="w-4 h-4" />
                          <span className="text-xs font-medium">View</span>
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredPayments.length === 0 && (
            <div className="text-center py-12 text-gray-500">No payments found</div>
          )}
        </div>

        <PaymentForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} onSuccess={fetchPayments} />
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
