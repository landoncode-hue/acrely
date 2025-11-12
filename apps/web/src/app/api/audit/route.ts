import { supabase } from "@acrely/services";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

interface AuditLogQuery {
  user_id?: string;
  table_name?: string;
  action?: string;
  limit?: number;
  offset?: number;
  start_date?: string;
  end_date?: string;
}

export async function GET(request: NextRequest) {
  try {
    // Use existing Supabase client

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const query: AuditLogQuery = {
      user_id: searchParams.get("user_id") || undefined,
      table_name: searchParams.get("table_name") || undefined,
      action: searchParams.get("action") || undefined,
      limit: parseInt(searchParams.get("limit") || "50"),
      offset: parseInt(searchParams.get("offset") || "0"),
      start_date: searchParams.get("start_date") || undefined,
      end_date: searchParams.get("end_date") || undefined,
    };

    // Build query
    let auditQuery = supabase
      .from("audit_logs")
      .select(`
        id,
        user_id,
        action,
        table_name,
        record_id,
        old_data,
        new_data,
        created_at,
        users:user_id (
          full_name,
          email,
          role
        )
      `)
      .order("created_at", { ascending: false })
      .range(query.offset, query.offset + query.limit - 1);

    // Apply filters
    if (query.user_id) {
      auditQuery = auditQuery.eq("user_id", query.user_id);
    }
    if (query.table_name) {
      auditQuery = auditQuery.eq("table_name", query.table_name);
    }
    if (query.action) {
      auditQuery = auditQuery.eq("action", query.action);
    }
    if (query.start_date) {
      auditQuery = auditQuery.gte("created_at", query.start_date);
    }
    if (query.end_date) {
      auditQuery = auditQuery.lte("created_at", query.end_date);
    }

    const { data: auditLogs, error, count } = await auditQuery;

    if (error) {
      throw error;
    }

    // Get summary statistics
    const { data: summary } = await supabase
      .from("audit_logs")
      .select("action, table_name")
      .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    // Calculate summary stats
    const actionCounts = summary?.reduce((acc: Record<string, number>, log) => {
      acc[log.action] = (acc[log.action] || 0) + 1;
      return acc;
    }, {});

    const tableCounts = summary?.reduce((acc: Record<string, number>, log) => {
      acc[log.table_name] = (acc[log.table_name] || 0) + 1;
      return acc;
    }, {});

    return NextResponse.json({
      data: auditLogs,
      pagination: {
        limit: query.limit,
        offset: query.offset,
        total: count,
      },
      summary: {
        total_records: summary?.length || 0,
        by_action: actionCounts,
        by_table: tableCounts,
      },
    });
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to fetch audit logs",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Manual audit log creation (for client-side actions)

    const body = await request.json();
    const { user_id, action, table_name, record_id, old_data, new_data } = body;

    // Validate required fields
    if (!user_id || !action || !table_name) {
      return NextResponse.json(
        { error: "Missing required fields: user_id, action, table_name" },
        { status: 400 }
      );
    }

    // Insert audit log
    const { data, error } = await supabase
      .from("audit_logs")
      .insert({
        user_id,
        action,
        table_name,
        record_id: record_id || null,
        old_data: old_data || null,
        new_data: new_data || null,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error creating audit log:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to create audit log",
      },
      { status: 500 }
    );
  }
}
