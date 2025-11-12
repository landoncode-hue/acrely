"use client";

import { useState } from "react";
import { supabase, supabaseAdmin } from "@acrely/services";
import { 
  Key, 
  UserX, 
  Receipt, 
  MessageSquare,
  AlertTriangle,
  CheckCircle 
} from "lucide-react";
import { toast } from "react-hot-toast";

interface Props {
  userId?: string;
  paymentId?: string;
  onClose: () => void;
}

export function AdminActionsPanel({ userId, paymentId, onClose }: Props) {
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState<string | null>(null);

  const handleResetPassword = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      
      // Get user email
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("email")
        .eq("id", userId)
        .single();

      if (userError) throw userError;

      // Send password reset email (requires admin API)
      const { error } = await supabase.auth.resetPasswordForEmail(
        userData.email,
        {
          redirectTo: `${window.location.origin}/reset-password`,
        }
      );

      if (error) throw error;

      toast.success("Password reset email sent successfully");
      setShowConfirm(null);
    } catch (error: any) {
      console.error("Error resetting password:", error);
      toast.error(error.message || "Failed to send password reset email");
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivateUser = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from("users")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", userId);

      if (error) throw error;

      toast.success("User deactivated successfully");
      setShowConfirm(null);
      onClose();
    } catch (error: any) {
      console.error("Error deactivating user:", error);
      toast.error(error.message || "Failed to deactivate user");
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateReceipt = async () => {
    if (!paymentId) return;
    
    try {
      setLoading(true);
      
      // Call edge function to regenerate receipt
      const { data, error } = await supabase.functions.invoke("generate-receipt", {
        body: { payment_id: paymentId },
      });

      if (error) throw error;

      toast.success("Receipt regenerated successfully");
      setShowConfirm(null);
    } catch (error: any) {
      console.error("Error regenerating receipt:", error);
      toast.error(error.message || "Failed to regenerate receipt");
    } finally {
      setLoading(false);
    }
  };

  const handleResendSMS = async () => {
    if (!paymentId) return;
    
    try {
      setLoading(true);
      
      // Get payment details
      const { data: payment, error: paymentError } = await supabase
        .from("payments")
        .select(`
          *,
          allocation:allocations!inner(
            customer:customers!inner(full_name, phone),
            estate:estates!inner(name)
          )
        `)
        .eq("id", paymentId)
        .single();

      if (paymentError) throw paymentError;

      // Call edge function to send SMS
      const { error } = await supabase.functions.invoke("send-sms", {
        body: {
          phone: payment.allocation.customer.phone,
          message: `Payment of ₦${payment.amount.toLocaleString()} received for ${payment.allocation.estate.name}. Thank you! - Pinnacle Builders`,
        },
      });

      if (error) throw error;

      toast.success("SMS sent successfully");
      setShowConfirm(null);
    } catch (error: any) {
      console.error("Error sending SMS:", error);
      toast.error(error.message || "Failed to send SMS");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Admin Quick Actions</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {userId && (
          <>
            <button
              onClick={() => setShowConfirm("reset-password")}
              disabled={loading}
              className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all text-left disabled:opacity-50"
            >
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Key className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Reset Password</p>
                <p className="text-xs text-gray-600">Send password reset email</p>
              </div>
            </button>

            <button
              onClick={() => setShowConfirm("deactivate-user")}
              disabled={loading}
              className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-lg hover:border-red-300 hover:shadow-md transition-all text-left disabled:opacity-50"
            >
              <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                <UserX className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Deactivate User</p>
                <p className="text-xs text-gray-600">Disable user account</p>
              </div>
            </button>
          </>
        )}

        {paymentId && (
          <>
            <button
              onClick={() => setShowConfirm("regenerate-receipt")}
              disabled={loading}
              className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-lg hover:border-green-300 hover:shadow-md transition-all text-left disabled:opacity-50"
            >
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <Receipt className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Regenerate Receipt</p>
                <p className="text-xs text-gray-600">Create new receipt for payment</p>
              </div>
            </button>

            <button
              onClick={() => setShowConfirm("resend-sms")}
              disabled={loading}
              className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-lg hover:border-purple-300 hover:shadow-md transition-all text-left disabled:opacity-50"
            >
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Resend SMS</p>
                <p className="text-xs text-gray-600">Send payment confirmation SMS</p>
              </div>
            </button>
          </>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Confirm Action</h3>
                <p className="text-sm text-gray-600">
                  {showConfirm === "reset-password" && "Send password reset email to this user?"}
                  {showConfirm === "deactivate-user" && "Deactivate this user account?"}
                  {showConfirm === "regenerate-receipt" && "Regenerate receipt for this payment?"}
                  {showConfirm === "resend-sms" && "Resend payment confirmation SMS?"}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(null)}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (showConfirm === "reset-password") handleResetPassword();
                  if (showConfirm === "deactivate-user") handleDeactivateUser();
                  if (showConfirm === "regenerate-receipt") handleRegenerateReceipt();
                  if (showConfirm === "resend-sms") handleResendSMS();
                }}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Confirm
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
