import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest, {params}:{params:{id:string}}) {
  const user = await getAuthUser(req);
  const isOfficer = user&&['OFFICER','ADMIN'].includes(user.role);
  const tl = await prisma.incidentTimeline.findMany({ where:{incidentId:params.id,...(!isOfficer&&{isPublic:true})}, include:{createdBy:{select:{id:true,name:true}}}, orderBy:{createdAt:'asc'} });
  return NextResponse.json({timeline:tl});
}

export async function POST(req: NextRequest, {params}:{params:{id:string}}) {
  try {
    const user = await getAuthUser(req);
    if (!user||!['OFFICER','ADMIN'].includes(user.role)) return NextResponse.json({error:'Forbidden'},{status:403});
    const {status,note,isPublic} = await req.json();
    const entry = await prisma.incidentTimeline.create({data:{incidentId:params.id,status,note,isPublic:isPublic??false,createdById:user.sub}});
    return NextResponse.json({entry},{status:201});
  } catch { return NextResponse.json({error:'Failed'},{status:500}); }
}

