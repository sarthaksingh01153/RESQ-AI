import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { approveReservation } from '@/lib/services/inventory.service';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest, {params}:{params:{id:string}}) {
  try {
    const user = await getAuthUser(req);
    if (!user||!['OFFICER','ADMIN'].includes(user.role)) return NextResponse.json({error:'Forbidden'},{status:403});
    const reservation = await approveReservation(params.id,user.sub);
    await prisma.incident.update({where:{id:reservation.incidentId},data:{status:'RESOURCES_ASSIGNED'}});
    await prisma.incidentTimeline.create({data:{incidentId:reservation.incidentId,status:'RESOURCES_ASSIGNED',note:'Resources approved by officer',createdById:user.sub,isPublic:false}});
    await prisma.auditLog.create({data:{userId:user.sub,action:'APPROVE_RESERVATION',resource:'ResourceReservation',resourceId:params.id}});
    return NextResponse.json({reservation,message:'Approved'});
  } catch(e) { return NextResponse.json({error:e instanceof Error?e.message:'Failed'},{status:400}); }
}

