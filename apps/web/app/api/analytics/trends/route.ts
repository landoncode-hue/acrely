export const dynamic = 'force-dynamic';
/**
 * Analytics Trends API Route
 * GET /api/analytics/trends
 * 
 * Returns revenue trends and predictions
 * Access: CEO, MD, SysAdmin only
 */

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export const revalidate = 600;

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (!profile || !['CEO', 'MD', 'SysAdmin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch revenue trends and predictions
    const [trendsResult, predictionsResult] = await Promise.all([
      supabase
        .from('revenue_trends_summary')
        .select('*')
        .order('month', { ascending: true })
        .limit(12),
      supabase
        .from('revenue_predictions')
        .select('*')
        .gte('predicted_month', new Date().toISOString().substring(0, 10))
        .order('predicted_month', { ascending: true })
        .limit(3),
    ]);

    if (trendsResult.error) throw trendsResult.error;
    if (predictionsResult.error) throw predictionsResult.error;

    return NextResponse.json({
      success: true,
      data: {
        historical: trendsResult.data || [],
        predictions: predictionsResult.data || [],
      },
    });
  } catch (error) {
    console.error('Trends error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
