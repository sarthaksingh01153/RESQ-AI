import { prisma } from '@/lib/prisma';
import { planResources } from '@/lib/services/ai.service';

export async function runResourcePlanningAgent(incidentId: string): Promise<string|null> {
  const start = Date.now(); let actId: string|null = null;
  try {
    const act = await prisma.agentActivity.create({ data:{ incidentId, agentName:'Resource Planning Agent', action:'Planning resource allocation', status:'RUNNING', toolsUsed:JSON.stringify(['search_inventory','plan_resources']) } });
    actId = act.id;
    const incident = await prisma.incident.findUnique({where:{id:incidentId}});
    if (!incident) throw new Error('Incident not found');
    const inventory = await prisma.inventoryItem.findMany({ where:{status:'AVAILABLE',availableQty:{gt:0}}, orderBy:{availableQty:'desc'}, take:50 });
    const result = await planResources( {id:incident.id,type:incident.type,severity:incident.severity,description:incident.description}, inventory.map(i=>({id:i.id,name:i.name,category:i.category,availableQty:i.availableQty,unit:i.unit})) );
    const plan = result.data;
    await prisma.aIAnalysis.create({ data:{ incidentId, agentName:'Resource Planning Agent', summary:plan.planSummary, rawOutput:JSON.stringify(plan), modelUsed:result.modelUsed, isMock:result.isMock } });
    const rescuePlan = await prisma.rescuePlan.create({ data:{ incidentId, status:'PENDING_APPROVAL', summary:plan.planSummary, resourcesRequired:JSON.stringify(plan.recommendedResources), isMock:result.isMock } });
    await prisma.incident.update({where:{id:incidentId},data:{status:'VERIFIED'}});
    await prisma.incidentTimeline.create({data:{incidentId,status:'VERIFIED',note:`Resource plan generated — ${plan.recommendedResources.length} resource type(s)`,isPublic:false}});
    await prisma.agentActivity.update({where:{id:actId},data:{status:'COMPLETED',result:JSON.stringify({planId:rescuePlan.id,shortage:plan.shortage,isMock:result.isMock}),duration:Date.now()-start}});
    return rescuePlan.id;
  } catch(e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (actId) await prisma.agentActivity.update({where:{id:actId},data:{status:'FAILED',errorMsg:msg,duration:Date.now()-start}}).catch(()=>{});
    return null;
  }
}

