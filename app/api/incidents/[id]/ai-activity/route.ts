import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest, {params}:{params:{id:string}}) {
  const user = await getAuthUser(req);
  if (!user||!['OFFICER','ADMIN','RESCUE_TEAM'].includes(user.role)) return NextResponse.json({error:'Forbidden'},{status:403});
  const activities = await prisma.agentActivity.findMany({ where:{incidentId:params.id}, orderBy:{createdAt:'asc'}, select:{id:true,agentName:true,action:true,status:true,toolsUsed:true,result:true,errorMsg:true,duration:true,createdAt:true} });
  return NextResponse.json({activities});
}

