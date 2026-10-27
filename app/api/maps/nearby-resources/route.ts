import { NextRequest, NextResponse } from 'next/server';
import { getNearbyResources } from '@/lib/services/maps.service';

export async function GET(req: NextRequest) {
  const {searchParams} = new URL(req.url);
  const lat = parseFloat(searchParams.get('lat')||'28.6139');
  const lon = parseFloat(searchParams.get('lon')||'77.2090');
  const radius = Math.min(200,parseFloat(searchParams.get('radius')||'50'));
  if (isNaN(lat)||isNaN(lon)) return NextResponse.json({error:'Invalid coords'},{status:400});
  const resources = await getNearbyResources(lat,lon,radius);
  return NextResponse.json({resources});
}

