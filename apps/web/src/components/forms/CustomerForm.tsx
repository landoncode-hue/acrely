"use client";

import { useState } from "react";
import { Modal, Input, Button } from "@acrely/ui";
import { supabase } from "@acrely/services";
import toast from "react-hot-toast";

interface CustomerFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  customer?: any;
}

export function CustomerForm({ isOpen, onClose, onSuccess, customer }: CustomerFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: customer?.full_name || "",
    phone: customer?.phone || "",
    email: customer?.email || "",
    address: customer?.address || "",
    city: customer?.city || "",
    state: customer?.state || "",
    id_type: customer?.id_type || "",
    id_number: customer?.id_number || "",
    occupation: customer?.occupation || "",
    next_of_kin_name: customer?.next_of_kin_name || "",
    next_of_kin_phone: customer?.next_of_kin_phone || "",
    next_of_kin_relationship: customer?.next_of_kin_relationship || "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.full_name.trim()) {
      newErrors.full_name = "Full name is required";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\+?[\d\s-()]+$/.test(formData.phone)) {
      newErrors.phone = "Invalid phone number format";
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
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
      if (customer?.id) {
        // Update existing customer
        const { error } = await supabase
          .from("customers")
          .update({
            ...formData,
            updated_at: new Date().toISOString(),
          })
          .eq("id", customer.id);

        if (error) throw error;
        toast.success("Customer updated successfully");
      } else {
        // Create new customer
        const { error } = await supabase.from("customers").insert([formData]);

        if (error) throw error;
        toast.success("Customer created successfully");
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Error saving customer:", error);
      toast.error(error.message || "Failed to save customer");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={customer ? "Edit Customer" : "Add New Customer"} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Full Name"
            name="full_name"
            value={formData.full_name}
            onChange={handleChange}
            error={errors.full_name}
            required
          />
          <Input
            label="Phone Number"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            error={errors.phone}
            required
          />
          <Input
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
          />
          <Input label="City" name="city" value={formData.city} onChange={handleChange} />
          <Input label="State" name="state" value={formData.state} onChange={handleChange} />
          <Input label="Occupation" name="occupation" value={formData.occupation} onChange={handleChange} />
        </div>

        <Input label="Address" name="address" value={formData.address} onChange={handleChange} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="ID Type" name="id_type" value={formData.id_type} onChange={handleChange} />
          <Input label="ID Number" name="id_number" value={formData.id_number} onChange={handleChange} />
        </div>

        <div className="border-t pt-4 mt-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Next of Kin Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Next of Kin Name"
              name="next_of_kin_name"
              value={formData.next_of_kin_name}
              onChange={handleChange}
            />
            <Input
              label="Next of Kin Phone"
              name="next_of_kin_phone"
              type="tel"
              value={formData.next_of_kin_phone}
              onChange={handleChange}
            />
            <Input
              label="Relationship"
              name="next_of_kin_relationship"
              value={formData.next_of_kin_relationship}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="submit" isLoading={loading} className="flex-1">
            {customer ? "Update Customer" : "Create Customer"}
          </Button>
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
}
