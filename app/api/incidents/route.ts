import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { generateTrackingId } from '@/lib/utils';
import { runIncidentAnalysisAgent } from '@/lib/agents/incident-analysis.agent';

const schema = z.object({
  type:z.enum(['FLOOD','FIRE','ROAD_ACCIDENT','MEDICAL','EARTHQUAKE','BUILDING_COLLAPSE','MISSING_PERSON','OTHER']),
  severity:z.enum(['LOW','MEDIUM','HIGH','CRITICAL']).default('MEDIUM'),
  title:z.string().min(5).max(200), description:z.string().min(10).max(5000),
  latitude:z.number().min(-90).max(90), longitude:z.number().min(-180).max(180),
  address:z.string().max(500).optional(), reporterName:z.string().min(2).max(100),
  reporterPhone:z.string().max(20).optional(), reporterEmail:z.string().email().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const data = schema.parse(await req.json());
    const user = await getAuthUser(req);
    const incident = await prisma.incident.create({ data:{...data,trackingId:generateTrackingId(data.type),reportedById:user?.sub} });
    await prisma.incidentTimeline.create({data:{incidentId:incident.id,status:'REPORTED',note:'Emergency reported',isPublic:true}});
    await prisma.auditLog.create({data:{userId:user?.sub,action:'CREATE_INCIDENT',resource:'Incident',resourceId:incident.id}});
    runIncidentAnalysisAgent(incident.id).catch(console.error);
    return NextResponse.json({incident,message:'Incident reported successfully'},{status:201});
  } catch(e) {
    if (e instanceof z.ZodError) return NextResponse.json({error:'Validation error',details:e.errors},{status:400});
    return NextResponse.json({error:'Failed to create incident'},{status:500});
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    const {searchParams} = new URL(req.url);
    const page = Math.max(1,parseInt(searchParams.get('page')||'1'));
    const pageSize = Math.min(50,parseInt(searchParams.get('pageSize')||'20'));
    const where: Record<string,unknown> = {};
    if (user?.role==='CITIZEN') where.reportedById = user.sub;
    if (searchParams.get('status')) where.status = searchParams.get('status');
    if (searchParams.get('type')) where.type = searchParams.get('type');
    if (searchParams.get('severity')) where.severity = searchParams.get('severity');
    const q = searchParams.get('search');
    if (q) where.OR = [{title:{contains:q}},{trackingId:{contains:q}},{reporterName:{contains:q}}];
    const [data,total] = await Promise.all([
      prisma.incident.findMany({ where, include:{reportedBy:{select:{id:true,name:true}},assignedTo:{select:{id:true,name:true}},_count:{select:{timeline:true,aiAnalyses:true}}}, orderBy:{createdAt:'desc'}, skip:(page-1)*pageSize, take:pageSize }),
      prisma.incident.count({where}),
    ]);
    return NextResponse.json({data,total,page,pageSize,totalPages:Math.ceil(total/pageSize)});
  } catch(e) { return NextResponse.json({error:'Failed to fetch incidents'},{status:500}); }
}

