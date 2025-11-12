"use client";

import { useState, useEffect } from "react";
import { Modal, Input, Button } from "@acrely/ui";
import { supabase } from "@acrely/services";
import toast from "react-hot-toast";

interface AllocationFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AllocationForm({ isOpen, onClose, onSuccess }: AllocationFormProps) {
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
  const [plots, setPlots] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    customer_id: "",
    plot_id: "",
    agent_id: "",
    payment_plan: "installment",
    total_amount: "",
    installment_count: "",
    installment_frequency: "monthly",
    allocation_date: new Date().toISOString().split("T")[0],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      fetchCustomers();
      fetchAvailablePlots();
      fetchAgents();
    }
  }, [isOpen]);

  async function fetchCustomers() {
    const { data } = await supabase.from("customers").select("id, full_name, phone").order("full_name");
    setCustomers(data || []);
  }

  async function fetchAvailablePlots() {
    const { data } = await supabase
      .from("plots")
      .select("id, plot_number, estate_name, price, size_sqm")
      .eq("status", "available")
      .order("estate_name");
    setPlots(data || []);
  }

  async function fetchAgents() {
    const { data } = await supabase
      .from("users")
      .select("id, full_name, email")
      .eq("role", "agent")
      .order("full_name");
    setAgents(data || []);
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Auto-fill total_amount when plot is selected
    if (name === "plot_id") {
      const selectedPlot = plots.find((p) => p.id === value);
      if (selectedPlot) {
        setFormData((prev) => ({ ...prev, total_amount: selectedPlot.price.toString() }));
      }
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.customer_id) newErrors.customer_id = "Please select a customer";
    if (!formData.plot_id) newErrors.plot_id = "Please select a plot";
    if (!formData.agent_id) newErrors.agent_id = "Please select an agent";
    if (!formData.total_amount || parseFloat(formData.total_amount) <= 0)
      newErrors.total_amount = "Please enter a valid amount";

    if (formData.payment_plan === "installment") {
      if (!formData.installment_count || parseInt(formData.installment_count) <= 0) {
        newErrors.installment_count = "Please enter valid installment count";
      }
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
      // Calculate next payment date
      const allocationDate = new Date(formData.allocation_date);
      const nextPaymentDate = new Date(allocationDate);
      
      if (formData.payment_plan === "installment") {
        if (formData.installment_frequency === "monthly") {
          nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
        } else {
          nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 3);
        }
      }

      // Create allocation
      const { data: allocation, error: allocError } = await supabase
        .from("allocations")
        .insert([
          {
            customer_id: formData.customer_id,
            plot_id: formData.plot_id,
            agent_id: formData.agent_id,
            allocation_date: formData.allocation_date,
            total_amount: parseFloat(formData.total_amount),
            payment_plan: formData.payment_plan,
            installment_count: formData.payment_plan === "installment" ? parseInt(formData.installment_count) : null,
            installment_frequency: formData.payment_plan === "installment" ? formData.installment_frequency : null,
            next_payment_date: formData.payment_plan === "installment" ? nextPaymentDate.toISOString().split("T")[0] : null,
            status: "active",
            amount_paid: 0,
          },
        ])
        .select()
        .single();

      if (allocError) throw allocError;

      // Update plot status
      const { error: plotError } = await supabase
        .from("plots")
        .update({ status: "allocated" })
        .eq("id", formData.plot_id);

      if (plotError) throw plotError;

      // Trigger SMS notification (via Edge Function)
      try {
        const customer = customers.find((c) => c.id === formData.customer_id);
        const plot = plots.find((p) => p.id === formData.plot_id);
        
        await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/send-sms`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            to: customer.phone,
            message: `Dear ${customer.full_name}, your plot ${plot.plot_number} at ${plot.estate_name} has been successfully allocated. Thank you for choosing Pinnacle Builders.`,
          }),
        });
      } catch (smsError) {
        console.warn("SMS notification failed:", smsError);
      }

      toast.success("Plot allocated successfully");
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Error creating allocation:", error);
      toast.error(error.message || "Failed to create allocation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Allocate Plot to Customer" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Customer <span className="text-red-500">*</span>
          </label>
          <select
            name="customer_id"
            value={formData.customer_id}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-2xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Select a customer</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.full_name} ({customer.phone})
              </option>
            ))}
          </select>
          {errors.customer_id && <p className="mt-1 text-sm text-red-600">{errors.customer_id}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Plot <span className="text-red-500">*</span>
          </label>
          <select
            name="plot_id"
            value={formData.plot_id}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-2xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Select a plot</option>
            {plots.map((plot) => (
              <option key={plot.id} value={plot.id}>
                {plot.estate_name} - Plot {plot.plot_number} ({plot.size_sqm}sqm - ₦{plot.price.toLocaleString()})
              </option>
            ))}
          </select>
          {errors.plot_id && <p className="mt-1 text-sm text-red-600">{errors.plot_id}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Agent <span className="text-red-500">*</span>
          </label>
          <select
            name="agent_id"
            value={formData.agent_id}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-2xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Select an agent</option>
            {agents.map((agent) => (
              <option key={agent.id} value={agent.id}>
                {agent.full_name} ({agent.email})
              </option>
            ))}
          </select>
          {errors.agent_id && <p className="mt-1 text-sm text-red-600">{errors.agent_id}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Total Amount"
            name="total_amount"
            type="number"
            value={formData.total_amount}
            onChange={handleChange}
            error={errors.total_amount}
            required
          />
          <Input
            label="Allocation Date"
            name="allocation_date"
            type="date"
            value={formData.allocation_date}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Payment Plan</label>
          <select
            name="payment_plan"
            value={formData.payment_plan}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-2xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="outright">Outright Payment</option>
            <option value="installment">Installment Payment</option>
          </select>
        </div>

        {formData.payment_plan === "installment" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Number of Installments"
              name="installment_count"
              type="number"
              value={formData.installment_count}
              onChange={handleChange}
              error={errors.installment_count}
              required
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
              <select
                name="installment_frequency"
                value={formData.installment_frequency}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-2xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
              </select>
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <Button type="submit" isLoading={loading} className="flex-1">
            Allocate Plot
          </Button>
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
}
