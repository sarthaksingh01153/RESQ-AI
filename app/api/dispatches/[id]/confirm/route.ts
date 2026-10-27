import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { confirmDispatch } from '@/lib/services/inventory.service';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest, {params}:{params:{id:string}}) {
  try {
    const user = await getAuthUser(req);
    if (!user||!['OFFICER','ADMIN'].includes(user.role)) return NextResponse.json({error:'Forbidden'},{status:403});
    const {incidentId} = await req.json();
    const dispatch = await confirmDispatch(params.id,incidentId,user.sub);
    await prisma.incident.update({where:{id:incidentId},data:{status:'DISPATCHED'}});
    await prisma.incidentTimeline.create({data:{incidentId,status:'DISPATCHED',note:'Resources dispatched to incident site',createdById:user.sub,isPublic:true}});
    await prisma.auditLog.create({data:{userId:user.sub,action:'CONFIRM_DISPATCH',resource:'Dispatch',resourceId:dispatch.id}});
    return NextResponse.json({dispatch,message:'Dispatch confirmed'});
  } catch(e) { return NextResponse.json({error:e instanceof Error?e.message:'Failed'},{status:400}); }
}

