import { createClient } from '@/lib/supabase/server';
import { checkCaseAccess } from '@/lib/game/actions';
import { INITIAL_POINTS } from '@/lib/types/game';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { caseId } = await request.json();
  if (!caseId) return NextResponse.json({ error: 'caseId required' }, { status: 400 });

  const hasAccess = await checkCaseAccess(user.id, caseId);
  if (!hasAccess) return NextResponse.json({ error: 'Access denied' }, { status: 403 });

  // Check if already started
  const { data: existing } = await supabase
    .from('user_case_progress')
    .select('id, status')
    .eq('user_id', user.id)
    .eq('case_id', caseId)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ progress: existing });
  }

  const { data, error } = await supabase
    .from('user_case_progress')
    .insert({
      user_id: user.id,
      case_id: caseId,
      points_remaining: INITIAL_POINTS,
      status: 'active',
      attempts_used: 0,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ progress: data });
}
