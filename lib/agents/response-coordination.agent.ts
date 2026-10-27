import { prisma } from '@/lib/prisma';
import { generateRescuePlan } from '@/lib/services/ai.service';
import { safeJsonParse } from '@/lib/utils';
import type { RecommendedResource, RouteInfo, WeatherInfo } from '@/types';

export async function runResponseCoordinationAgent(incidentId: string) {
  const start = Date.now(); let actId: string|null = null;
  try {
    const act = await prisma.agentActivity.create({ data:{ incidentId, agentName:'Response Coordination Agent', action:'Generating coordinated rescue plan', status:'RUNNING', toolsUsed:JSON.stringify(['get_rescue_plan','generate_rescue_plan']) } });
    actId = act.id;
    const incident = await prisma.incident.findUnique({ where:{id:incidentId}, include:{rescuePlans:{orderBy:{createdAt:'desc'},take:1}} });
    if (!incident) throw new Error('Incident not found');
    const plan = incident.rescuePlans[0];
    if (!plan) throw new Error('No rescue plan — run resource planning first');
    const resources = safeJsonParse<RecommendedResource[]>(plan.resourcesRequired,[]);
    const route = safeJsonParse<RouteInfo>(plan.routeInfo,{});
    const weather = safeJsonParse<WeatherInfo>(plan.weatherInfo,{});
    const result = await generateRescuePlan(
      {id:incident.id,type:incident.type,severity:incident.severity,title:incident.title,description:incident.description},
      {incidentId:incident.id,incidentType:incident.type,priority:incident.severity,recommendedResources:resources.map(r=>({itemId:r.itemId,item:r.item,quantity:r.quantity,reason:r.reason,available:r.available??0,shortfall:r.shortfall??0})),inventoryCheck:'completed',approvalRequired:true,shortage:false,planSummary:plan.summary??'',restockRecommendations:[]},
      {conditions:weather.conditions??'Unknown',alerts:weather.alerts??[]},
      {distance:route.distance??0,duration:route.duration??0,warnings:route.warnings??[]}
    );
    const fp = result.data;
    await prisma.rescuePlan.update({where:{id:plan.id},data:{summary:fp.summary,estimatedTime:fp.estimatedTime,notes:fp.notes,isMock:result.isMock}});
    await prisma.aIAnalysis.create({data:{incidentId,agentName:'Response Coordination Agent',summary:`Rescue plan finalized. Est. ${fp.estimatedTime} min.`,rawOutput:JSON.stringify(fp),modelUsed:result.modelUsed,isMock:result.isMock}});
    await prisma.agentActivity.update({where:{id:actId},data:{status:'COMPLETED',result:JSON.stringify({planId:plan.id,estimatedTime:fp.estimatedTime,isMock:result.isMock}),duration:Date.now()-start}});
  } catch(e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (actId) await prisma.agentActivity.update({where:{id:actId},data:{status:'FAILED',errorMsg:msg,duration:Date.now()-start}}).catch(()=>{});
  }
}

