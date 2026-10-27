import { prisma } from '@/lib/prisma';
import { analyzeIncident } from '@/lib/services/ai.service';
import { notifyOfficers } from '@/lib/services/notification.service';

export async function runIncidentAnalysisAgent(incidentId: string) {
  const start = Date.now(); let actId: string|null = null;
  try {
    const act = await prisma.agentActivity.create({ data:{ incidentId, agentName:'Incident Analysis Agent', action:'Analyzing incident report', status:'RUNNING', toolsUsed:JSON.stringify(['get_incident_details','analyze_incident','classify_emergency']) } });
    actId = act.id;
    const incident = await prisma.incident.findUnique({where:{id:incidentId}});
    if (!incident) throw new Error('Incident not found');
    await prisma.incident.update({where:{id:incidentId},data:{status:'UNDER_REVIEW'}});
    await prisma.incidentTimeline.create({data:{incidentId,status:'UNDER_REVIEW',note:'AI analysis initiated',isPublic:true}});
    const result = await analyzeIncident({ type:incident.type, severity:incident.severity, title:incident.title, description:incident.description, latitude:incident.latitude, longitude:incident.longitude, address:incident.address, reporterName:incident.reporterName });
    const a = result.data;
    await prisma.aIAnalysis.create({ data:{ incidentId, agentName:'Incident Analysis Agent', classification:a.classification, severity:a.severity, summary:a.summary, keyFacts:JSON.stringify(a.keyFacts), missingInfo:JSON.stringify(a.missingInfo), duplicateFlag:a.duplicateFlag, priorityReason:a.priorityReason, rawOutput:JSON.stringify(a), modelUsed:result.modelUsed, isMock:result.isMock } });
    if (a.severity && a.severity!==incident.severity) await prisma.incident.update({where:{id:incidentId},data:{severity:a.severity}});
    await notifyOfficers({ title:`New ${incident.type.replace(/_/g,' ')} — ${a.severity}`, message:`${incident.title}: ${a.summary?.slice(0,150)??''}`, type:'INCIDENT', incidentId, link:`/dashboard/incidents/${incidentId}` });
    await prisma.agentActivity.update({where:{id:actId},data:{status:'COMPLETED',result:JSON.stringify({severity:a.severity,isMock:result.isMock}),duration:Date.now()-start}});
  } catch(e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (actId) await prisma.agentActivity.update({where:{id:actId},data:{status:'FAILED',errorMsg:msg,duration:Date.now()-start}}).catch(()=>{});
  }
}

