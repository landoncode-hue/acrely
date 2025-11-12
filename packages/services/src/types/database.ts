export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          phone: string | null;
          role: "admin" | "agent" | "manager";
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["users"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["users"]["Insert"]>;
      };
      customers: {
        Row: {
          id: string;
          full_name: string;
          email: string | null;
          phone: string;
          address: string | null;
          city: string | null;
          state: string | null;
          id_type: string | null;
          id_number: string | null;
          occupation: string | null;
          next_of_kin_name: string | null;
          next_of_kin_phone: string | null;
          next_of_kin_relationship: string | null;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["customers"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["customers"]["Insert"]>;
      };
      plots: {
        Row: {
          id: string;
          plot_number: string;
          estate_name: string;
          estate_code: string;
          size_sqm: number;
          price: number;
          status: "available" | "allocated" | "sold" | "reserved";
          location_description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["plots"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["plots"]["Insert"]>;
      };
      allocations: {
        Row: {
          id: string;
          customer_id: string;
          plot_id: string;
          allocation_date: string;
          total_amount: number;
          amount_paid: number;
          balance: number;
          payment_plan: "outright" | "installment";
          installment_count: number | null;
          installment_frequency: "monthly" | "quarterly" | null;
          next_payment_date: string | null;
          status: "active" | "completed" | "defaulted" | "cancelled";
          agent_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["allocations"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["allocations"]["Insert"]>;
      };
      payments: {
        Row: {
          id: string;
          allocation_id: string;
          amount: number;
          payment_method: "cash" | "bank_transfer" | "card" | "cheque";
          payment_date: string;
          reference: string;
          receipt_url: string | null;
          status: "pending" | "confirmed" | "failed";
          recorded_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["payments"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["payments"]["Insert"]>;
      };
      commissions: {
        Row: {
          id: string;
          agent_id: string;
          allocation_id: string;
          commission_rate: number;
          commission_amount: number;
          status: "pending" | "approved" | "paid";
          approved_by: string | null;
          approved_at: string | null;
          paid_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["commissions"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["commissions"]["Insert"]>;
      };
      inspection_schedules: {
        Row: {
          id: string;
          customer_id: string;
          plot_id: string;
          scheduled_date: string;
          status: "scheduled" | "completed" | "cancelled" | "rescheduled";
          notes: string | null;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["inspection_schedules"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["inspection_schedules"]["Insert"]>;
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          message: string;
          type: "info" | "success" | "warning" | "error";
          read: boolean;
          link: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["notifications"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["notifications"]["Insert"]>;
      };
      leads: {
        Row: {
          id: string;
          full_name: string;
          phone: string;
          email: string | null;
          source: string;
          status: "new" | "contacted" | "qualified" | "converted" | "lost";
          interest_estate: string | null;
          notes: string | null;
          assigned_to: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["leads"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["leads"]["Insert"]>;
      };
      call_logs: {
        Row: {
          id: string;
          lead_id: string | null;
          customer_id: string | null;
          phone: string;
          duration_seconds: number | null;
          outcome: string | null;
          notes: string | null;
          logged_by: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["call_logs"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["call_logs"]["Insert"]>;
      };
      sms_campaigns: {
        Row: {
          id: string;
          name: string;
          message: string;
          sender_id: string;
          status: "draft" | "scheduled" | "sending" | "completed" | "failed";
          scheduled_at: string | null;
          sent_at: string | null;
          total_recipients: number;
          successful_sends: number;
          failed_sends: number;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["sms_campaigns"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["sms_campaigns"]["Insert"]>;
      };
      campaign_recipients: {
        Row: {
          id: string;
          campaign_id: string;
          phone: string;
          status: "pending" | "sent" | "failed";
          error_message: string | null;
          sent_at: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["campaign_recipients"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["campaign_recipients"]["Insert"]>;
      };
      settings: {
        Row: {
          id: string;
          key: string;
          value: string;
          description: string | null;
          updated_by: string | null;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["settings"]["Row"], "id" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["settings"]["Insert"]>;
      };
      receipts: {
        Row: {
          id: string;
          payment_id: string;
          customer_id: string;
          file_url: string | null;
          amount: number;
          receipt_number: string;
          payment_date: string;
          generated_by: string | null;
          estate_name: string | null;
          plot_reference: string | null;
          payment_method: string | null;
          metadata: Record<string, unknown>;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["receipts"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["receipts"]["Insert"]>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
