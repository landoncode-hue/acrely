"use client";

import { useEffect, useState } from "react";
import { supabase } from "@acrely/services";
import { UserPlus, Phone, Mail, Calendar, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, Button } from "@acrely/ui";

interface Lead {
  id: string;
  full_name: string;
  phone: string;
  email: string;
  status: string;
  source: string;
  notes: string;
  created_at: string;
  assigned_to: string | null;
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    fetchLeads();
  }, [statusFilter]);

  async function fetchLeads() {
    try {
      let query = supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setLeads(data || []);
    } catch (error) {
      console.error("Error fetching leads:", error);
    } finally {
      setLoading(false);
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      new: "bg-blue-100 text-blue-800",
      contacted: "bg-yellow-100 text-yellow-800",
      qualified: "bg-green-100 text-green-800",
      converted: "bg-purple-100 text-purple-800",
      lost: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Leads</h1>
          <p className="text-slate-600 mt-1">Manage and track your sales leads</p>
        </div>
        <Button className="flex items-center gap-2">
          <UserPlus className="h-4 w-4" />
          Add Lead
        </Button>
      </div>

      {/* Status Filter */}
      <div className="flex gap-2">
        {["all", "new", "contacted", "qualified", "converted", "lost"].map((status) => (
          <Button
            key={status}
            variant={statusFilter === status ? "primary" : "outline"}
            onClick={() => setStatusFilter(status)}
            className="capitalize"
          >
            {status}
          </Button>
        ))}
      </div>

      {/* Leads Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {leads.map((lead) => (
          <Card key={lead.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{lead.full_name}</h3>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-2 ${getStatusColor(lead.status)}`}>
                    {lead.status}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Phone className="h-4 w-4" />
                {lead.phone}
              </div>
              {lead.email && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Mail className="h-4 w-4" />
                  {lead.email}
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Calendar className="h-4 w-4" />
                {new Date(lead.created_at).toLocaleDateString()}
              </div>
              {lead.source && (
                <div className="text-sm text-slate-500 mt-2">
                  Source: <span className="font-medium">{lead.source}</span>
                </div>
              )}
              {lead.notes && (
                <p className="text-sm text-slate-600 mt-2 line-clamp-2">{lead.notes}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {leads.length === 0 && (
        <Card className="p-12 text-center">
          <UserPlus className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No leads found</h3>
          <p className="text-slate-600 mb-4">
            {statusFilter === "all" ? "Start by adding your first lead" : `No ${statusFilter} leads`}
          </p>
        </Card>
      )}
    </div>
  );
}
