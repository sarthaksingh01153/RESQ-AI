import { prisma } from '@/lib/prisma';
import { getCurrentWeather } from '@/lib/services/weather.service';
import { getRoute, getNearbyResources, reverseGeocode } from '@/lib/services/maps.service';

const DEPOT_LAT = 28.6139, DEPOT_LON = 77.2090; // Default depot (New Delhi) — configurable

export async function runRoutingAwarenessAgent(incidentId: string) {
  const start = Date.now(); let actId: string|null = null;
  try {
    const act = await prisma.agentActivity.create({ data:{ incidentId, agentName:'Routing & Awareness Agent', action:'Assessing routes and situational awareness', status:'RUNNING', toolsUsed:JSON.stringify(['get_weather','get_route','get_nearby_resources']) } });
    actId = act.id;
    const incident = await prisma.incident.findUnique({where:{id:incidentId}});
    if (!incident) throw new Error('Incident not found');
    const [wRes, rRes, nRes] = await Promise.allSettled([
      getCurrentWeather(incident.latitude,incident.longitude),
      getRoute(DEPOT_LAT,DEPOT_LON,incident.latitude,incident.longitude),
      getNearbyResources(incident.latitude,incident.longitude,100),
    ]);
    const weather = wRes.status==='fulfilled' ? wRes.value : null;
    const route = rRes.status==='fulfilled' ? rRes.value : null;
    if (weather) {
      await prisma.weatherObservation.create({ data:{ incidentId, latitude:incident.latitude, longitude:incident.longitude, temperature:weather.temperature, humidity:weather.humidity, windSpeed:weather.windSpeed, windDir:weather.windDirection, conditions:weather.conditions, precipitation:weather.precipitation, visibility:weather.visibility, alerts:JSON.stringify(weather.alerts), source:weather.source, observedAt:new Date(weather.observedAt) } });
    }
    const plan = await prisma.rescuePlan.findFirst({where:{incidentId},orderBy:{createdAt:'desc'}});
    if (plan) {
      await prisma.rescuePlan.update({ where:{id:plan.id}, data:{ routeInfo:route?JSON.stringify(route):null, weatherInfo:weather?JSON.stringify({temperature:weather.temperature,conditions:weather.conditions,windSpeed:weather.windSpeed,precipitation:weather.precipitation,alerts:weather.alerts,source:weather.source,observedAt:weather.observedAt}):null } });
    }
    if (!incident.address) {
      const addr = await reverseGeocode(incident.latitude,incident.longitude);
      if (addr) await prisma.incident.update({where:{id:incidentId},data:{address:addr}});
    }
    await prisma.agentActivity.update({where:{id:actId},data:{status:'COMPLETED',result:JSON.stringify({weatherAlerts:weather?.alerts?.length??0,routeKm:route?.distance,nearby:nRes.status==='fulfilled'?nRes.value.length:0}),duration:Date.now()-start}});
  } catch(e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (actId) await prisma.agentActivity.update({where:{id:actId},data:{status:'FAILED',errorMsg:msg,duration:Date.now()-start}}).catch(()=>{});
  }
}

