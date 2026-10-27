import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { runIncidentAnalysisAgent } from '@/lib/agents/incident-analysis.agent';
import { runResourcePlanningAgent } from '@/lib/agents/resource-planning.agent';
import { runRoutingAwarenessAgent } from '@/lib/agents/routing-awareness.agent';
import { runResponseCoordinationAgent } from '@/lib/agents/response-coordination.agent';

export async function POST(req: NextRequest, {params}:{params:{id:string}}) {
  try {
    const user = await getAuthUser(req);
    if (!user||!['OFFICER','ADMIN'].includes(user.role)) return NextResponse.json({error:'Forbidden'},{status:403});
    await runIncidentAnalysisAgent(params.id);
    const planId = await runResourcePlanningAgent(params.id);
    await runRoutingAwarenessAgent(params.id);
    if (planId) await runResponseCoordinationAgent(params.id);
    return NextResponse.json({message:'AI pipeline completed',planId});
  } catch(e) { return NextResponse.json({error:'Analysis failed'},{status:500}); }
}

