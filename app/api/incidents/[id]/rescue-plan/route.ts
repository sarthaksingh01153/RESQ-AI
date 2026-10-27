import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { runResourcePlanningAgent } from '@/lib/agents/resource-planning.agent';
import { runRoutingAwarenessAgent } from '@/lib/agents/routing-awareness.agent';
import { runResponseCoordinationAgent } from '@/lib/agents/response-coordination.agent';

export async function POST(req: NextRequest, {params}:{params:{id:string}}) {
  try {
    const user = await getAuthUser(req);
    if (!user||!['OFFICER','ADMIN'].includes(user.role)) return NextResponse.json({error:'Forbidden'},{status:403});
    const planId = await runResourcePlanningAgent(params.id);
    await runRoutingAwarenessAgent(params.id);
    if (planId) await runResponseCoordinationAgent(params.id);
    const plan = await prisma.rescuePlan.findFirst({where:{incidentId:params.id},orderBy:{createdAt:'desc'}});
    return NextResponse.json({plan,message:'Rescue plan generated'});
  } catch { return NextResponse.json({error:'Failed'},{status:500}); }
}

export async function GET(req: NextRequest, {params}:{params:{id:string}}) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({error:'Unauthorized'},{status:401});
  const plans = await prisma.rescuePlan.findMany({where:{incidentId:params.id},orderBy:{createdAt:'desc'}});
  return NextResponse.json({plans});
}

