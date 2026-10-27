import { prisma } from '@/lib/prisma';

export interface NearbyResource {
  id: string; name: string; category: string; availableQty: number;
  locationName: string; latitude: number; longitude: number; distanceKm: number;
}

function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371, dLat = (lat2-lat1)*Math.PI/180, dLon = (lon2-lon1)*Math.PI/180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
  return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
}

export async function reverseGeocode(lat: number, lon: number): Promise<string|null> {
  try {
    const r = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`, {
      headers: {'User-Agent':'RESQ-AI/1.0'}, signal: AbortSignal.timeout(8000),
    });
    const d = await r.json();
    return d.display_name ?? null;
  } catch { return null; }
}

export async function getRoute(fromLat: number, fromLon: number, toLat: number, toLon: number) {
  try {
    const r = await fetch(`https://router.project-osrm.org/route/v1/driving/${fromLon},${fromLat};${toLon},${toLat}?overview=false&alternatives=true`, { signal: AbortSignal.timeout(10000) });
    const d = await r.json();
    if (d.code !== 'Ok' || !d.routes?.length) throw new Error('No route');
    const route = d.routes[0];
    const distKm = route.distance/1000, durMin = route.duration/60;
    const warnings: string[] = [];
    if (durMin > 60) warnings.push('Route >1 hour — consider air support');
    if (distKm > 50) warnings.push('Long distance — fuel planning required');
    return { distance: Math.round(distKm*10)/10, duration: Math.round(durMin), summary: `${Math.round(distKm*10)/10} km, ~${Math.round(durMin)} min`, warnings, alternatives: d.routes.length-1 };
  } catch {
    const d = haversine(fromLat,fromLon,toLat,toLon)*1.3;
    return { distance: Math.round(d*10)/10, duration: Math.round(d*1.5), summary: `~${Math.round(d*10)/10} km (est.)`, warnings: ['Routing unavailable — using estimate'], alternatives: 0 };
  }
}

export async function getNearbyResources(lat: number, lon: number, radiusKm=50): Promise<NearbyResource[]> {
  const locs = await prisma.inventoryLocation.findMany({
    where: { isActive:true, latitude:{not:null}, longitude:{not:null} },
    include: { items: { where:{availableQty:{gt:0},status:'AVAILABLE'}, select:{id:true,name:true,category:true,availableQty:true} } },
  });
  const results: NearbyResource[] = [];
  for (const loc of locs) {
    if (loc.latitude==null||loc.longitude==null) continue;
    const dist = haversine(lat,lon,loc.latitude,loc.longitude);
    if (dist>radiusKm) continue;
    for (const item of loc.items) {
      results.push({ id:item.id, name:item.name, category:item.category, availableQty:item.availableQty, locationName:loc.name, latitude:loc.latitude, longitude:loc.longitude, distanceKm:Math.round(dist*10)/10 });
    }
  }
  return results.sort((a,b)=>a.distanceKm-b.distanceKm);
}

