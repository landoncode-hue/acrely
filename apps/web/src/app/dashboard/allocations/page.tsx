"use client";

import { useEffect, useState } from "react";
import { supabase } from "@acrely/services";
import { Button } from "@acrely/ui";
import { Plus, Search } from "lucide-react";
import { AllocationForm } from "@/components/forms/AllocationForm";
import toast, { Toaster } from "react-hot-toast";

interface Allocation {
  id: string;
  allocation_date: string;
  total_amount: number;
  amount_paid: number;
  balance: number;
  payment_plan: string;
  status: string;
  customer: {
    full_name: string;
    phone: string;
  };
  plot: {
    plot_number: string;
    estate_name: string;
  };
  agent: {
    full_name: string;
  };
}

export default function AllocationsPage() {
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    fetchAllocations();
  }, []);

  async function fetchAllocations() {
    try {
      const { data, error } = await supabase
        .from("allocations")
        .select(
          `
          *,
          customer:customers(full_name, phone),
          plot:plots(plot_number, estate_name),
          agent:users!allocations_agent_id_fkey(full_name)
        `
        )
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAllocations(data || []);
    } catch (error) {
      console.error("Error fetching allocations:", error);
      toast.error("Failed to fetch allocations");
    } finally {
      setLoading(false);
    }
  }

  const filteredAllocations = allocations.filter(
    (alloc) =>
      alloc.customer?.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alloc.plot?.plot_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alloc.plot?.estate_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const styles = {
      active: "bg-green-100 text-green-800",
      completed: "bg-blue-100 text-blue-800",
      defaulted: "bg-red-100 text-red-800",
      cancelled: "bg-gray-100 text-gray-800",
    };
    return styles[status as keyof typeof styles] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading allocations...</div>;
  }

  return (
    <>
      <Toaster position="top-right" />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Plot Allocations</h1>
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="w-5 h-5 mr-2" />
            New Allocation
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by customer name, plot number, or estate..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plot</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estate</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Agent</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paid</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Balance</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredAllocations.map((allocation) => (
                  <tr key={allocation.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {allocation.customer?.full_name}
                      <div className="text-xs text-gray-500">{allocation.customer?.phone}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{allocation.plot?.plot_number}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{allocation.plot?.estate_name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{allocation.agent?.full_name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">₦{allocation.total_amount.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">₦{allocation.amount_paid.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      ₦{allocation.balance.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(allocation.status)}`}>
                        {allocation.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(allocation.allocation_date).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredAllocations.length === 0 && (
            <div className="text-center py-12 text-gray-500">No allocations found</div>
          )}
        </div>

        <AllocationForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} onSuccess={fetchAllocations} />
      </div>
    </>
  );
}
