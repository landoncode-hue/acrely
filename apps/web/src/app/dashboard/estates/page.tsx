"use client";

import { useEffect, useState } from "react";
import { supabase } from "@acrely/services";
import { Building2, MapPin, Plus } from "lucide-react";
import { Card, CardContent, CardHeader } from "@acrely/ui";

interface Estate {
  id: string;
  name: string;
  code: string;
  location: string;
  total_plots: number;
  available_plots: number;
  sold_plots: number;
  created_at: string;
}

export default function EstatesPage() {
  const [estates, setEstates] = useState<Estate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEstates();
  }, []);

  async function fetchEstates() {
    try {
      const { data, error } = await supabase
        .from("estates")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setEstates(data || []);
    } catch (error) {
      console.error("Error fetching estates:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading estates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pinnacle Estates</h1>
          <p className="text-sm text-gray-600 mt-1">Manage your real estate properties</p>
        </div>
        <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Add Estate
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {estates.map((estate) => (
          <Card key={estate.id} hover>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-primary-100 rounded-lg">
                    <Building2 className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">{estate.name}</h3>
                    <p className="text-sm text-gray-500">Code: {estate.code}</p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  {estate.location || "Location not specified"}
                </div>
                <div className="grid grid-cols-3 gap-2 pt-3 border-t">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{estate.total_plots || 0}</p>
                    <p className="text-xs text-gray-500">Total</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{estate.available_plots || 0}</p>
                    <p className="text-xs text-gray-500">Available</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{estate.sold_plots || 0}</p>
                    <p className="text-xs text-gray-500">Sold</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {estates.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Estates Found</h3>
          <p className="text-gray-600 mb-4">Get started by adding your first estate</p>
          <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
            Add Estate
          </button>
        </div>
      )}
    </div>
  );
}
