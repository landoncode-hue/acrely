"use client";

import { useState, useEffect } from "react";
import { Modal, Input, Button } from "@acrely/ui";
import { supabase } from "@acrely/services";
import toast from "react-hot-toast";

interface PaymentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function PaymentForm({ isOpen, onClose, onSuccess }: PaymentFormProps) {
  const [loading, setLoading] = useState(false);
  const [allocations, setAllocations] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    allocation_id: "",
    amount: "",
    payment_method: "bank_transfer",
    payment_date: new Date().toISOString().split("T")[0],
    reference: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      fetchActiveAllocations();
      // Generate reference number
      setFormData((prev) => ({
        ...prev,
        reference: `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      }));
    }
  }, [isOpen]);

  async function fetchActiveAllocations() {
    const { data } = await supabase
      .from("allocations")
      .select(
        `
        id,
        total_amount,
        amount_paid,
        balance,
        customer:customers(full_name),
        plot:plots(plot_number, estate_name)
      `
      )
      .in("status", ["active", "defaulted"])
      .order("created_at", { ascending: false });

    setAllocations(data || []);
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.allocation_id) newErrors.allocation_id = "Please select an allocation";
    if (!formData.amount || parseFloat(formData.amount) <= 0) newErrors.amount = "Please enter a valid amount";
    if (!formData.reference) newErrors.reference = "Payment reference is required";

    // Validate amount doesn't exceed balance
    const selectedAllocation = allocations.find((a) => a.id === formData.allocation_id);
    if (selectedAllocation && parseFloat(formData.amount) > selectedAllocation.balance) {
      newErrors.amount = `Amount cannot exceed balance of ₦${selectedAllocation.balance.toLocaleString()}`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setLoading(true);

    try {
      const amount = parseFloat(formData.amount);

      // Insert payment record
      const { data: payment, error: paymentError } = await supabase
        .from("payments")
        .insert([
          {
            allocation_id: formData.allocation_id,
            amount,
            payment_method: formData.payment_method,
            payment_date: formData.payment_date,
            reference: formData.reference,
            status: "confirmed",
          },
        ])
        .select()
        .single();

      if (paymentError) throw paymentError;

      // Update allocation amount_paid
      const selectedAllocation = allocations.find((a) => a.id === formData.allocation_id);
      const newAmountPaid = selectedAllocation.amount_paid + amount;
      const newBalance = selectedAllocation.total_amount - newAmountPaid;

      const { error: updateError } = await supabase
        .from("allocations")
        .update({
          amount_paid: newAmountPaid,
          status: newBalance <= 0 ? "completed" : "active",
        })
        .eq("id", formData.allocation_id);

      if (updateError) throw updateError;

      // Trigger Edge Functions (generate-receipt and commission-calculation)
      try {
        await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/generate-receipt`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ payment_id: payment.id }),
        });

        await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/commission-calculation`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ allocation_id: formData.allocation_id }),
        });
      } catch (funcError) {
        console.warn("Edge function trigger failed:", funcError);
      }

      toast.success("Payment recorded successfully");
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Error recording payment:", error);
      toast.error(error.message || "Failed to record payment");
    } finally {
      setLoading(false);
    }
  };

  const selectedAllocation = allocations.find((a) => a.id === formData.allocation_id);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Record Payment" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Allocation <span className="text-red-500">*</span>
          </label>
          <select
            name="allocation_id"
            value={formData.allocation_id}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-2xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Choose an allocation</option>
            {allocations.map((alloc) => (
              <option key={alloc.id} value={alloc.id}>
                {alloc.customer.full_name} - {alloc.plot.estate_name} Plot {alloc.plot.plot_number} (Balance: ₦
                {alloc.balance.toLocaleString()})
              </option>
            ))}
          </select>
          {errors.allocation_id && <p className="mt-1 text-sm text-red-600">{errors.allocation_id}</p>}
        </div>

        {selectedAllocation && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-sm text-gray-700 mb-2">Allocation Details</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-600">Total Amount:</span>
                <span className="font-medium ml-2">₦{selectedAllocation.total_amount.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-gray-600">Amount Paid:</span>
                <span className="font-medium ml-2">₦{selectedAllocation.amount_paid.toLocaleString()}</span>
              </div>
              <div className="col-span-2">
                <span className="text-gray-600">Outstanding Balance:</span>
                <span className="font-bold ml-2 text-lg">₦{selectedAllocation.balance.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Amount"
            name="amount"
            type="number"
            step="0.01"
            value={formData.amount}
            onChange={handleChange}
            error={errors.amount}
            required
          />
          <Input
            label="Payment Date"
            name="payment_date"
            type="date"
            value={formData.payment_date}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
          <select
            name="payment_method"
            value={formData.payment_method}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-2xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="cash">Cash</option>
            <option value="bank_transfer">Bank Transfer</option>
            <option value="card">Card Payment</option>
            <option value="cheque">Cheque</option>
          </select>
        </div>

        <Input
          label="Payment Reference"
          name="reference"
          value={formData.reference}
          onChange={handleChange}
          error={errors.reference}
          helperText="Unique reference for this payment"
          required
        />

        <div className="flex gap-3 pt-4">
          <Button type="submit" isLoading={loading} className="flex-1">
            Record Payment
          </Button>
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
}
