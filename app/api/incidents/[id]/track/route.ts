import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(_req: NextRequest, {params}:{params:{id:string}}) {
  try {
    const inc = await prisma.incident.findFirst({ where:{OR:[{id:params.id},{trackingId:params.id}]}, select:{id:true,trackingId:true,type:true,severity:true,status:true,title:true,latitude:true,longitude:true,address:true,reporterName:true,createdAt:true,updatedAt:true,timeline:{where:{isPublic:true},orderBy:{createdAt:'asc'},select:{id:true,status:true,note:true,createdAt:true}},aiAnalyses:{select:{id:true,agentName:true,summary:true,severity:true,createdAt:true},orderBy:{createdAt:'desc'},take:1},weatherObs:{orderBy:{createdAt:'desc'},take:1,select:{temperature:true,conditions:true,windSpeed:true,alerts:true,observedAt:true,source:true}}} });
    if (!inc) return NextResponse.json({error:'Not found'},{status:404});
    return NextResponse.json({incident:inc});
  } catch { return NextResponse.json({error:'Failed to track'},{status:500}); }
}

