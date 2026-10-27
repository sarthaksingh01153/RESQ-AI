import { NextRequest, NextResponse } from 'next/server';
import { getCurrentWeather } from '@/lib/services/weather.service';

export async function GET(req: NextRequest) {
  const {searchParams} = new URL(req.url);
  const lat = parseFloat(searchParams.get('lat')||'28.6139');
  const lon = parseFloat(searchParams.get('lon')||'77.2090');
  if (isNaN(lat)||isNaN(lon)) return NextResponse.json({error:'Invalid coords'},{status:400});
  const weather = await getCurrentWeather(lat,lon);
  return NextResponse.json({weather});
}

