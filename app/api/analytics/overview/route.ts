import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user||!['OFFICER','ADMIN','INVENTORY_MANAGER'].includes(user.role)) return NextResponse.json({error:'Forbidden'},{status:403});
    const [total,active,critical,resolved,pending] = await Promise.all([
      prisma.incident.count(),
      prisma.incident.count({where:{status:{in:['REPORTED','UNDER_REVIEW','VERIFIED','RESOURCES_ASSIGNED','DISPATCHED','IN_PROGRESS']}}}),
      prisma.incident.count({where:{severity:'CRITICAL',status:{notIn:['RESOLVED','CLOSED','FALSE_ALARM']}}}),
      prisma.incident.count({where:{status:{in:['RESOLVED','CLOSED']}}}),
      prisma.incident.count({where:{status:{in:['REPORTED','UNDER_REVIEW']}}}),
    ]);
    const [byType,bySeverity,byStatus,recent,teams,teamsDeployed,allItems] = await Promise.all([
      prisma.incident.groupBy({by:['type'],_count:true}),
      prisma.incident.groupBy({by:['severity'],_count:true}),
      prisma.incident.groupBy({by:['status'],_count:true}),
      prisma.incident.findMany({orderBy:{createdAt:'desc'},take:5,select:{id:true,trackingId:true,type:true,severity:true,status:true,title:true,createdAt:true}}),
      prisma.rescueTeam.count({where:{status:'AVAILABLE'}}),
      prisma.rescueTeam.count({where:{status:'DEPLOYED'}}),
      prisma.inventoryItem.findMany({select:{availableQty:true,minThreshold:true,status:true}}),
    ]);
    const resourcesAvailable = allItems.filter(i=>i.status==='AVAILABLE'&&i.availableQty>0).length;
    const lowStockItems = allItems.filter(i=>i.availableQty<=i.minThreshold).length;
    return NextResponse.json({ totalIncidents:total, activeIncidents:active, criticalIncidents:critical, resolvedIncidents:resolved, pendingReview:pending, teamsAvailable:teams, teamsDeployed, resourcesAvailable, lowStockItems, incidentsByType:byType.map(r=>({type:r.type,count:r._count})), incidentsBySeverity:bySeverity.map(r=>({severity:r.severity,count:r._count})), incidentsByStatus:byStatus.map(r=>({status:r.status,count:r._count})), recentActivity:recent });
  } catch(e) { console.error('[Analytics]',e); return NextResponse.json({error:'Failed'},{status:500}); }
}

